import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuitarDetail() {
  const [, params] = useRoute("/guitar/:code");
  const rawCode = params?.code ? decodeURIComponent(params.code) : "";
  const { t } = useLocale();

  // 1. ดึงข้อมูลจาก tRPC หลัก (ซึ่งมีสเปคและรายละเอียดครบถ้วน)
  const { data: catalogGuitar, isLoading: trpcLoading } = trpc.fonzo.guitars.getByCode.useQuery(
    { code: rawCode },
    { enabled: !!rawCode }
  );

  // 2. ถ้าไม่เจอใน tRPC ลองหาใน Supabase (สำหรับสินค้าที่เพิ่มเอง)
  const [supaGuitar, setSupaGuitar] = useState<any>(null);
  const [supaLoading, setSupaLoading] = useState(false);

  useEffect(() => {
    if (!trpcLoading && !catalogGuitar && rawCode) {
      setSupaLoading(true);
      supabase
        .from("products")
        .select("*")
        .ilike("name", rawCode)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setSupaGuitar({
              id: data.id,
              code: data.name,
              name: data.name,
              series: data.category || "Fonzo Custom",
              price: Number(data.price || 0),
              image: data.image_url || "/fonzo-logo.png",
              description: data.description || "กีตาร์คุณภาพสูงจาก Fonzo Guitar",
              stock: data.stock,
            });
          }
          setSupaLoading(false);
        })
        .catch(() => setSupaLoading(false));
    } else {
      setSupaLoading(false);
    }
  }, [catalogGuitar, trpcLoading, rawCode]);

  const guitar = catalogGuitar || supaGuitar;
  const isLoading = trpcLoading || supaLoading;

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
        <p className="mt-2 text-sm text-muted-foreground">{t("รุ่นที่คุณค้นหาอาจถูกย้ายออกจากแคตตาล็อกแล้ว", "The model you are looking for may have been removed.")}</p>
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
        <div className="border border-border bg-card p-6 flex justify-center items-center min-h-[400px]">
          <img src={guitar.image || guitar.imageUrl || "/fonzo-logo.png"} alt={guitar.name || guitar.code} className="w-full h-auto object-contain max-h-[500px]" />
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">{guitar.series || guitar.category || "Fonzo Custom"}</p>
            <h1 className="text-3xl font-display mt-2">{guitar.name || guitar.code}</h1>
            <p className="text-2xl font-display text-brand mt-4">
              {guitar.price ? `฿${Number(guitar.price).toLocaleString()}` : t("สอบถามราคา", "Price upon request")}
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {guitar.description || guitar.specs || t("กีตาร์คุณภาพสูง ออกแบบมาเพื่อเสียงอันประณีตและการเล่นที่พริ้วไหว", "Premium crafted guitar for exceptional tone and playability.")}
          </p>
          
          {guitar.features && Array.isArray(guitar.features) && (
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground">{t("คุณสมบัติเด่น", "Key Features")}</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                {guitar.features.map((feat: string, i: number) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {t("สถานะสินค้า", "Stock Status")}: <span className="font-bold text-foreground">{guitar.stock !== undefined ? (guitar.stock > 0 ? `${t("มีสินค้า", "In Stock")} (${guitar.stock} ${t("ตัว", "pcs")})` : t("สินค้าหมด", "Out of Stock")) : t("มีสินค้าพร้อมส่ง", "Available")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}