# Legacy Fonzo site — reference notes

Source site: https://www.fonzoguitar.com/home (React SPA, Google Maps + Facebook chat widgets)
Legacy REST service base: `https://rvscs-prod.com/guitar-service/` (all endpoints are **POST**, body `{}` or `{limit, offset, <code>}`)

## Original navigation (must be preserved verbatim)

HOME (`/home`) · FOUNDER (`/founder`) · BRAND STORY (`/brand-story`) · GUITAR (`/guitar-type`) ·
ACCESSORIES (`/accessories-type`) · CATALOG (`/catalog`) · GALLERY (`/gallery`) · DEALERS (`/dealers`) · CONTACT (`/contact`)

Footer blocks on the original: logo, "วันและเวลาทำการ", "Get In Touch" (phone / Facebook Fonzo Guitar /
Youtube Fonzo Guitar / Line / email icons), "Showroom" + embedded Google Map, "2020. All right reserved."

## Endpoint inventory and record counts (verified)

| Endpoint | Rows | Notes |
|---|---|---|
| `guitar/getGuitarBy` | 114 | summary rows; `guitar_price` is either a number string or `"Enquiry"` |
| `guitarType/getGuitarTypeBy` | 4 | Fonzo Classic (GT0001, 16), Fonzo Acoustic (GT0004, 66), Fonzo Custom (GT0005, 16), Fonzo Selection (GT0006, 16) |
| `guitarDetail/getGuitarDetailBy` | per product | spec rows (`guitar_detail_title` / `_text` / `_language` TH+ENG) |
| `guitar-img/getGuitarImgBy` | 1807 total | multi-angle photography, `guitar_img_default = "Yes"` marks the hero |
| `guitar-img-rotate/…` | 0 | empty upstream — 360° view is built from the multi-image set |
| `accessories/getAccessoriesBy` | 77 | Strings 24, Guitar Parts 14, Others 12, Guitar Case 8, Capo 8, Pickguard 6, Pickup & Cable 5 |
| `accessoriesType/getAccessoriesTypeBy` | 7 | AT0001–AT0007 |
| `aboutUs/getAboutUsBy` | 2 | FOUNDER page article, TH + ENG, rich HTML |
| `brandStory/getBrandStoryBy` | 2 | BRAND STORY article, TH + ENG, rich HTML |
| `catalog/getCatalogBy` | 1 | "Fonzo Brochure Apr2023" PDF |
| `album/getAlbumBy` | 2 | AB0001 "Guitars" (51 items), AB0002 "Players" (79 items) |
| `images/getImagesBy` | per album | `images_type` = Image / Video (mp4 + poster in `images_profile_video`) |
| `promotion/getPromotionBy` + `promotionDetail/getPromotionDetailByCode` | 1 → 2 | DEALERS content (TH + ENG) |
| `filter-price/getFilterPriceBy` | 4 | legacy price bands |
| `language/getLanguageBy` | 2 | TH default, ENG |
| `series/getSeriesBy`, `setting/…`, `banner/…` | 0 | empty upstream |

Series names present in guitar rows: All Solid Handmade (35), Top Solid (40), All Solid (23), Fonzo Selection (16).

Media files resolve at `https://rvscs-prod.com/guitar-service/<relative_path>` and are re-served through
this app at `/api/fonzo-media/<relative_path>` (see `server/_core/fonzoMedia.ts`).

## Brand facts pulled from legacy content

- Founder: เบิร์ด เอกชัย เจียรกุล / Bird Ekachai Jearakul — first Thai & first Asian winner of the
  GFA (Guitar Foundation of America) International Concert Artist Competition, 2014. Born 1987, Ubon Ratchathani.
  Studied at the College of Music, Mahidol University (first-class honours BA, then MA).
- Showroom: 1338/928 Supalai Prima Riva, Rama 3 Road, Yannawa, Bangkok 10120.
  Tel +66 2051 2223, +66 99 291 1935. Email fonzoguitars@gmail.com.
- Japan distribution: fonzoguitar.jp, Dolphin Guitars (Tokyo / Osaka / Fukuoka stores).
- Founder quote (EN): "For me, the guitar is not just a musical instrument, it is my whole life,
  it is the heart and soul within me."
