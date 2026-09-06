export type PresentationChapter = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  pages: number[];
  highlights: string[];
  products?: { label: string; search: string; family: "shop" | "custom" }[];
};

export const PRESENTATION_PAGES = Array.from({ length: 32 }, (_, index) => ({
  page: index + 1,
  image: `/presentation/pages/page-${String(index + 1).padStart(2, "0")}.jpg`,
}));

export const PRESENTATION_CHAPTERS: PresentationChapter[] = [
  {
    id: "opening",
    eyebrow: "01 / Brand story",
    title: "Luxury in every detail",
    intro: "จากภาพภายในกีตาร์ งานไม้ และเสียงของผู้เล่น สู่เรื่องราวของ FONZO Guitar แบรนด์ที่เชื่อว่าความหรูหราเริ่มต้นจากรายละเอียดที่มองเห็นและสัมผัสได้",
    pages: [1, 2, 3, 4, 5],
    highlights: ["Brand Story และ Why Fonzo", "กระบวนการออกแบบและงานฝีมือ", "การทดลองเล่นและการเตรียมเสียงก่อนส่งมอบ"],
  },
  {
    id: "shapes",
    eyebrow: "02 / Guitar language",
    title: "รูปทรงที่สร้างเสียง",
    intro: "รูปทรงของบอดี้ไม่ได้เป็นเพียงเรื่องของความสวยงาม แต่กำหนดการตอบสนอง ความสมดุล และความรู้สึกของผู้เล่น ตั้งแต่ OM, Dreadnought, GA, SJ, Mini และ Jumbo",
    pages: [6, 7, 8],
    highlights: ["OM · Dreadnought · GA · SJ", "Full body และ Cutaway", "ความสบายในการถือและการกระจายเสียง"],
  },
  {
    id: "tonewoods",
    eyebrow: "03 / Tonewoods",
    title: "ไม้คือเสียงตั้งต้น",
    intro: "FONZO คัดเลือกไม้หน้า ไม้ข้าง และไม้หลังให้สอดคล้องกับเสียงที่ต้องการ ตั้งแต่ European Spruce, Adirondack, Cedar, Sinker Redwood ไปจนถึง Rosewood, Maple, Cocobolo, Ziricote และ Mahogany",
    pages: [9],
    highlights: ["Top woods: Spruce, Cedar และ Redwood", "Back & side woods: Rosewood, Maple, Cocobolo, Ziricote และ Mahogany", "All Solid และ Top Solid"],
  },
  {
    id: "premium",
    eyebrow: "04 / Premium series",
    title: "เรื่องราวของรุ่นพิเศษ",
    intro: "ตั้งแต่ Picasso Art Series ไปจนถึง California River และ V-34 แต่ละรุ่นคือพื้นที่ให้ไม้ ลายอินเลย์ และความคิดสร้างสรรค์ทำงานร่วมกันเป็นเครื่องดนตรีที่มีตัวตน",
    pages: [10, 11, 12, 13, 14, 15],
    highlights: ["Picasso Art Series และงานอินเลย์", "California River กับ Sinker Redwood", "V-34 Red Indian Special Edition"],
    products: [
      { label: "Fonzo V-34", search: "V-34", family: "custom" },
      { label: "Picasso Series", search: "Picasso", family: "custom" },
    ],
  },
  {
    id: "acoustic",
    eyebrow: "05 / Acoustic series",
    title: "เสียงอะคูสติกในหลายบุคลิก",
    intro: "V-33, V-301, V-32, V-31, V-201 และ V-23 สะท้อนแนวทางของ FONZO ตั้งแต่เสียงใสและสมดุล ไปจนถึงโทนอุ่น ลึก และมีคาแรกเตอร์ของไม้ที่ชัดเจน",
    pages: [16, 17, 18, 19, 20, 21, 22],
    highlights: ["European Spruce, Engelmann Spruce, Sitka และ Cedar", "Indian Rosewood, Santos Rosewood, Mahogany และ Ziricote", "Premium Small Jumbo, OM, Dreadnought และ Mini"],
    products: [
      { label: "V-33", search: "V-33", family: "shop" },
      { label: "V-301", search: "V-301", family: "shop" },
      { label: "V-32", search: "V-32", family: "shop" },
      { label: "V-31", search: "V-31", family: "shop" },
      { label: "V-23", search: "V-23", family: "shop" },
    ],
  },
  {
    id: "custom",
    eyebrow: "06 / Guitar custom",
    title: "สั่งทำให้เป็นตัวคุณ",
    intro: "V-40 Custom เริ่มจากบทสนทนาเกี่ยวกับเสียง รูปทรง ไม้ และรายละเอียดที่ลูกค้าต้องการ จากนั้นทีมออกแบบและช่างทำกีตาร์จึงพัฒนาแบบเพื่อเข้าสู่กระบวนการผลิตเฉพาะตัว",
    pages: [23],
    highlights: ["เลือกไม้และเสียงที่ต้องการ", "ออกแบบอินเลย์และรายละเอียดเฉพาะตัว", "ระยะเวลาผลิตโดยประมาณ 4–5 เดือนหลังยืนยันแบบ"],
    products: [{ label: "เข้าสู่ Guitar Custom", search: "", family: "custom" }],
  },
  {
    id: "classic",
    eyebrow: "07 / Classic series",
    title: "รากเสียงคลาสสิกจากสเปน",
    intro: "Fonzo Classic Series EJ-15 ถึง EJ-11 ถ่ายทอดแนวคิด Spanish Fan Bracing และ Modern Bracing ผ่านงานทำมือจากสเปน พร้อมตัวเลือกไม้และรายละเอียดที่เหมาะกับทั้งผู้เริ่มต้นและนักดนตรีมืออาชีพ",
    pages: [24, 26, 27, 28, 29, 30],
    highlights: ["Spanish Fan Bracing และ Modern Bracing", "สเกล 650 mm และ nut width 52 mm", "รุ่น EJ-15, EJ-14, EJ-13, EJ-12 และ EJ-11"],
    products: [
      { label: "EJ-15", search: "EJ-15", family: "shop" },
      { label: "EJ-14", search: "EJ-14", family: "shop" },
      { label: "EJ-13", search: "EJ-13", family: "shop" },
      { label: "EJ-12", search: "EJ-12", family: "shop" },
      { label: "EJ-11", search: "EJ-11", family: "shop" },
    ],
  },
  {
    id: "players-care",
    eyebrow: "08 / Players & care",
    title: "เลือกโดยผู้เล่น ดูแลโดย FONZO",
    intro: "เสียงของผู้เล่นทั่วโลกเป็นส่วนหนึ่งของเรื่องราว FONZO และทุกเครื่องผ่านการตรวจสอบก่อนส่งมอบ พร้อมคำแนะนำเรื่องความชื้น การเคลม และบริการหลังการขาย",
    pages: [25, 31, 32],
    highlights: ["The choice of worldwide players", "ตรวจสอบและ setup ก่อนส่งมอบ", "เก็บรักษาที่ความชื้นประมาณ 45–50% และมีบริการ setup/ซ่อมบำรุง"],
  },
];

export function presentationShopHref(search: string, family: "shop" | "custom") {
  if (family === "custom") return search ? `/guitar-custom?model=${encodeURIComponent(search)}` : "/guitar-custom";
  return `/guitars/catalog?model=${encodeURIComponent(search)}`;
}
