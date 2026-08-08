/**
 * Fonzo legacy content API client.
 *
 * The original fonzoguitar.com website is backed by a REST service that exposes
 * catalog + editorial content. All product data, specifications, images, gallery
 * albums and dealer information on this site are sourced from it.
 *
 * Everything is fetched server-side and cached in-memory so the browser never
 * talks to the legacy host directly (avoids CORS + mixed-content issues and
 * keeps response times low).
 */

export const FONZO_API_BASE = "https://rvscs-prod.com/guitar-service/";

type CacheEntry = { value: unknown; expiresAt: number };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

/** 30 minutes — legacy catalog changes rarely. */
const DEFAULT_TTL_MS = 30 * 60 * 1000;

function cacheKey(endpoint: string, payload: Record<string, unknown>) {
  return `${endpoint}::${JSON.stringify(payload)}`;
}

async function rawPost(endpoint: string, payload: Record<string, unknown>): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(FONZO_API_BASE + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Fonzo API ${endpoint} returned HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** POST to the legacy API with in-memory caching + request de-duplication. */
export async function fonzoPost<T = unknown>(
  endpoint: string,
  payload: Record<string, unknown> = {},
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const key = cacheKey(endpoint, payload);
  const now = Date.now();

  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const task = rawPost(endpoint, payload)
    .then(value => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .catch(error => {
      // Serve stale data rather than breaking the page.
      if (hit) {
        console.warn(`[FonzoAPI] ${endpoint} failed, serving stale cache:`, error);
        return hit.value;
      }
      throw error;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, task);
  return task as Promise<T>;
}

type Envelope = {
  data?: unknown;
};

/** The legacy API returns either `{data:{result:[...]}}` or `{data:[...]}`. */
export function unwrapRows<T = Record<string, unknown>>(payload: unknown): T[] {
  const data = (payload as Envelope | undefined)?.data;
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const result = (data as { result?: unknown }).result;
    if (Array.isArray(result)) return result as T[];
  }
  return [];
}

/** Build an absolute media URL for a legacy relative asset path. */
export function fonzoMediaUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  return FONZO_API_BASE + relativePath.replace(/^\/+/, "");
}

/** Proxy URL served by this app (see server/_core/index.ts media route). */
export function mediaProxyUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  return `/api/fonzo-media/${relativePath.replace(/^\/+/, "")}`;
}

/**
 * Legacy detail text is stored as `TH: ...<br />ENG: ...` in a single column.
 * Split it into a language map, falling back to the raw string.
 */
export function splitBilingual(raw: string | null | undefined): { th: string; en: string } {
  const value = (raw ?? "").trim();
  if (!value) return { th: "", en: "" };

  const parts = value
    .split(/<br\s*\/?>/i)
    .map(part => part.trim())
    .filter(Boolean);

  let th = "";
  let en = "";
  for (const part of parts) {
    const thMatch = part.match(/^TH\s*:\s*(.*)$/i);
    const enMatch = part.match(/^(?:ENG|EN)\s*:\s*(.*)$/i);
    if (thMatch) th = thMatch[1].trim();
    else if (enMatch) en = enMatch[1].trim();
    else if (!th) th = part;
  }

  if (!th && !en) return { th: value, en: value };
  return { th: th || en, en: en || th };
}

export function clearFonzoCache() {
  cache.clear();
}
