import { createHash } from "node:crypto";
import { ENV } from "./_core/env";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function getConfig() {
  const cloudName = ENV.cloudinaryCloudName;
  const apiKey = ENV.cloudinaryApiKey;
  const apiSecret = ENV.cloudinaryApiSecret;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary config missing: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET");
  }
  return { cloudName, apiKey, apiSecret };
}

export async function uploadImageToCloudinary(base64: string, contentType: string, folder: string) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const rawBase64 = base64.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(rawBase64, "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Image must be smaller than 8MB");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");
  const body = new FormData();
  body.set("file", new Blob([buffer], { type: contentType }), `upload.${contentType.split("/")[1] ?? "jpg"}`);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: "POST", body });
  const result = await response.json().catch(() => ({})) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) {
    throw new Error(`Cloudinary upload failed (${response.status}): ${result.error?.message ?? "no secure URL returned"}`);
  }
  return result.secure_url;
}
