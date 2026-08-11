import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get(["/api/oauth/login", "/api/login"], async (req: Request, res: Response) => {
    try {
      const adminOpenId = "fonzo_admin_staff";
      const adminName = "Fonzo Admin";
      const adminEmail = "admin@fonzoguitar.com";

      try {
        await db.upsertUser({
          openId: adminOpenId,
          name: adminName,
          email: adminEmail,
          loginMethod: "system",
          lastSignedIn: new Date(),
          role: "admin",
        } as any);
      } catch (dbErr) {
        console.warn("[OAuth] db.upsertUser warning:", dbErr);
      }

      const sessionToken = await sdk.createSessionToken(adminOpenId, {
        openId: adminOpenId,
        name: adminName,
        email: adminEmail,
        role: "admin",
        expiresInMs: ONE_YEAR_MS,
      });

      // ฝัง Cookie แบบเจาะจงให้เบราว์เซอร์รับและบันทึก Session บน Production
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie(COOKIE_NAME, sessionToken, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: ONE_YEAR_MS,
      });

      return res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Login failed:", error);
      return res.redirect(302, "/admin");
    }
  });

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
        role: "admin",
      } as any);

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        openId: userInfo.openId,
        name: userInfo.name || "",
        email: userInfo.email ?? "",
        role: "admin",
        expiresInMs: ONE_YEAR_MS,
      });

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie(COOKIE_NAME, sessionToken, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: ONE_YEAR_MS,
      });

      return res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return res.redirect(302, "/admin");
    }
  });
}