/**
 * Streams social thumbnails through this origin.
 *
 * Instagram, Facebook and TikTok CDNs set short-lived signed URLs and, in some
 * regions, hotlink protection that makes `<img src>` fail intermittently. Going
 * through the server gives us a stable, same-origin, cacheable URL and keeps the
 * signed query string off the page.
 *
 * Only the media hosts of the platforms Fonzo publishes on are allowed, so the
 * endpoint can never be used as an open proxy.
 */

import type { Express, Request, Response } from "express";

/** Suffix match against the URL hostname — subdomains are covered. */
const ALLOWED_HOST_SUFFIXES = [
  // TikTok
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokcdn-eu.com",
  "ibyteimg.com",
  "byteoversea.com",
  // Instagram / Facebook
  "cdninstagram.com",
  "fbcdn.net",
  "instagram.com",
  "facebook.com",
  // YouTube
  "ytimg.com",
  "ggpht.com",
  // Marketplaces (banner art on promo tiles)
  "susercontent.com",
  "slatic.net",
  "lazcdn.com",
];

const MAX_BYTES = 8 * 1024 * 1024;
const TIMEOUT_MS = 10_000;

function isAllowed(target: URL): boolean {
  if (target.protocol !== "https:") return false;
  const host = target.hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith(`.${suffix}`));
}

export function registerSocialMediaProxy(app: Express) {
  app.get("/api/social-media", async (req: Request, res: Response) => {
    const raw = typeof req.query.url === "string" ? req.query.url : "";
    if (!raw) {
      res.status(400).json({ error: "Missing url" });
      return;
    }

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      res.status(400).json({ error: "Invalid url" });
      return;
    }

    if (!isAllowed(target)) {
      res.status(403).json({ error: "Host not allowed" });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const upstream = await fetch(target.toString(), {
        signal: controller.signal,
        headers: {
          // Several CDNs 403 requests without a browser-like UA.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (!upstream.ok) {
        res.status(upstream.status === 404 ? 404 : 502).end();
        return;
      }

      const contentType = upstream.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        res.status(415).json({ error: "Not an image" });
        return;
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      if (buffer.byteLength > MAX_BYTES) {
        res.status(413).end();
        return;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", String(buffer.byteLength));
      // Signed CDN URLs expire, so cache for a day rather than immutably.
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.end(buffer);
    } catch (error) {
      console.error("[SocialMedia] proxy failed:", (error as Error).message);
      if (!res.headersSent) res.status(502).json({ error: "Upstream image unavailable" });
    } finally {
      clearTimeout(timer);
    }
  });
}

/** Exported for the router so client code never builds this URL by hand. */
export function socialMediaProxyUrl(absoluteUrl: string | null): string | null {
  if (!absoluteUrl) return null;
  try {
    const target = new URL(absoluteUrl);
    if (!isAllowed(target)) return absoluteUrl;
    return `/api/social-media?url=${encodeURIComponent(target.toString())}`;
  } catch {
    return null;
  }
}
