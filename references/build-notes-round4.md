# Round 4 — social image feed (Instagram / TikTok / Facebook / YouTube)

## What was built
- `server/_core/socialOembed.ts` — three-tier resolver: provider oEmbed → Open Graph → derived.
  Uses `facebookexternalhit/1.1` UA for Instagram/Facebook (normal browser UA hits a login wall;
  the crawler UA gets full og: tags). 30-minute in-process cache. Tokens optional:
  `IG_ACCESS_TOKEN`, `IG_USER_ID`, `FB_PAGE_ACCESS_TOKEN`, `FB_PAGE_ID`, `FB_APP_ACCESS_TOKEN`.
- `server/_core/socialMedia.ts` — `/api/social-media?url=` image proxy, host allow-list only
  (tiktokcdn, cdninstagram, fbcdn, ytimg, susercontent, slatic...), 8MB cap, 1-day cache.
  Exports `socialMediaProxyUrl()`.
- `server/routers/social.ts` — `social.feed` (curated posts + live account media, deduped by
  normalised URL, pinned first then chronological), `social.status`, `social.preview` (admin),
  `social.detect` (admin). Registered as `social` in `server/routers.ts`.
- `client/src/components/site/SocialGrid.tsx` — square mosaic, platform filter chips, video badge,
  hover caption veil, in-place lightbox using official embeds, follow row. Placed on Home
  (limit 12, after NewsroomFeed) and Gallery (limit 8, before lightbox).
- `PostEmbed.tsx` — added Instagram embed route `instagram.com/p/<shortcode>/embed/captioned/`.

## Verified (2026-08-08)
All 7 seeded posts resolve a thumbnail through the proxy with HTTP 200:
tiktok png 614KB / instagram jpeg 92KB / tiktok png 514KB / facebook jpeg 432KB /
instagram jpeg 32KB / youtube jpeg 41KB / instagram jpeg 46KB.
`social.status` → all tokens false (curated + OG tier only, as expected).

## Seeded posts (socialPosts table, ids 1-7)
See `references/social-feeds.md` for the source URLs and dates.

