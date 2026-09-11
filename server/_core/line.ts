import { ENV } from "./env";

export type LineLeadPayload = {
  productCode?: string | null;
  productName?: string | null;
  pageUrl?: string | null;
};

/**
 * Sends a short lead notification through LINE Messaging API.
 * The token is read only on the server and is never returned to the browser.
 * It is intentionally best-effort: missing LINE configuration must not block a customer.
 */
export async function notifyLineLead(payload: LineLeadPayload): Promise<boolean> {
  if (!ENV.lineChannelAccessToken || !ENV.lineRecipientId) return false;

  const lines = [
    "มีลูกค้าสนใจสั่งซื้อโดยตรงผ่านเว็บไซต์ Fonzo",
    payload.productName ? `สินค้า: ${payload.productName}` : null,
    payload.productCode ? `รหัส: ${payload.productCode}` : null,
    payload.pageUrl ? `หน้าเว็บ: ${payload.pageUrl}` : null,
    `เวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`,
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        authorization: `Bearer ${ENV.lineChannelAccessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: ENV.lineRecipientId,
        messages: [{ type: "text", text: lines.slice(0, 5000) }],
      }),
    });

    if (!response.ok) {
      console.warn(`[LINE] Push notification failed (${response.status})`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[LINE] Push notification error:", error);
    return false;
  }
}
