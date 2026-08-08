import type { Express, Request, Response } from "express";
import { FONZO_API_BASE } from "./fonzoApi";

/** Only these legacy asset folders may be proxied. */
const ALLOWED_PREFIXES = [
  "guitar_img/",
  "guitar_type/",
  "accessories_img/",
  "accessories_type/",
  "album_img/",
  "album_video/",
  "about_us/",
  "brand_story/",
  "catalog/",
  "promotion/",
  "language/",
  "banner/",
];

/**
 * Streams legacy Fonzo media (product photography, gallery assets, catalog PDFs)
 * through this origin so the browser gets same-origin, cacheable URLs.
 */
export function registerFonzoMediaProxy(app: Express) {
  app.get(/^\/api\/fonzo-media\/(.+)$/, async (req: Request, res: Response) => {
    const relative = decodeURIComponent((req.params as unknown as string[])[0] ?? "");

    if (!relative || relative.includes("..") || !ALLOWED_PREFIXES.some(p => relative.startsWith(p))) {
      res.status(400).json({ error: "Invalid media path" });
      return;
    }

    try {
      const upstream = await fetch(FONZO_API_BASE + relative, {
        headers: req.headers.range ? { Range: String(req.headers.range) } : undefined,
      });

      if (!upstream.ok || !upstream.body) {
        res.status(upstream.status || 502).end();
        return;
      }

      const contentType = upstream.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      const contentLength = upstream.headers.get("content-length");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      const acceptRanges = upstream.headers.get("accept-ranges");
      if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);
      const contentRange = upstream.headers.get("content-range");
      if (contentRange) {
        res.setHeader("Content-Range", contentRange);
        res.status(206);
      }
      res.setHeader("Cache-Control", "public, max-age=604800, immutable");

      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.end(buffer);
    } catch (error) {
      console.error("[FonzoMedia] proxy failed:", error);
      if (!res.headersSent) res.status(502).json({ error: "Upstream media unavailable" });
    }
  });
}
