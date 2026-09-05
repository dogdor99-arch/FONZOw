/** Single source of truth for Fonzo brand facts, sourced from the official site. */

export const BRAND = {
  name: "Fonzo",
  fullName: "Fonzo Guitar",
  logo: "/fonzo-logo.svg",
  founder: {
    th: "เบิร์ด เอกชัย เจียรกุล",
    en: "Bird Ekachai Jearakul",
  },
  showroom: {
    nameTh: "Fonzo Guitar Showroom",
    addressTh: "1338/928 ศุภาลัย ปริมา ริวา ถนนพระราม 3 แขวงยานนาวา กรุงเทพฯ 10120",
    addressEn: "1338/928 Supalai Prima Riva, Rama 3 Road, Yannawa, Bangkok, Thailand 10120",
    hoursTh: "จันทร์ – เสาร์  10:00 – 19:00 น. (นัดหมายล่วงหน้า)",
    hoursEn: "Monday – Saturday, 10:00 – 19:00 (by appointment)",
    mapQuery: "Supalai Prima Riva, Rama 3 Road, Yannawa, Bangkok 10120",
    lat: 13.6866,
    lng: 100.5405,
  },
  contact: {
    phones: ["+66 2051 2223", "+66 99 291 1935"],
    email: "fonzoguitars@gmail.com",
    facebook: "https://www.facebook.com/fonzoguitar",
    facebookLabel: "Facebook Fonzo Guitar",
    youtube: "https://www.youtube.com/@fonzoguitar",
    youtubeLabel: "Youtube Fonzo Guitar",
    line: "https://line.me/R/ti/p/@fonzoguitar",
    lineLabel: "Line @fonzoguitar",
    instagram: "https://www.instagram.com/fonzoguitar",
    instagramLabel: "Instagram fonzoguitar",
    tiktok: "https://www.tiktok.com/@fonzoguitaroffical",
    tiktokLabel: "TikTok @fonzoguitaroffical",
    shopee: "https://shopee.co.th/fonzo_guitar",
    shopeeLabel: "Shopee fonzo_guitar",
    lazada:
      "https://www.lazada.co.th/fonzo-guitar/?q=All-Products&from=wangpu&langFlag=th&pageTypeId=2",
    lazadaLabel: "Lazada Fonzo Guitar",
  },
} as const;

/**
 * Official sales and social channels, ordered the way they are presented in the
 * homepage channel strip and the footer.
 */
export const CHANNELS = [
  {
    key: "shopee",
    name: "Shopee",
    handle: "fonzo_guitar",
    url: BRAND.contact.shopee,
    kind: "marketplace",
    note: { th: "ร้านค้าทางการ", en: "Official store" },
  },
  {
    key: "lazada",
    name: "Lazada",
    handle: "Fonzo Guitar",
    url: BRAND.contact.lazada,
    kind: "marketplace",
    note: { th: "ร้านค้าทางการ", en: "Official store" },
  },
  {
    key: "facebook",
    name: "Facebook",
    handle: "Fonzoguitar",
    url: BRAND.contact.facebook,
    kind: "social",
    note: { th: "ข่าวสารและงานใหม่", en: "News & new builds" },
  },
  {
    key: "tiktok",
    name: "TikTok",
    handle: "@fonzoguitaroffical",
    url: BRAND.contact.tiktok,
    kind: "social",
    note: { th: "คลิปเสียงและรีวิว", en: "Sound clips & reviews" },
  },
  {
    key: "youtube",
    name: "YouTube",
    handle: "Fonzo Guitar",
    url: BRAND.contact.youtube,
    kind: "social",
    note: { th: "วิดีโอสาธิตเสียง", en: "Sound demonstrations" },
  },
  {
    key: "instagram",
    name: "Instagram",
    handle: "fonzoguitar",
    url: BRAND.contact.instagram,
    kind: "social",
    note: { th: "ภาพงานฝีมือ", en: "Craft photography" },
  },
] as const;

export type ChannelKey = (typeof CHANNELS)[number]["key"];

export const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "GUITAR SHOP", href: "/guitars" },
  { label: "GUITAR CUSTOM", href: "/guitar-custom" },
  { label: "WORKS", href: "/works" },
  { label: "ARTISTS", href: "/artists" },
  { label: "ACCESSORIES", href: "/accessories" },
  { label: "DEALERS", href: "/dealers" },
  { label: "FOUNDER", href: "/founder" },
  { label: "CONTACT", href: "/contact" },
] as const;

export const SECONDARY_NAV = [
  { label: { th: "ช่องทางสั่งซื้อ", en: "Where to buy" }, href: "/shop" },
  { label: { th: "ตลาดซื้อขาย", en: "Marketplace" }, href: "/marketplace" },
  { label: { th: "ติดตามคำสั่งซื้อ", en: "Track order" }, href: "/orders/track" },
] as const;
