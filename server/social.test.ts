/**
 * Unit coverage for the social feed plumbing.
 *
 * The network-dependent tiers (oEmbed, Open Graph) are not exercised here — they
 * belong to third-party services. What is asserted is everything the site's
 * correctness actually rests on: platform detection, URL normalisation (which
 * drives dedupe), the image-proxy allow-list, and the embed route builders.
 */

import { describe, expect, it } from "vitest";
import {
  detectPlatform,
  normaliseUrl,
  youtubeId,
  socialTokenStatus,
} from "./_core/socialOembed";
import { socialMediaProxyUrl } from "./_core/socialMedia";

describe("detectPlatform", () => {
  it("classifies every channel Fonzo publishes on", () => {
    expect(detectPlatform("https://www.instagram.com/p/DXZFeUbFGnp/")).toBe("instagram");
    expect(detectPlatform("https://www.instagram.com/reel/DNcnOt_SB_N/")).toBe("instagram");
    expect(
      detectPlatform("https://www.tiktok.com/@fonzoguitaroffical/video/7664185754427362567"),
    ).toBe("tiktok");
    expect(detectPlatform("https://www.facebook.com/Fonzoguitar/videos/1411611653717096/")).toBe(
      "facebook",
    );
    expect(detectPlatform("https://fb.watch/abc123/")).toBe("facebook");
    expect(detectPlatform("https://www.youtube.com/watch?v=Wup2Yizu-c4")).toBe("youtube");
    expect(detectPlatform("https://youtu.be/Wup2Yizu-c4")).toBe("youtube");
    expect(detectPlatform("https://shopee.co.th/fonzo_guitar")).toBe("shopee");
    expect(detectPlatform("https://www.lazada.co.th/shop/fonzo-guitar/")).toBe("lazada");
  });

  it("falls back to site for anything else, including malformed input", () => {
    expect(detectPlatform("https://www.fonzoguitar.com/home")).toBe("site");
    expect(detectPlatform("not a url")).toBe("site");
  });
});

describe("normaliseUrl", () => {
  it("strips share tracking so the same post dedupes to one tile", () => {
    const withTracking =
      "https://www.instagram.com/p/DXZFeUbFGnp/?igsh=abc123&img_index=2#comments";
    expect(normaliseUrl(withTracking)).toBe("https://www.instagram.com/p/DXZFeUbFGnp/");
  });

  it("strips TikTok share params", () => {
    const shared =
      "https://www.tiktok.com/@fonzoguitaroffical/video/7664185754427362567?_r=1&_t=ZS-abc&is_from_webapp=1";
    expect(normaliseUrl(shared)).toBe(
      "https://www.tiktok.com/@fonzoguitaroffical/video/7664185754427362567",
    );
  });

  it("keeps meaningful query params such as the YouTube video id", () => {
    expect(normaliseUrl("https://www.youtube.com/watch?v=Wup2Yizu-c4&si=xyz")).toBe(
      "https://www.youtube.com/watch?v=Wup2Yizu-c4",
    );
  });

  it("returns malformed input untouched instead of throwing", () => {
    expect(normaliseUrl("://broken")).toBe("://broken");
  });
});

describe("youtubeId", () => {
  it("recovers the id from every YouTube URL shape", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=Wup2Yizu-c4")).toBe("Wup2Yizu-c4");
    expect(youtubeId("https://youtu.be/Wup2Yizu-c4")).toBe("Wup2Yizu-c4");
    expect(youtubeId("https://www.youtube.com/shorts/Wup2Yizu-c4")).toBe("Wup2Yizu-c4");
    expect(youtubeId("https://www.youtube.com/embed/Wup2Yizu-c4")).toBe("Wup2Yizu-c4");
  });

  it("returns null when there is no id", () => {
    expect(youtubeId("https://www.youtube.com/@fonzoguitar")).toBeNull();
  });
});

describe("socialMediaProxyUrl", () => {
  it("routes allow-listed CDN hosts through this origin", () => {
    const proxied = socialMediaProxyUrl(
      "https://p16-common-sign.tiktokcdn.com/tos-alisg-p-0037/abc~tplv.image",
    );
    expect(proxied).toMatch(/^\/api\/social-media\?url=/);
    expect(proxied).toContain(encodeURIComponent("tiktokcdn.com"));
  });

  it("covers Instagram, Facebook and YouTube media hosts", () => {
    for (const host of [
      "https://scontent-sin11-1.cdninstagram.com/v/t51.jpg",
      "https://scontent-sin6-3.xx.fbcdn.net/v/t15.jpg",
      "https://i.ytimg.com/vi/Wup2Yizu-c4/hqdefault.jpg",
    ]) {
      expect(socialMediaProxyUrl(host)).toMatch(/^\/api\/social-media\?url=/);
    }
  });

  it("leaves non-listed hosts as direct URLs rather than proxying arbitrary origins", () => {
    const external = "https://example.com/photo.jpg";
    expect(socialMediaProxyUrl(external)).toBe(external);
  });

  it("handles null and malformed input", () => {
    expect(socialMediaProxyUrl(null)).toBeNull();
    expect(socialMediaProxyUrl("://broken")).toBeNull();
  });
});

describe("socialTokenStatus", () => {
  it("reports a boolean per credentialed integration", () => {
    const status = socialTokenStatus();
    expect(status).toHaveProperty("instagram");
    expect(status).toHaveProperty("facebook");
    // TikTok's Display API needs app review, so it is never auto-enabled.
    expect(status.tiktok).toBe(false);
  });
});
