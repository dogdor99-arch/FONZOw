# Fonzo build notes (internal)

## Live endpoints verified (dev server, `/api/trpc/...`)

| Procedure | Result |
|---|---|
| `fonzo.guitars.list` | 114 rows, first `G0126` FONZO Master Series: Ancient Sitka (Enquiry) |
| `fonzo.guitars.types` | GT0001 Fonzo Classic 16, GT0004 Fonzo Acoustic 66, GT0005 Fonzo Custom 16, GT0006 Fonzo Selection 16 |
| `fonzo.accessories.list` | 77 rows, first `A0001` Savarez 510CR New Crystal Cantiga Normal Tension |
| `fonzo.accessories.types` | AT0001 Strings 24 … 7 types |
| `fonzo.content.founder` | AU0001 (th) + ENG, rich HTML, hero image present |
| `fonzo.content.brandStory` | BS0001 (th) + ENG |
| `fonzo.content.catalogs` | C0001 "Fonzo Brochure Apr2023" PDF |
| `fonzo.content.dealers` | PD0001 Fonzo Dealers, TH + ENG |
| `fonzo.content.priceBands` | FP0001 1k–10k, FP0003 10k–100k, FP0004 50k–100k, FP0002 100k–1M |
| `fonzo.gallery.albums` | AB0001 Guitars 51, AB0002 Players 79 |
| `/api/fonzo-media/...` | 200, `image/jpeg`, proxy works (verified 244 KB file) |

Highest-priced catalogue models (useful for Shopify seeding):
G0062 / G0063 FONZO EJ-16C / EJ-16S ฿239,000 · G0011 / G0012 EJ-15C / EJ-15S ฿149,000 ·
G0009 / G0010 EJ-14C / EJ-14S ฿89,000 (all Fonzo Classic).

## Shopify store state

Store: `fonzoguitar-awnqfm3l-coral-falcon-0tvadpw0.myshopify.com` (unclaimed — owner claims it in
Settings → Integrations → Shopify).

Seeded starter products (created via Shopify MCP, published to the Manus channel):

| Product | GID | Price | Tags |
|---|---|---|---|
| FONZO EJ-14C | `gid://shopify/Product/10437912854660` | 89000 | `G0009`, Fonzo Classic, All Solid, Guitar |
| Savarez 510CR New Crystal Cantiga Normal Tension | `gid://shopify/Product/10437913215108` | 750 | `A0001`, Strings, Accessories, Savarez |

**Catalogue ↔ Shopify link convention:** a Shopify product is matched to a legacy catalogue model by
putting the legacy code (e.g. `G0009`) in the product's **tags**; `ProductDetailView` then shows an
"Add to bag" button instead of "Enquire". Titles are also matched case-insensitively as a fallback.

## Routes

`/` `/founder` `/brand-story` `/guitar` `/guitar/:code` `/accessories` `/accessories/:code`
`/catalog` `/gallery` `/dealers` `/contact` `/shop` `/shop/:handle` `/orders/track` `/orders/confirm`
`/marketplace` `/marketplace/new` `/marketplace/my-listings` `/marketplace/:id`

## Checkout → tracking flow

`CartContext.proceedToCheckout` appends `return_to=<origin>/orders/confirm` to the Shopify checkout
URL. `/orders/confirm` reads `?order=` and `?email=` and calls `orders.register`, which writes the
local shadow order + first `orderEvents` row. `/orders/track` then resolves it by order number +
email (guest-friendly). Shop staff advance status via `orders.setStatus` (adminProcedure).
