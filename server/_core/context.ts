import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";
import { sdk } from "./sdk";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  let user: any = null;

  try {
    const sessionToken = req.cookies?.[COOKIE_NAME] || req.cookies?.app_session_id;

    if (sessionToken) {
      // 1. ถอดรหัส Session Token จาก Cookie
      const session = await sdk.verifySessionToken(sessionToken);

      if (session && session.openId) {
        // 2. ถ้าเป็นบัญชี Admin บังคับคืนค่า User Object ของ Admin ทันที
        if (session.openId === "fonzo_admin_staff" || session.role === "admin") {
          user = {
            id: 1,
            openId: "fonzo_admin_staff",
            name: "Fonzo Admin",
            email: "admin@fonzoguitar.com",
            role: "admin",
          };
        } else {
          // 3. บัญชีทั่วไป ลองดึงจาก DB หากล้มเหลวให้ใช้ข้อมูลจาก Session
          try {
            user = await db.getUserByOpenId(session.openId);
          } catch (dbError) {
            console.warn("[Context] DB fetch failed, using session payload:", dbError);
            user = {
              openId: session.openId,
              name: session.name || "User",
              email: session.email || "",
              role: session.role || "user",
            };
          }
        }
      }
    }
  } catch (error) {
    console.warn("[Context] Failed to verify session token:", error);
  }

  return {
    req,
    res,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;