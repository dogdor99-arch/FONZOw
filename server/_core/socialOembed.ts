/**
 * Resolves a social post URL into the pieces the site needs to render a feed
 * tile: a thumbnail, a caption, the author and a canonical permalink.
 *
 * Three tiers, tried in order, so the feed degrades instead of breaking:
 *
 * 1. **Provider oEmbed** — TikTok and YouTube serve oEmbed with no credentials.
 *    Instagram and Facebook retired their public endpoints, so their oEmbed is
 *    only attempted when an app token is configured.
 * 2. **Open Graph tags** — a plain HTML fetch of the permalink. Instagram and
 *    Facebook still emit `og:image` for public posts, which is enough for a tile.
 * 3. **Deterministic fallback** — a derived thumbnail URL (YouTube) or null,
 *    letting the UI fall back to a typographic tile.
 *
 * Results are cached in-process because feed tiles are read on every homepage
 * visit while the underlying posts change at most a few times a week.
 */

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "shopee"
  | "lazada"
  | "site";

export type ResolvedPost = {
  /** Canonical permalink, normalised (tracking params stripped). */
  url: string;
  platform: SocialPlatform;
  /** Absolute thumbnail URL, or null when the provider gives us nothing. */
  thumbnailUrl: string | null;
  /** Caption or video title, trimmed to a tile-friendly length. */
  title: string | null;
  authorName: string | null;
  /** Provider embed HTML when available — used by the lightbox, never rendered blind. */
  html: string | null;
  /** Where the metadata came from, surfaced in the admin UI for debugging. */
  source: "oembed" | "opengraph" | "derived" | "none";
  /** True when the media is a video/reel rather than a still image. */
  isVideo: boolean;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";
/**
 * Instagram and Facebook serve a login wall to normal browser agents but still
 * emit full Open Graph tags to link-preview crawlers — which is exactly the data
 * a feed tile needs, and exactly what those tags are published for.
 */
const CRAWLER_UA = "facebookexternalhit/1.1";

function userAgentFor(platform: SocialPlatform): string {
  return platform === "instagram" || platform === "facebook" ? CRAWLER_UA : BROWSER_UA;
}

const cache = new Map<string, { value: ResolvedPost; expires: number }>();

/** Tokens are optional; when absent we simply skip the credentialed tiers. */
const IG_TOKEN = process.env.IG_ACCESS_TOKEN || process.env.FB_APP_ACCESS_TOKEN || "";
const FB_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || process.env.FB_APP_ACCESS_TOKEN || "";

export function detectPlatform(rawUrl: string): SocialPlatform {
  let host = "";
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "site";
  }
  if (host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("tiktok.com")) return "tiktok";
  if (host.endsWith("facebook.com") || host.endsWith("fb.watch")) return "facebook";
  if (host.endsWith("youtube.com") || host.endsWith("youtu.be")) return "youtube";
  if (host.endsWith("shopee.co.th")) return "shopee";
  if (host.endsWith("lazada.co.th")) return "lazada";
  return "site";
}

/** Strips the share/tracking noise so the same post is cached once. */
export function normaliseUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const strip = [
      "igsh",
      "igshid",
      "img_index",
      "_r",
      "_t",
      "is_from_webapp",
      "sender_device",
      "web_id",
      "refer",
      "fbclid",
      "mibextid",
      "rdid",
      "si",
      "feature",
    ];
    strip.forEach(key => url.searchParams.delete(key));
    url.hash = "";
    return url.toString().replace(/\?$/, "");
  } catch {
    return rawUrl;
  }
}

/** YouTube ids are recoverable from the URL, so thumbnails need no network call. */
export function youtubeId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.endsWith("youtu.be")) return url.pathname.slice(1).split("/")[0] || null;
    const v = url.searchParams.get("v");
    if (v) return v;
    const match = url.pathname.match(/\/(embed|shorts|live)\/([\w-]+)/);
    return match?.[2] ?? null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

type OembedPayload = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  html?: string;
  type?: string;
};

function oembedEndpoint(platform: SocialPlatform, url: string): string | null {
  const encoded = encodeURIComponent(url);
  switch (platform) {
    case "tiktok":
      return `https://www.tiktok.com/oembed?url=${encoded}`;
    case "youtube":
      return `https://www.youtube.com/oembed?format=json&url=${encoded}`;
    case "instagram":
      // The public api.instagram.com endpoint is retired; Graph needs a token.
      return IG_TOKEN
        ? `https://graph.facebook.com/v21.0/instagram_oembed?url=${encoded}&access_token=${IG_TOKEN}&omitscript=true`
        : null;
    case "facebook":
      return FB_TOKEN
        ? `https://graph.facebook.com/v21.0/oembed_post?url=${encoded}&access_token=${FB_TOKEN}&omitscript=true`
        : null;
    default:
      return null;
  }
}

function decodeEntities(value: string): string {
  return value
    // Instagram/Facebook encode Thai text as numeric character references, so a
    // named-entity-only pass would leave captions full of `&#xe1a;` noise.
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/**
 * Meta titles arrive wrapped in provider boilerplate — `Fonzo Guitar on
 * Instagram: "…"` or `… | TikTok`. Tiles show the caption itself, so the
 * wrapper is peeled off before trimming.
 */
function unwrapProviderTitle(value: string): string {
  let text = value.trim();
  const onPlatform = text.match(
    /^[\s\S]{1,60}?\s+(?:on|บน)\s+(?:Instagram|Facebook|TikTok)\s*[::]\s*([\s\S]*)$/i,
  );
  if (onPlatform?.[1]) text = onPlatform[1].trim();
  text = text
    .replace(/\s*[|｜]\s*(?:TikTok|Instagram|Facebook)\s*$/i, "")
    .replace(/\s*[|｜]\s*Fonzo Guitar\s*$/i, "")
    .trim();
  /**
   * Facebook video titles lead with engagement counts, e.g.
   * `2.3K views · 30 reactions | <caption> | Fonzo Guitar`. Those numbers are
   * stale the moment they are cached, so every leading segment that reads as a
   * metric is dropped until the caption itself is left.
   */
  const METRIC_SEGMENT =
    /^(?:ยอดดู|ผู้ชม)?\s*[\d.,]+\s*(?:K|M|พัน|หมื่น|ล้าน)?\s*(?:views?|reactions?|comments?|shares?|likes?|ครั้ง|ความรู้สึก|ความคิดเห็น|การแชร์|คน)?\s*$/i;
  const [head, ...rest] = text.split(/\s*[|｜]\s*/);
  if (rest.length > 0 && head.split(/\s*[·•]\s*/).every(part => METRIC_SEGMENT.test(part.trim()))) {
    text = rest.join(" | ").trim();
  }
  // Drop the surrounding quotes providers add around the caption.
  text = text.replace(/^["“”']([\s\S]*)["“”']$/, "$1").trim();
  return text;
}

function metaTag(html: string, property: string): string | null {
  // Attribute order varies per provider, so match either ordering.
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return null;
}

async function fromOpenGraph(
  url: string,
  platform: SocialPlatform,
): Promise<Partial<ResolvedPost> | null> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": userAgentFor(platform),
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "th,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!response.ok) return null;

    // Cap the read: OG tags live in <head>, and post pages can be megabytes.
    const html = (await response.text()).slice(0, 400_000);
    const image = metaTag(html, "og:image") || metaTag(html, "twitter:image");
    const title =
      metaTag(html, "og:title") ||
      metaTag(html, "twitter:title") ||
      metaTag(html, "og:description");
    const type = metaTag(html, "og:type") || "";

    if (!image && !title) return null;
    return {
      thumbnailUrl: image ?? null,
      title: title ?? null,
      isVideo: /video/i.test(type),
    };
  } catch {
    return null;
  }
}

function trimTitle(value: string | null | undefined): string | null {
  if (!value) return null;
  const clean = unwrapProviderTitle(decodeEntities(value)).replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length > 180 ? `${clean.slice(0, 177)}…` : clean;
}

/**
 * Resolves one post. Never throws — an unresolvable URL still returns a record
 * so the caller can render a link-only tile.
 */
export async function resolveSocialPost(rawUrl: string): Promise<ResolvedPost> {
  const url = normaliseUrl(rawUrl);
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) return cached.value;

  const platform = detectPlatform(url);
  const result: ResolvedPost = {
    url,
    platform,
    thumbnailUrl: null,
    title: null,
    authorName: null,
    html: null,
    source: "none",
    isVideo: platform === "tiktok" || platform === "youtube",
  };

  const endpoint = oembedEndpoint(platform, url);
  if (endpoint) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        headers: { Accept: "application/json", "User-Agent": BROWSER_UA },
      });
      if (response.ok) {
        const payload = (await response.json()) as OembedPayload;
        result.thumbnailUrl = payload.thumbnail_url ?? null;
        result.title = trimTitle(payload.title);
        result.authorName = payload.author_name ?? null;
        result.html = payload.html ?? null;
        if (payload.type) result.isVideo = payload.type === "video";
        if (result.thumbnailUrl || result.title) result.source = "oembed";
      }
    } catch {
      // fall through to Open Graph
    }
  }

  if (!result.thumbnailUrl) {
    const og = await fromOpenGraph(url, platform);
    if (og) {
      result.thumbnailUrl = og.thumbnailUrl ?? result.thumbnailUrl;
      result.title = result.title ?? trimTitle(og.title);
      if (og.isVideo) result.isVideo = true;
      if (result.thumbnailUrl) result.source = "opengraph";
    }
  }

  if (!result.thumbnailUrl && platform === "youtube") {
    const id = youtubeId(url);
    if (id) {
      result.thumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      result.source = "derived";
    }
  }

  cache.set(url, { value: result, expires: Date.now() + CACHE_TTL_MS });
  return result;
}

/** Resolves many posts concurrently, preserving input order. */
export async function resolveSocialPosts(urls: string[]): Promise<ResolvedPost[]> {
  return Promise.all(urls.map(url => resolveSocialPost(url)));
}

/** Reports which credentialed integrations are live, for the admin panel. */
export function socialTokenStatus() {
  return {
    instagram: Boolean(IG_TOKEN),
    facebook: Boolean(FB_TOKEN),
    tiktok: false, // TikTok Display API requires app review; oEmbed only for now.
  } as const;
}

/** Test seam: lets specs assert cold-path behaviour. */
export function clearSocialCache() {
  cache.clear();
}
