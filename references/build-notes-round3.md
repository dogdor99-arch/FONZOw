# Fonzo — รอบปรับปรุง 3: เปลี่ยนช่องทางซื้อเป็น Shopee / Lazada / Facebook

## บริบทและเหตุผล
ลูกค้า (คุณเบิร์ด เอกชัย เจียรกุล เจ้าของ Fonzo) ต้องการยกเลิกการขายผ่าน Shopify
และเปลี่ยนไปใช้ Shopee + Lazada ที่ร้านมีอยู่จริง เพราะติดตามสินค้าได้ ชำระเงินง่ายกว่า
และเพิ่มปุ่มสอบถามทาง Facebook ซึ่งเป็นช่องทางที่ทีมงานตอบจริง

## ข้อมูลร้านค้าจริง
- Shopee: https://shopee.co.th/fonzo_guitar — shopid `602826372`, userid `602845957`,
  ผู้ติดตาม 2,191 คน, เรตติ้ง 4.898 (ดึงจาก `api/v4/shop/get_shop_base?username=fonzo_guitar`
  ซึ่งเป็น endpoint เดียวที่ยังเรียกได้จาก sandbox)
- Lazada: https://www.lazada.co.th/shop/fonzo-guitar/ — หน้ารวมสินค้าที่เข้าถึงได้จริงคือ
  https://www.lazada.co.th/tag/fonzo-guitar/ (มี ?page=2..102)
- Facebook: https://www.facebook.com/Fonzoguitar/ · Messenger: https://m.me/Fonzoguitar

## ข้อจำกัดทางเทคนิคที่พบ
- Shopee API ส่วนใหญ่ตอบ `error: 90309999` (anti-bot) — `search_items`, `rcmd_items`,
  `pdp/get_pc`, `item/get_ratings` ใช้ไม่ได้ ต้องมีลายเซ็นจากเบราว์เซอร์จริง
- Shopee หน้าเว็บคืน 200 ทุก URL แม้ itemid ไม่มีอยู่ จึงตรวจลิงก์ด้วย HTTP status ไม่ได้
- Lazada บล็อกด้วย reCAPTCHA ทั้งทาง browser และ curl (x5secdata punish page)
- สรุป: ตรวจลิงก์ได้จากดัชนีการค้นหาเท่านั้น

## ผลการเก็บลิงก์
- ใช้ parallel search 80 รุ่นที่มีราคา ได้ผลใน `/home/ubuntu/find_fonzo_marketplace_links.json`
- ลิงก์ Shopee รูปแบบถูกต้อง 74 รุ่น / ลิงก์ Lazada 5 รุ่น
- จับคู่เข้ารหัสสินค้าในเว็บได้ 74 รหัส เก็บที่ `shared/fonzo/marketplaceLinks.json`
- ยืนยันตรงกับดัชนีการค้นหา 6/6 ตัวอย่างที่สุ่มตรวจ (EJ-01C, V-31SSB, V-220SP,
  V-200S SJ Full Body, V-34C SJ Full Body, V-22S Full Body)
- รุ่นที่มีราคาแต่ยังไม่มีลิงก์: G0059, G0039, G0032, G0017, G0062, G0063

## สถาปัตยกรรมที่ใช้
- `shared/fonzo/marketplace.ts` — helper: `marketplaceLinksFor(code)`,
  `hasMarketplaceListing(code)`, `shopeeSearchUrl()`, `lazadaSearchUrl()`,
  ค่าคงที่ URL ร้านและ Messenger
- `client/src/components/site/BuyChannels.tsx` — ปุ่ม Shopee/Lazada (สีแบรนด์จริง
  #ee4d2d / #0f146d) + Facebook + Line, มีโหมด `compact` สำหรับการ์ดสินค้า
  รุ่นที่ไม่มีลิงก์ตรงจะลิงก์ไปหน้าค้นหาในร้านนั้นแทน ไม่ปล่อยลิงก์เสีย
- `ProductDetailView` ตัด prop `shopProduct` และ CartContext ออกทั้งหมด
