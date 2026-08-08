# Fonzo — สถานะรอบปรับปรุง 2 (ต่อ)

## แก้ไขแล้วรอบนี้
- `/shop` และ `/shop/:handle` เคยค้างที่ skeleton → สาเหตุคือ object literal เป็น query input
  ทำให้ query key เปลี่ยนทุก render (cancel/refetch loop). แก้ด้วย `useMemo` และลบ
  `commerce.collections.list` ที่ไม่ได้ใช้ออก. ยืนยันแล้วว่าแสดงสินค้า 2 รายการและหน้า
  รายละเอียด `fonzo-ej-14c` แสดงราคา THB 89,000 + ปุ่มเพิ่มลงตะกร้า
- `PageHeading` (SiteLayout) เพิ่ม prop `index` (เลขบทมุมขวา) และ `aside` (ตัวเลข/ลิงก์)
  พร้อมพื้นหลังไล่เฉดและวงกลมเรืองแสงอ่อน
- สร้าง `EditorialArticle` ใช้ในหน้า Brand Story: ภาพนำเต็มความกว้าง + คอลัมน์ meta
  แบบ sticky (เลขบท, pull quote) + คอลัมน์เนื้อหาจำกัดความกว้าง 46rem
- หน้า Founder: ภาพเหมือนมี gradient ทับด้านล่าง + ตารางข้อมูล (รางวัล/บทบาท) + เลขบท 01
- หน้า Dealers: การ์ดมีหัวข้อ "เครือข่ายทางการ" + เลขลำดับ + เงายกเมื่อ hover
- หน้า Contact: เพิ่ม eyebrow + gold rule เหนือหัวข้อฟอร์ม, เลขบท 09
- `CatalogBrowser`: ตัวกรองเปลี่ยนเป็นรายการมีเส้นขีดซ้าย (border-l-2) เน้นสีแบรนด์
  เมื่อเลือก, ตัวเลขจำนวนใช้ tabular-nums, คอลัมน์ตัวกรองมีเส้นแบ่งขวา
- หน้า Guitar/Accessories: เพิ่มเลขบท 03/04 และตัวเลขจำนวนรายการ (114 / 77)

## ตรวจ screenshot แล้ว (เดสก์ท็อป 1440px)
`/founder` `/brand-story` `/guitar` `/accessories` `/dealers` `/contact` `/catalog`
`/gallery` `/marketplace` `/orders/track` `/shop` `/shop/fonzo-ej-14c`

## ข้อสังเกต
- API ต้นฉบับ (rvscs-prod.com) ตอบช้าครั้งแรก (บางครั้ง >10s) แคชในหน่วยความจำช่วยได้
  หลังยิงครั้งแรก. เวลาถ่าย screenshot ต้องอุ่นแคชก่อน ไม่อย่างนั้นจะเห็น skeleton
- หน้า `/gallery` และ `/catalog` ในภาพยังเห็น skeleton เพราะแคชยังไม่อุ่น ไม่ใช่บั๊ก
  (ยืนยันด้วย curl: albums 2 อัลบั้ม / items 51 และ 79 รายการ)

## Shopify
- ร้าน: fonzoguitar-awnqfm3l-coral-falcon-0tvadpw0.myshopify.com (unclaimed)
- สินค้าตัวอย่าง: `fonzo-ej-14c` (THB 89,000), `savarez-510cr-...` (THB 750)
- โดเมนที่เผยแพร่: fonzoguitar-awnqfm3l.manus.space
