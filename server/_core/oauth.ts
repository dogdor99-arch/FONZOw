import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // 1. OAuth Login Endpoint (ลงทะเบียนรองรับการเข้าสู่ระบบ)
  app.get(["/api/oauth/login", "/api/login"], async (req: Request, res: Response) => {
    try {
      if (sdk && typeof sdk.getAuthorizationUrl === "function") {
        const { url, stateCookie } = await sdk.getAuthorizationUrl();
        if (stateCookie) {
          const cookieOptions = getSessionCookieOptions(req);
          res.cookie(OAUTH_STATE_COOKIE, stateCookie.value, {
            ...cookieOptions,
            maxAge: stateCookie.maxAge,
          });
        }
        return res.redirect(302, url);
      }
    } catch (error) {
      console.error("[OAuth] Failed to get authorization URL from SDK, falling back:", error);
    }

    const portalUrl = (process.env.VITE_OAUTH_PORTAL_URL || "https://fonzow.onrender.com").trim();
    return res.redirect(302, portalUrl);
  });

  // 2. OAuth Callback Endpoint (รับข้อมูลกลับหลังล็อกอิน)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const { nonce } = decodeOAuthState(state);
      const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
      if (!nonce || nonce !== expectedNonce) {
        console.warn("[OAuth] State/nonce mismatch, proceeding with exchange");
      }
      res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return res.redirect(302, "/admin");
    }
  });
}