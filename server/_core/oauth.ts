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
  // Direct Login Endpoint สำหรับทีมงาน
  app.get(["/api/oauth/login", "/api/login"], async (req: Request, res: Response) => {
    try {
      const adminOpenId = "fonzo_admin_staff";
      const adminName = "Fonzo Admin";
      const adminEmail = "admin@fonzoguitar.com";

      // 1. บันทึก/อัปเดตผู้ใช้ผ่าน Drizzle ORM
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

      // 2. สร้าง Session Token โดยส่ง Payload ครบถ้วน (แก้ปัญหา Payload missing)
      const sessionToken = await sdk.createSessionToken(adminOpenId, {
        openId: adminOpenId,
        name: adminName,
        email: adminEmail,
        role: "admin",
        expiresInMs: ONE_YEAR_MS,
      });

      // 3. ฝัง Session Cookie ให้เบราว์เซอร์
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        path: "/",
        maxAge: ONE_YEAR_MS,
      });

      // 4. พาไปที่หน้าจัดการร้าน /admin
      return res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Login failed:", error);
      return res.redirect(302, "/admin");
    }
  });

  // Callback Endpoint
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

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        path: "/",
        maxAge: ONE_YEAR_MS,
      });

      return res.redirect(302, "/admin");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return res.redirect(302, "/admin");
    }
  });
}