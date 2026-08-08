import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicCtx(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

/**
 * These specs hit the upstream legacy catalogue service, so they are the slow
 * part of the suite. They guard the shape our UI depends on: every card needs a
 * code, a display name and a proxied image path.
 */
describe("fonzo catalogue", () => {
  const caller = appRouter.createCaller(publicCtx());

  it("returns the full guitar catalogue with proxied media", async () => {
    const guitars = await caller.fonzo.guitars.list();

    expect(guitars.length).toBeGreaterThan(100);
    guitars.slice(0, 20).forEach(guitar => {
      expect(guitar.code).toMatch(/^G\d+$/);
      expect(guitar.name.length).toBeGreaterThan(0);
      if (guitar.image) expect(guitar.image.startsWith("/api/fonzo-media/")).toBe(true);
      // Price is either a positive number or null (enquiry-only models).
      if (guitar.price !== null) expect(guitar.price).toBeGreaterThan(0);
    });
  }, 60_000);

  it("exposes guitar types with non-zero counts", async () => {
    const types = await caller.fonzo.guitars.types();

    expect(types.length).toBeGreaterThan(0);
    types.forEach(type => {
      expect(type.code).toMatch(/^GT\d+$/);
      expect(type.count).toBeGreaterThan(0);
    });
  }, 60_000);

  it("returns accessories and their categories", async () => {
    const [accessories, types] = await Promise.all([
      caller.fonzo.accessories.list(),
      caller.fonzo.accessories.types(),
    ]);

    expect(accessories.length).toBeGreaterThan(50);
    expect(types.length).toBeGreaterThan(0);
    // Every accessory must belong to a known category.
    const known = new Set(types.map(type => type.code));
    accessories
      .filter(item => item.typeCode)
      .slice(0, 30)
      .forEach(item => expect(known.has(item.typeCode!)).toBe(true));
  }, 60_000);

  it("returns founder and brand story articles for both locales", async () => {
    const [founder, brandStory] = await Promise.all([
      caller.fonzo.content.founder(),
      caller.fonzo.content.brandStory(),
    ]);

    [founder, brandStory].forEach(articles => {
      expect(articles.length).toBeGreaterThan(0);
      articles.forEach(article => expect(article.html.length).toBeGreaterThan(50));
      expect(articles.some(article => article.locale === "th")).toBe(true);
    });
  }, 60_000);

  it("returns gallery albums and their media items", async () => {
    const albums = await caller.fonzo.gallery.albums();
    expect(albums.length).toBeGreaterThan(0);

    const items = await caller.fonzo.gallery.items({ albumCode: albums[0].code });
    expect(items.length).toBeGreaterThan(0);
    items.slice(0, 10).forEach(item => {
      expect(item.url.startsWith("/api/fonzo-media/")).toBe(true);
      expect(["Image", "Video"]).toContain(item.type);
    });
  }, 60_000);

  it("returns price bands ordered for the filter UI", async () => {
    const bands = await caller.fonzo.content.priceBands();

    expect(bands.length).toBeGreaterThan(0);
    bands.forEach(band => expect(band.end).toBeGreaterThan(band.start));
  }, 60_000);

  it("resolves a single guitar by code with detail fields", async () => {
    const guitars = await caller.fonzo.guitars.list();
    const target = guitars.find(guitar => guitar.price !== null) ?? guitars[0];

    const detail = await caller.fonzo.guitars.byCode({ code: target.code });

    expect(detail).not.toBeNull();
    expect(detail!.code).toBe(target.code);
    expect(Array.isArray(detail!.images)).toBe(true);
    expect(Array.isArray(detail!.specs)).toBe(true);
  }, 60_000);
});
