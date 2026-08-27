import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuitarDetail() {
  const [, params] = useRoute("/guitar/:code");
  const rawCode = params?.code ? decodeURIComponent(params.code).trim() : "";
  const { t } = useLocale();

  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  const [guitar, setGuitar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function resolveGuitar() {
      if (!rawCode || catalogLoading) return;

      // 1. หาข้อมูลสเปคแบบเต็มจากไฟล์แคตตาล็อกหลัก
      const baseGuitar = catalogGuitars.find((g: any) => 
        (g.code || "").toLowerCase() === rawCode.toLowerCase() ||
        (g.name || "").toLowerCase() === rawCode.toLowerCase()
      );

      // 2. หาข้อมูล ราคา/สต็อก ที่มีการแก้ไขจากหน้า Admin (Supabase)
      const { data: dbData } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${rawCode}%`)
        .maybeSingle();

      // 3. รวมร่างข้อมูล (เอาสเปคหลักเป็นฐาน ทับด้วยราคาและสต็อกใหม่จาก Admin)
      if (baseGuitar || dbData) {
        setGuitar({
          ...(baseGuitar || {}), 
          ...(dbData || {}),
          name: dbData?.name || baseGuitar?.name || rawCode,
          price: dbData?.price ?? baseGuitar?.price ?? 0,
          stock: dbData?.stock ?? baseGuitar?.stock ?? 10,
          image: dbData?.image_url || baseGuitar?.image || "/fonzo-logo.png",
          description: dbData?.description || baseGuitar?.description || "กีตาร์คุณภาพสูงจาก Fonzo Guitar",
          specs: baseGuitar?.specs || {}, // ดึงสเปคจากไฟล์หลักเสมอ
          features: baseGuitar?.features || [] // ดึงฟีเจอร์จากไฟล์หลักเสมอ
        });
      }
      setIsLoading(false);
    }

    resolveGuitar();
  }, [rawCode, catalogGuitars, catalogLoading]);

  if (isLoading || catalogLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;
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
          <img src={guitar.image} alt={guitar.name} className="w-full h-auto object-contain max-h-[550px] drop-shadow-md" />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">{guitar.series || guitar.category || "Fonzo Custom"}</p>
            <h1 className="text-3xl font-display mt-2">{guitar.name}</h1>
            <p className="text-2xl font-display text-brand mt-4">
              {guitar.price > 0 ? `฿${Number(guitar.price).toLocaleString()}` : t("สอบถามราคา", "Price upon request")}
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{guitar.description}</p>

          {/* ตารางสเปคจะกลับมา 100% */}
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

          <div className="border-t border-border pt-6 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {t("สถานะสินค้า", "Stock Status")}: <span className="font-bold text-foreground">{guitar.stock > 0 ? `${t("มีสินค้า", "In Stock")} (${guitar.stock} ${t("ตัว", "pcs")})` : t("สินค้าหมด", "Out of Stock")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}