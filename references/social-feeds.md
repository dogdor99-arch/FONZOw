# Fonzo social feeds — research notes

## Official accounts
| Platform | Handle | URL |
|---|---|---|
| Instagram | @fonzoguitar | https://www.instagram.com/fonzoguitar/ (341 posts, "Fonzo Official Account", Bangkok) |
| TikTok | @fonzoguitaroffical | https://www.tiktok.com/@fonzoguitaroffical |
| Facebook | Fonzoguitar | https://www.facebook.com/Fonzoguitar/ |
| YouTube | Fonzo Guitar | see BRAND.contact |
| Shopee | fonzo_guitar | https://shopee.co.th/fonzo_guitar |
| Lazada | fonzo-guitar | https://www.lazada.co.th/shop/fonzo-guitar/ |

Related (owner's personal shop account, not the brand): TikTok @birdguitarist.

## oEmbed feasibility (tested 2026-08-08)
- **TikTok oEmbed** — `https://www.tiktok.com/oembed?url=<post or profile url>` works with **no token**.
  Returns `title`, `author_name`, `author_url`, `thumbnail_url` (for videos) and `html` (blockquote +
  embed script). Profile URLs return a creator-embed blockquote without a thumbnail.
- **TikTok profile scraping** — blocked. Fetching `https://www.tiktok.com/@fonzoguitaroffical`
  returns a captcha page (12KB, contains `captcha`, no `itemList`/`SIGI_STATE`). Cannot list videos.
- **Instagram oEmbed** — `api.instagram.com/oembed` is **retired**; returns empty. The replacement
  (`graph.facebook.com/v*/instagram_oembed`) requires an app access token.
- **Facebook oEmbed** — same: `graph.facebook.com/v*/oembed_post` requires an app access token.

### Conclusion
Automatic "latest feed" retrieval is only possible with tokens:
- Instagram: Instagram Basic Display API / Instagram Graph API (business account) → `/me/media`
- Facebook Page: Page Access Token → `/{page-id}/posts` or `/{page-id}/photos`
- TikTok: TikTok for Developers (Display API) → requires app review

Without tokens the working approach is curated post URLs + oEmbed/thumbnail resolution, which is
what `server/_core/socialOembed.ts` implements. Env vars reserved for the upgrade path:
`IG_ACCESS_TOKEN`, `FB_PAGE_ACCESS_TOKEN`, `FB_PAGE_ID`, `IG_USER_ID`.

## Verified recent posts (from search index, 2026-08-08)
### TikTok @fonzoguitaroffical
- https://www.tiktok.com/@fonzoguitaroffical/video/7664185754427362567 — "Fonzo V-200C SJ Full Body" (2026-07-19)
- https://www.tiktok.com/@fonzoguitaroffical/video/7663070350988610834 — "Fonzo V-34S OM Full Body" (2026-07-16)

### Instagram @fonzoguitar
- https://www.instagram.com/p/DXZFeUbFGnp/ — Fonzo V-40 "Ancient Sitka", 3,000-year-old Sitka soundboard (2026-04-21)
- https://www.instagram.com/reel/DNcnOt_SB_N/ — EJ-17 Double Top (2025-08-17)
- https://www.instagram.com/p/DFH3IjIy_Hp/ — Rock n Roll day, actor Big Thongpoom at the showroom (2025-01-22)

### Facebook
- https://www.facebook.com/Fonzoguitar/videos/.../1411611653717096/ — "นี่คือกีตาร์ที่คุ้มที่สุดในงบเริ่มต้น… Fonzo V-220M" (2025-10-09)

### YouTube
- https://www.youtube.com/watch?v=Wup2Yizu-c4 — FONZO V220M SJ review (2025-03-22)
