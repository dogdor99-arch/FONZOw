# Fonzo Guitar — Project TODO

## รากฐาน (Foundation)
- [x] ระบบดีไซน์หรูหรา: โทเค็นสี ทองแดง/ครีม/ถ่าน, ฟอนต์ Cormorant Garamond + Noto Sans Thai, index.css
- [x] Layout หลัก: Header โลโก้ Fonzo + เมนู HOME/FOUNDER/BRAND STORY/GUITAR/ACCESSORIES/CATALOG/GALLERY/DEALERS/CONTACT
- [x] Footer: โลโก้, วันและเวลาทำการ, Get In Touch (โทร/Facebook/YouTube/Line/Email), Showroom, ลิขสิทธิ์
- [x] เมนูมือถือแบบ Sheet/Drawer + สลับภาษา TH/EN

## Backend ข้อมูลต้นฉบับ
- [x] server/_core/fonzoApi.ts: proxy เรียก API rvscs-prod.com พร้อมแคชในหน่วยความจำ
- [x] server/routers/fonzo.ts: guitars.list, guitars.byCode, guitarTypes, accessories.list, accessories.byCode, accessoriesTypes, content (aboutUs/brandStory), catalog, gallery, dealers, filterPrice
- [x] Proxy รูปภาพ/ไฟล์ผ่าน /api/fonzo-media เพื่อเลี่ยงปัญหา mixed content/CORS

## หน้าเว็บ (คงฟังก์ชันเดิมครบ)
- [x] HOME: Hero หรูหรา + ประเภทกีตาร์ + สินค้าแนะนำ + Brand Story ย่อ + Marketplace teaser
- [x] FOUNDER: ประวัติเบิร์ด เอกชัย เจียรกุล จาก API (TH/EN)
- [x] BRAND STORY: เรื่องราวแบรนด์จาก API (TH/EN)
- [x] GUITAR: 114 รายการ + กรองตามประเภท (Classic/Acoustic/Custom/Selection) + ช่วงราคา + ค้นหา + เรียงลำดับ
- [x] GUITAR detail: แกลเลอรีหลายมุม, สเปคครบ, วิดีโอ YouTube, ปุ่มเพิ่มลงตะกร้า/สอบถาม
- [x] มุมมอง 360 องศา: ลากหมุนดูภาพหลายมุมของกีตาร์
- [x] ACCESSORIES: 77 รายการ + กรอง 7 หมวด + หน้ารายละเอียด
- [x] CATALOG: ดาวน์โหลด/ดูโบรชัวร์ PDF
- [x] GALLERY: อัลบั้ม Guitars/Players + รูปภาพและวิดีโอ + Lightbox
- [x] DEALERS: ตัวแทนจำหน่ายไทย/ญี่ปุ่น/ต่างประเทศ จาก API
- [x] CONTACT: ฟอร์มติดต่อ + ข้อมูลโชว์รูม

## ระบบขายจริง (Shopify)
- [x] Seed สินค้าตัวอย่างขึ้น Shopify (FONZO EJ-14C ฿89,000, Savarez 510CR ฿750) + ตรวจผ่าน smoke test
- [x] CartProvider + Cart drawer + ปุ่ม Checkout ผ่าน Shopify
- [x] หน้า SHOP รวมสินค้าที่ขายออนไลน์ได้จริง (Shopify catalog) + หน้ารายละเอียดสินค้า
- [x] ระบบติดตามคำสั่งซื้อ: บันทึกคำสั่งซื้อ + หน้าค้นหาสถานะด้วยเลขคำสั่งซื้อ/อีเมล
- [x] หน้ายืนยันคำสั่งซื้อ /orders/confirm บันทึกคำสั่งซื้อหลังชำระเงินอัตโนมัติ
- [x] หน้าผู้ดูแล /admin: อัปเดตสถานะคำสั่งซื้อ/เลขพัสดุ/ผู้ให้บริการขนส่ง/บันทึกถึงลูกค้า และจัดการข้อความติดต่อ

## Marketplace (ซื้อขายแลกเปลี่ยนมือสอง)
- [x] ตาราง listings / listingMessages / listingFavorites / wishlist / orders / orderEvents / enquiries
- [x] ลงประกาศได้เฉพาะผู้ใช้ที่ล็อกอิน (protectedProcedure)
- [x] หน้ารายการประกาศ + กรอง + หน้ารายละเอียดประกาศ
- [x] ระบบแชทระหว่างผู้ซื้อและผู้ขาย
- [x] หน้าจัดการประกาศของฉัน (เปลี่ยนสถานะ/ลบ) + กล่องข้อความ
- [x] ผู้ขายตอบกลับข้อความได้จากหน้า "ประกาศของฉัน" (แชทสองทาง)

## คุณภาพ
- [x] Vitest ครอบ router หลัก (fonzo, commerce, marketplace, orders, enquiry) — 21 ผ่าน
- [x] ตรวจ responsive มือถือ (390px) และเดสก์ท็อป
- [x] ตรวจ screenshot ทุกหน้าก่อนส่งมอบ

## บันทึกการตรวจสอบ

## การแก้บั๊ก

## รอบปรับปรุง 2: ดีไซน์ใหม่ + ศูนย์รวมคอนเทนต์
- [x] ตัดฟังก์ชันหมุนดูรอบตัว (Spin360) ออกจากหน้ารายละเอียดสินค้าทั้งหมด
- [x] ปรับแกลเลอรีรูปสินค้าใหม่ให้เรียบหรู (ภาพหลัก + ภาพย่อแบบเลื่อน + ซูมเต็มจอ)
- [x] ตาราง socialPosts + API หลังบ้านสำหรับจัดการคอนเทนต์จากทุกแพลตฟอร์ม
- [x] หน้าจัดการคอนเทนต์ใน /admin (เพิ่ม/แก้/ลบ/ปักหมุด/เผยแพร่)
- [x] ส่วน "ความเคลื่อนไหวของ Fonzo" บนหน้าแรก พร้อมตัวกรองตามแพลตฟอร์ม
- [x] ฝัง embed สดจาก TikTok, Facebook และ YouTube (PostEmbed)
- [x] แถบลิงก์ร้าน Shopee / Lazada / Facebook / TikTok / YouTube / Instagram (ChannelStrip)
- [x] แถบข่าวล่าสุด (NowTicker) ใต้ hero
- [x] โทเค็นดีไซน์ใหม่: .surface-deep .rule-top .section-index .lift .ken-burns .marquee
- [x] รื้อการจัดวางหน้าแรกใหม่เป็นบทเรียงลำดับ 01–08 พร้อม hero โทนเข้ม
- [x] แก้หน้า /shop และ /shop/:handle ค้างที่ skeleton — ทำให้ input ของ query เสถียรด้วย useMemo และตัด collections.list ที่ไม่ได้ใช้ออก
- [x] ปรับหน้าอื่นให้สอดคล้องกับดีไซน์ใหม่ (PageHeading มีเลขบท/ตัวเลขสรุป, EditorialArticle สำหรับ Brand Story, Founder แบบภาพเหมือน + ตารางข้อมูล, Dealers การ์ดมีลำดับ, Contact มี eyebrow + gold rule, ตัวกรอง CatalogBrowser แบบเส้นขีดซ้าย)
- [x] ทดสอบ Vitest และตรวจ screenshot ทุกหน้าอีกครั้ง — 29 ผ่าน / 1 ข้าม (6 ไฟล์)
- [x] แก้ React warning "two children with the same key" ในหน้ารายละเอียดกีตาร์ (G0126): กรองรายการสเปคที่ซ้ำกันออกที่ชั้นข้อมูล และทำให้ key ของตารางสเปค/ภาพย่อ/เฟรม 360° ไม่ซ้ำกัน
- Vitest: 23 ผ่าน / 1 ข้าม (5 ไฟล์) รวมเทสต์สิทธิ์ admin ของ orders.listAll และ enquiry.list
- Screenshot เดสก์ท็อป: / /founder /brand-story /guitar /guitar/G0009 /accessories /accessories/A0001
  /catalog /gallery /dealers /contact /shop /shop/fonzo-ej-14c /orders/track /orders/confirm
  /marketplace /marketplace/new /marketplace/my-listings /marketplace/1 /admin
- Screenshot มือถือ 390px: / /guitar /shop

## บันทึกการตรวจสอบ รอบปรับปรุง 2
- Vitest รอบสุดท้าย: 29 ผ่าน / 1 ข้าม (6 ไฟล์) — เพิ่ม newsroom.test.ts (6 เทสต์)
- Screenshot เดสก์ท็อป 1440px ครบทุก route: / /founder /brand-story /guitar /guitar/G0009
  /accessories /accessories/A0001 /catalog /gallery /dealers /contact /shop /shop/fonzo-ej-14c
  /orders/track /orders/confirm /marketplace /marketplace/new /marketplace/my-listings
  /marketplace/1 /admin
- Screenshot มือถือ 390px: / /guitar /shop
- หมายเหตุ: API ต้นฉบับตอบช้าครั้งแรก ต้องอุ่นแคชก่อนถ่ายภาพ ไม่อย่างนั้นจะเห็น skeleton
- /marketplace/1 แสดง "ไม่พบประกาศนี้" ถูกต้องตามพฤติกรรม เพราะยังไม่มีประกาศในฐานข้อมูล

## รอบปรับปรุง 3: เปลี่ยนช่องทางซื้อเป็น Shopee / Lazada / Facebook
- [x] เก็บรายการสินค้าจริงจากร้าน Shopee ของ Fonzo (shopee.co.th/fonzo_guitar, shopid 602826372)
- [x] เก็บรายการสินค้าจริงจากร้าน Lazada ของ Fonzo (lazada.co.th/shop/fonzo-guitar)
- [x] ระบบจับคู่สินค้าในเว็บกับลิงก์บน Shopee/Lazada แบบชิ้นต่อชิ้น — `shared/fonzo/marketplaceLinks.json` (74 รหัส)
- [x] คอมโพเนนต์ BuyChannels: Shopee + Lazada + Facebook Messenger + Line (3 โหมด: full / row / compact)
- [x] แทนที่ปุ่ม "เพิ่มลงตะกร้า"/Shopify ในหน้ารายละเอียดกีตาร์และอุปกรณ์เสริมทุกตัว
- [x] สินค้าที่ยังจับคู่ไม่ได้: ลิงก์ไปหน้าค้นหาในร้านนั้น + ปุ่มสอบถาม Facebook
- [x] ตัดระบบตะกร้า Shopify ออกทั้งหมด (CartContext, CartDrawer, ShopProduct, CartProvider)
- [x] เปลี่ยนหน้า /shop เป็นหน้า "ช่องทางสั่งซื้อ" พร้อมรายการรุ่นที่มีลิงก์จริง + ตัวกรองกีตาร์/อุปกรณ์
- [x] เปลี่ยนไอคอนตะกร้าใน header เป็นเมนูช่องทางร้านทางการ
- [x] ปรับหน้า /orders/confirm เป็นการลงทะเบียนคำสั่งซื้อจาก Shopee/Lazada
- [x] ปรับหน้ารายการสินค้าให้แสดงป้ายช่องทางที่ซื้อได้ (ไอคอน Shopee/Lazada มุมขวาบน + ป้าย "ซื้อออนไลน์ได้")
- [x] ปรับหน้าแรกให้ CTA ชี้ไปช่องทางจริง
- [x] เพิ่มลิงก์อุปกรณ์เสริม (A0005, A0008, A0024, A0034) และกีตาร์เพิ่ม (G0032, G0059) — รวม 80 รหัส
- [x] เขียนเทสต์ marketplaceLinks.test.ts ตรวจรูปแบบ URL ทุกรายการ + fallback (8 เทสต์)
- [x] ลบเทสต์ Shopify ที่ไม่ใช้แล้ว (commerce.router.test.ts, shopify.smoke.test.ts)
- [x] ทดสอบ Vitest — 31 ผ่าน (5 ไฟล์) + ตรวจ screenshot

## บันทึกการตรวจสอบ รอบปรับปรุง 3
- Vitest: 31 ผ่าน (5 ไฟล์) — marketplaceLinks 8, marketplace.auth 9, fonzo.content 7, newsroom 6, auth 1
- ลิงก์จับคู่ทั้งหมด 80 รหัส (Shopee 80, Lazada 5) ครอบคลุมทั้งกีตาร์ (G) และอุปกรณ์เสริม (A)
- รูปแบบลิงก์ที่ยอมรับ: Shopee `-i.602826372.<itemid>` / Lazada `-i<id>-s<sku>.html` เท่านั้น
- สินค้าที่ยังไม่มีลิงก์: ปุ่มจะเปิดหน้าค้นหาในร้านทางการ + ปุ่มสอบถาม Facebook/Line เสมอ (ไม่มีลิงก์เสีย)
- Screenshot ตรวจแล้ว: /shop /guitar /guitar/G0051 /accessories /accessories/A0005 / /orders/track

## การแก้ไขจากผู้ใช้ (Visual editor)
- [x] เปลี่ยนสถิติที่สามใน hero จาก "รางวัลระดับโลก / 2014" เป็น "ประเทศ / ไทย" (EN: Made in / Thailand)
- [x] ล้าง inline style ซ้ำซ้อนใน HeroStat ที่ visual editor สร้างไว้ แล้วใช้ Tailwind token แทน (mt-2.5 text-lg sm:text-xl)

## รอบปรับปรุง 4: ฟีดรูปภาพจาก Instagram / TikTok / Facebook
- [x] server/_core/socialOembed.ts: ตัวแก้ปัญหา 3 ชั้น — oEmbed (TikTok/YouTube สาธารณะ) → Open Graph (IG/FB ด้วย crawler UA) → derived (YouTube) พร้อมแคช 30 นาที
- [x] รองรับ Instagram Graph API / Facebook Page API เมื่อมี access token (IG_ACCESS_TOKEN, IG_USER_ID, FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID)
- [x] server/_core/socialMedia.ts: proxy รูป `/api/social-media?url=` จำกัดเฉพาะ CDN ของแพลตฟอร์ม (allow-list) จำกัด 8MB แคช 1 วัน
- [x] tRPC procedure: social.feed (รวมโพสต์ที่จัดไว้ + ฟีดสดจากบัญชีที่เชื่อม, dedupe ด้วย normalised URL), social.status, social.preview, social.detect
- [x] คอมโพเนนต์ SocialGrid: ตารางสี่เหลี่ยมจัตุรัส + แท็บแยกแพลตฟอร์ม + ป้ายวิดีโอ + คำบรรยายตอน hover + lightbox เปิดโพสต์ในหน้า + แถวติดตาม
- [x] แสดงบนหน้าแรก (limit 12 ใต้ NewsroomFeed) และหน้า Gallery (limit 8)
- [x] PostEmbed: เพิ่ม Instagram embed route `/p/<shortcode>/embed/captioned/`
- [x] หน้า /admin: ปุ่มดึงข้อมูลจากลิงก์อัตโนมัติ (เติมหัวข้อ + แสดงรูปตัวอย่าง) และแผงสถานะการเชื่อมต่อฟีด
- [x] เพิ่มโพสต์จริงของ Fonzo 7 รายการ (TikTok 2, Instagram 3, Facebook 1, YouTube 1)
- [x] Vitest ครอบ social (13 เทสต์) — รวมทั้งโปรเจกต์ 44 ผ่าน (6 ไฟล์)

## บันทึกการตรวจสอบ รอบปรับปรุง 4
- ยืนยันรูปโหลดผ่าน proxy ได้จริงทั้ง 7 โพสต์ (HTTP 200): tiktok 614KB/514KB, instagram 92KB/32KB/46KB, facebook 432KB, youtube 41KB
- Instagram/Facebook ต้องใช้ UA `facebookexternalhit/1.1` เพื่ออ่าน og: tags (UA เบราว์เซอร์ปกติเจอหน้า login)
- TikTok profile scraping ถูกบล็อกด้วย captcha — จึงใช้ oEmbed ต่อโพสต์เท่านั้น
- api.instagram.com/oembed ถูกยกเลิกแล้ว, graph.facebook.com ต้องมี token
- Screenshot ตรวจแล้ว: / (desktop + full-page 2200px), /gallery (desktop, มือถือ 430px), /admin

### ยืนยันจากโค้ดและฐานข้อมูล (รอบปรับปรุง 4)
- socialOembed.ts:40 `source: "oembed" | "opengraph" | "derived" | "none"` (3 ชั้น + สถานะว่าง), :45 `CACHE_TTL_MS = 30 * 60 * 1000`, :294 เขียนแคชพร้อม TTL
- socialOembed.ts:63-64 อ่าน `IG_ACCESS_TOKEN`/`FB_APP_ACCESS_TOKEN`/`FB_PAGE_ACCESS_TOKEN`, :152/:156 เรียก `graph.facebook.com/v21.0/instagram_oembed` และ `oembed_post`
- socialMedia.ts:16-29 allow-list (tiktokcdn.com, cdninstagram.com, fbcdn.net, ytimg.com ฯลฯ), :37 `MAX_BYTES = 8 * 1024 * 1024`, :94 บังคับเพดาน, :102 `Cache-Control: public, max-age=86400`
- routers/social.ts:142 `status`, :148 `feed`, :233 `preview`, :249 `detect`; :211-216 dedupe ด้วย `normaliseUrl` (curated ชนะ live), :91/:133 ฟีดสดจากบัญชีที่เชื่อมทำเครื่องหมาย `live: true`
- SocialGrid.tsx:251/:260 `aspect-square`, :231 ป้ายวิดีโอ, :238 คำบรรยาย `group-hover`, :319 lightbox ใช้ `PostEmbed`, :156-159 แถวติดตาม
- PostEmbed.tsx:34-35 Instagram → `https://www.instagram.com/p/<shortcode>/embed/captioned/`
- socialPosts (published=1): instagram 3, tiktok 2, facebook 1, youtube 1 = 7 รายการ

## การปรับตามผู้ใช้ (หลังรอบ 4)
- [x] นำส่วน "ความเคลื่อนไหวของ Fonzo" (NewsroomFeed) ออกจากหน้าแรก เพราะซ้ำกับ "ภาพล่าสุดจากช่องทางของ Fonzo" (SocialGrid)
- [x] เพิ่ม prop `index` ให้ SocialGrid แล้วเลื่อนกำแพงรูปขึ้นเป็นบท 01 ของหน้าแรก
- [x] ยืนยันไม่มีการอ้างอิง NewsroomFeed เหลือในหน้าใด — เก็บคอมโพเนนต์ไว้ใช้ในอนาคตได้
- [x] Vitest 44 ผ่าน (6 ไฟล์) หลังการเปลี่ยนแปลง

## รอบปรับปรุง 5: เมนูมือถือ + ปุ่มแชทลอย + เติมกำแพงรูป
- [ ] แก้ปุ่มเมนูสามขีดมุมซ้ายบนที่แสดงผลผิดพลาดในหน้าจอย่อ (ตรวจ breakpoint / ตำแหน่ง / ขนาดปุ่ม)
- [ ] เพิ่มปุ่มแชท Facebook แบบลอยมุมขวาล่างทุกหน้า (FloatingChat) พร้อมเมนูช่องทาง Line/โทร
- [ ] ปุ่มลอยต้องไม่ทับปุ่มซื้อในหน้ารายละเอียดสินค้าและ lightbox
- [ ] เพิ่มลิงก์โพสต์ TikTok และ Instagram อีก 8–10 รายการ ให้กำแพงรูปเต็มสองแถว (รวม ≥ 16 รายการ)
- [ ] Vitest + ตรวจ screenshot เดสก์ท็อป/มือถือ + เผยแพร่
