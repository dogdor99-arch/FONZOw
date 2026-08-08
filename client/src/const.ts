// client/src/const.ts

// Helper function สำหรับสร้าง URL อย่างปลอดภัย ไม่ให้แอปพลิเคชัน crash หากไม่ได้กำหนดค่า Environment Variable
function getSafeOAuthUrl(): string {
  const envUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).toString();
    } catch {
      // หากค่าใน env ไม่ใช่ URL ที่ถูกต้อง ให้ข้ามไปใช้ fallback
    }
  }
  
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  return "https://fonzow.onrender.com";
}

export const OAUTH_PORTAL_URL = getSafeOAuthUrl();

export function startLogin() {
  if (typeof window === "undefined") return;

  try {
    const rawUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || window.location.origin;
    let targetUrl: URL;

    try {
      targetUrl = new URL(rawUrl);
    } catch {
      // กรณี URL ที่ส่งมาฟอร์แมตผิด ให้ Fallback ไปที่หน้าแรกของเว็บตัวเอง
      targetUrl = new URL(window.location.origin);
    }

    window.location.href = targetUrl.toString();
  } catch (error) {
    console.error("Failed to execute startLogin:", error);
    window.location.href = "/";
  }
}