# Round 2 — design refresh + newsroom (working notes)

## Source data (unchanged)
- Legacy API base: `https://rvscs-prod.com/guitar-service/` (POST, JSON bodies).
- Server wrapper: `server/fonzoContent.ts`; media proxied via `/api/fonzo-media/<dir>/<file>`
  (`server/_core/fonzoMedia.ts`). Guitars: 114, accessories: 77, albums: AB0001 Guitars (51),
  AB0002 Players (79).
- tRPC surface: `fonzo.guitars.{list,byCode,types}`, `fonzo.accessories.{list,byCode,types}`,
  `fonzo.content.{founder,brandStory,catalogs,dealers,priceBands}`,
  `fonzo.gallery.{albums,items}`.

## Official Fonzo channels (given by the client)
| Platform | URL |
| --- | --- |
| Shopee | https://shopee.co.th/fonzo_guitar |
| Lazada | https://www.lazada.co.th/fonzo-guitar/?q=All-Products&from=wangpu&langFlag=th&pageTypeId=2 |
| Facebook | https://www.facebook.com/Fonzoguitar/ |
| TikTok | https://www.tiktok.com/@fonzoguitaroffical?lang=th-TH |
| YouTube | https://www.youtube.com/@fonzoguitar |
| Instagram | https://www.instagram.com/fonzoguitar |
| Line | https://line.me/R/ti/p/@fonzoguitar |

Stored in `client/src/lib/brand.ts` as `BRAND.contact` + the `CHANNELS` array.

## Why the feed is curated, not scraped
Shopee, Lazada, Facebook and TikTok do not expose public read APIs for a brand's own
posts without an approved platform app tied to the account owner. Scraping their HTML is
blocked (bot detection) and against their terms. So:
- `socialPosts` table stores curated entries (platform, title/titleEn, excerpt, url,
  imageUrl, priceLabel, postedAt, pinned, published, sortOrder).
- `server/routers/newsroom.ts` — `feed` (public), `listAll`/`create`/`update`/`remove` (admin).
- Live post rendering uses official embeds only (`client/src/components/site/PostEmbed.tsx`):
  TikTok `/embed/v2/<videoId>`, YouTube `/embed/<id>`, Facebook `plugins/post.php`.
  Shopee/Lazada/Instagram forbid iframe embedding → those cards link out.

## Changes made in this round
- Removed `Spin360` (360° drag viewer) entirely; replaced with `ProductGallery`
  (large plate + scrolling thumbnails + full-screen lightbox, arrow-key nav).
- New design tokens in `index.css`: `.surface-deep`, `.rule-top`, `.section-index`,
  `.lift`, `.ken-burns`, `.marquee`/`.marquee-track`.
- New components: `SectionHeading`, `NewsroomFeed`, `ChannelStrip`, `NowTicker`,
  `ChannelIcon` (+ `CHANNEL_TINT`), `PostEmbed`, `ProductGallery`.
- Homepage rebuilt as numbered chapters: dark hero → ticker → 01 newsroom →
  channels → 02 craft → 03 collections → 04 featured → 05 founder → 06 ready to play →
  07 catalogue → 08 marketplace.

## Still to do
- Vitest for the newsroom router; re-screenshot every page.

## Done since
- `/admin` now has three tabs: Orders, Enquiries, Newsroom (`NewsroomAdmin`).
- `ProductDetailView`: gallery column is `lg:sticky lg:top-24`, specs render as a
  two-column grid, both grid children carry `min-w-0`.
- `ProductGallery` large plate capped at `max-h-[70vh]`.

## Known screenshot-tool artefact (not a site bug)
`/guitar/:code` and `/accessories/:code` render as skeletons in the automated
screenshot harness. The data layer is fine — `fonzo.guitars.byCode` for G0126
returns name "FONZO Master Series: Ancient Sitka", 43 images, 22 specs in ~12 ms
once the in-memory cache is warm. The harness appears to capture before the
query settles (first upstream fetch can take 30–60 s cold). The live preview URL
shows the page correctly. Diagnosis from the debug agent: the capture harness
plus `useAuth`/cookie behaviour in an embedded context, not the component.
Verify visually in the live preview rather than trusting these captures.

## Selected homepage imagery
See `references/homepage-imagery.md` for the exact media paths chosen.
