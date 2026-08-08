/**
 * Guards the Shopee / Lazada purchase routing.
 *
 * A wrong or malformed listing URL sends a buyer to a dead page, so every
 * curated entry must match the shape of a real listing on the official store
 * (Shopee shop id 602826372, Lazada product permalink), and every product must
 * always resolve to something clickable — a direct listing when we have one,
 * otherwise a store search page.
 */

import { describe, expect, it } from "vitest";
import linkData from "../shared/fonzo/marketplaceLinks.json";
import {
  FACEBOOK_MESSENGER_URL,
  LAZADA_STORE_URL,
  MARKETPLACE_CODES,
  MARKETPLACE_LINK_COUNT,
  SHOPEE_STORE_URL,
  hasMarketplaceListing,
  lazadaSearchUrl,
  marketplaceLinksFor,
  shopeeSearchUrl,
} from "../shared/fonzo/marketplace";

type Entry = { name: string; shopee: string | null; lazada: string | null; confidence: string };
const entries = Object.entries(linkData as Record<string, Entry>);

const SHOPEE_LISTING = /^https:\/\/shopee\.co\.th\/.+-i\.602826372\.\d+$/;
const LAZADA_LISTING = /^https:\/\/www\.lazada\.co\.th\/products\/.+-i\d+(-s\d+)?\.html$/;
const PRODUCT_CODE = /^[GA]\d{4}$/;

describe("marketplace link map", () => {
  it("is keyed by upstream product codes", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [code] of entries) {
      expect(code).toMatch(PRODUCT_CODE);
    }
  });

  it("only stores listing URLs on the official Fonzo stores", () => {
    for (const [code, entry] of entries) {
      if (entry.shopee) {
        expect(entry.shopee, `${code} shopee`).toMatch(SHOPEE_LISTING);
      }
      if (entry.lazada) {
        expect(entry.lazada, `${code} lazada`).toMatch(LAZADA_LISTING);
      }
    }
  });

  it("never keeps an entry without at least one platform", () => {
    for (const [code, entry] of entries) {
      expect(Boolean(entry.shopee || entry.lazada), `${code} has no platform`).toBe(true);
    }
  });

  it("covers both guitars and accessories", () => {
    expect(MARKETPLACE_CODES.some(code => code.startsWith("G"))).toBe(true);
    expect(MARKETPLACE_CODES.some(code => code.startsWith("A"))).toBe(true);
  });

  it("reports a count that matches the buyable entries", () => {
    const buyable = entries.filter(([, entry]) => entry.shopee || entry.lazada).length;
    expect(MARKETPLACE_LINK_COUNT).toBe(buyable);
  });

  it("resolves curated products through the lookup helpers", () => {
    const [code, entry] = entries[0];
    expect(marketplaceLinksFor(code)?.name).toBe(entry.name);
    expect(hasMarketplaceListing(code)).toBe(true);
  });

  it("falls back to store search for unmapped products", () => {
    expect(marketplaceLinksFor("G9999")).toBeNull();
    expect(hasMarketplaceListing("G9999")).toBe(false);
    expect(shopeeSearchUrl("FONZO EJ-14C")).toContain("fonzo_guitar");
    expect(shopeeSearchUrl("FONZO EJ-14C")).toContain("FONZO%20EJ-14C");
    expect(lazadaSearchUrl("FONZO EJ-14C")).toContain("lazada.co.th/catalog");
  });

  it("points the storefront and enquiry links at Fonzo's own accounts", () => {
    expect(SHOPEE_STORE_URL).toBe("https://shopee.co.th/fonzo_guitar");
    expect(LAZADA_STORE_URL).toContain("lazada.co.th/shop/fonzo-guitar");
    expect(FACEBOOK_MESSENGER_URL).toBe("https://m.me/Fonzoguitar");
  });
});
