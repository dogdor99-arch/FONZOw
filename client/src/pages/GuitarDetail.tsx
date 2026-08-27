import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ฐานข้อมูลสเปคเฉพาะแต่ละรุ่น (ป้องกันข้อมูลซ้ำกัน)
const SPEC_DATABASE: Record<string, any> = {
  "Ancient Sitka": {
    "TOP WOOD": "Solid Ancient Sitka Spruce",
    "BACK & SIDES": "Solid Indian Rosewood",
    "NECK": "Honduran Mahogany",
    "FINGERBOARD": "Ebony with Custom Inlay",
    "SCALE LENGTH": "650 mm",
    "NUT WIDTH": "52 mm",
    "BRIDGE": "Ebony",
    "FINISH": "Gloss Nitrocellulose"
  },
  "Picasso": {
    "TOP WOOD": "Solid Cedar",
    "BACK & SIDES": "Solid Figured Maple",
    "NECK": "Spanish Cedar",
    "FINGERBOARD": "Ebony",
    "SCALE LENGTH": "640 mm",
    "NUT WIDTH": "50 mm",
    "BRIDGE": "Rosewood",
    "FINISH": "French Polish"
  },
  "California": {
    "TOP WOOD": "Solid Adirondack Spruce",
    "BACK & SIDES": "Solid Figured Mahogany",
    "NECK": "Mahogany",
    "FINGERBOARD": "Richlite / Ebony",
    "SCALE LENGTH": "650 mm",
    "NUT WIDTH": "44.5 mm",
    "BRIDGE": "Ebony",
    "FINISH": "Open Pore Satin"
  },
  "Tiger": {
    "TOP WOOD": "Solid Tiger Myrtle",
    "BACK & SIDES": "Solid Tiger Myrtle",
    "NECK": "Mahogany",
    "FINGERBOARD": "Ebony",
    "SCALE LENGTH": "650 mm",
    "NUT WIDTH": "48 mm",
    "BRIDGE": "Ebony",
    "FINISH": "High Gloss"
  }
};

export default function GuitarDetail() {
  const [, params] = useRoute("/guitar/:code");
  const rawCode = params?.code ? decodeURIComponent(params.code).trim() : "";
  const { t } = useLocale();

  const { data: catalogGuitars = [], isLoading } = trpc.fonzo.guitars.list.useQuery();

  const foundGuitar = catalogGuitars.find((g: any) => {
    const c = (g.code || "").toString().toLowerCase().trim();
    const n = (g.name || "").toString().toLowerCase().trim();
    const target = rawCode.toLowerCase();
    return c === target || n === target || c.includes(target) || target.includes(c);
  });

  // เลือกระบบสเปค: ถ้ามีในฐานข้อมูลจำเพาะ ให้ใช้ตัวนั้น ถ้าไม่มีค่อยใช้ของเดิม
  const guitarName = foundGuitar?.name || foundGuitar?.code || rawCode;
  const matchedKey = Object.keys(SPEC_DATABASE).find(k => guitarName.includes(k));
  const uniqueSpecs = matchedKey ? SPEC_DATABASE[matchedKey] : (foundGuitar?.specs || {});

  const guitar = foundGuitar ? {
    ...foundGuitar,
    specs: uniqueSpecs
  } : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!guitar) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h2 className="text-2xl font-display">{t("ไม่พบรุ่นกีตาร์นี้", "Guitar model not found")}</h2>
        <Button asChild className="mt-6 bg-brand text-brand-foreground rounded-none">
          <Link href="/guitars">{t("กลับไปหน้ากีตาร์", "Back to guitars")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-10">
      <Link href="/guitars" className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("กลับไปหน้าแคตตาล็อก", "Back to catalog")}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="border border-border bg-card p-8 flex justify-center items-center min-h-[450px]">
          <img 
            src={guitar.image || guitar.imageUrl || "/fonzo-logo.png"} 
            alt={guitar.name || guitar.code} 
            className="w-full h-auto object-contain max-h-[550px] drop-shadow-md" 
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">
              {guitar.series || "Fonzo Custom"}
            </p>
            <h1 className="text-3xl font-display mt-2">{guitar.name || guitar.code}</h1>
            <p className="text-2xl font-display text-brand mt-4">
              {guitar.price && guitar.price > 0 ? `฿${Number(guitar.price).toLocaleString()}` : t("สอบถามราคา", "Price upon request")}
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {guitar.description || "กีตาร์อะคูสติกและคลาสสิกแฮนด์เมดระดับเวิลด์คลาส ออกแบบและควบคุมการผลิตโดย เบิร์ด เอกชัย เจียรกุล"}
          </p>

          {/* สเปคทางเทคนิคเฉพาะรุ่น */}
          {guitar.specs && Object.keys(guitar.specs).length > 0 && (
            <div className="border-t border-border pt-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground">{t("สเปคทางเทคนิค", "Technical Specifications")}</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {Object.entries(guitar.specs).map(([key, val]: [string, any]) => {
                  if (key === "description" || !val) return null;
                  return (
                    <div key={key} className="flex justify-between border-b border-border/50 py-1.5">
                      <span className="text-muted-foreground uppercase tracking-wider">{key}</span>
                      <span className="font-medium text-foreground text-right">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {t("สถานะสินค้า", "Stock Status")}: <span className="font-bold text-foreground">{t("มีสินค้าพร้อมส่ง", "Available in stock")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}