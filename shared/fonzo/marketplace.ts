import linkData from "./marketplaceLinks.json";

/**
 * Per-model links to the official Fonzo storefronts on Shopee and Lazada.
 *
 * Fonzo sells through marketplaces rather than a self-hosted checkout: buyers
 * get familiar payment methods, order tracking and buyer protection there, and
 * the showroom team already fulfils from the same stock. The website therefore
 * routes every purchase intent out to the matching marketplace listing.
 *
 * Keys are the upstream product codes (e.g. `G0051`). Entries are curated —
 * a missing platform means no verified listing was found for that model, in
 * which case the UI falls back to the store search page plus a Facebook
 * enquiry, never a broken product URL.
 */
export type MarketplaceLink = {
  name: string;
  shopee: string | null;
  lazada: string | null;
  /** How strongly the listing was matched to this model. */
  confidence: string;
};

const LINKS = linkData as Record<string, MarketplaceLink>;

export const SHOPEE_STORE_URL = "https://shopee.co.th/fonzo_guitar";
export const LAZADA_STORE_URL =
  "https://www.lazada.co.th/shop/fonzo-guitar/?q=All-Products&from=wangpu&langFlag=th&pageTypeId=2";
export const FACEBOOK_PAGE_URL = "https://www.facebook.com/Fonzoguitar/";
export const FACEBOOK_MESSENGER_URL = "https://m.me/Fonzoguitar";

/** Search within the official Shopee store for a model name. */
export function shopeeSearchUrl(keyword: string): string {
  return `https://shopee.co.th/fonzo_guitar?shopCollection=&keyword=${encodeURIComponent(keyword)}`;
}

/** Search the Fonzo catalogue on Lazada for a model name. */
export function lazadaSearchUrl(keyword: string): string {
  return `https://www.lazada.co.th/catalog/?q=${encodeURIComponent(`fonzo ${keyword}`)}`;
}

/** Direct listing links for a product code, when curated. */
export function marketplaceLinksFor(code: string): MarketplaceLink | null {
  return LINKS[code] ?? null;
}

/** Whether this product has at least one verified marketplace listing. */
export function hasMarketplaceListing(code: string): boolean {
  const entry = LINKS[code];
  return Boolean(entry && (entry.shopee || entry.lazada));
}

/** Number of products that resolve to at least one verified marketplace listing. */
export const MARKETPLACE_LINK_COUNT = Object.values(LINKS).filter(
  entry => entry.shopee || entry.lazada,
).length;

export const MARKETPLACE_CODES = Object.keys(LINKS);
