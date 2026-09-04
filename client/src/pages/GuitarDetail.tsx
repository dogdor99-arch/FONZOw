import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag, ExternalLink, MessageCircle } from "lucide-react";
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

      const { data: supaData } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${rawCode}%`)
        .maybeSingle();

      if (supaData) {
        setGuitar({
          id: supaData.id,
          code: supaData.name,
          name: supaData.name,
          series: supaData.category || "Fonzo Custom",
          price: Number(supaData.price || 0),
          image: supaData.image_url || "/fonzo-logo.png",
          description: supaData.description || "กีตาร์คุณภาพสูงจาก Fonzo Guitar งานประกอบประณีต",
          stock: supaData.stock,
          shopee_url: supaData.shopee_url || "",
          lazada_url: supaData.lazada_url || "",
        });
        setIsLoading(false);
        return;
      }

      const found = catalogGuitars.find((g: any) => {
        const c = (g.code || "").toString().toLowerCase().trim();
        const n = (g.name || "").toString().toLowerCase().trim();
        const target = rawCode.toLowerCase();
        return c === target || n === target || c.includes(target) || target.includes(c);
      });

      if (found) {
        setGuitar(found);
      }

      setIsLoading(false);
    }

    resolveGuitar();
  }, [rawCode, catalogGuitars, catalogLoading]);

  if (isLoading || catalogLoading) {
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
          <Link href="/guitar">{t("กลับไปหน้ากีตาร์", "Back to guitars")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-10">
      <Link href="/guitar" className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("กลับไปหน้าแคตตาล็อก", "Back to catalog")}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* รูปภาพสินค้า */}
        <div className="border border-border bg-card p-8 flex justify-center items-center min-h-[450px]">
          <img 
            src={guitar.image || guitar.imageUrl || guitar.image_url || "/fonzo-logo.png"} 
            alt={guitar.name || guitar.code} 
            className="w-full h-auto object-contain max-h-[550px] drop-shadow-md" 
          />
        </div>

        {/* ข้อมูลและสเปค */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">
              {guitar.series || guitar.category || "Fonzo Custom"}
            </p>
            <h1 className="text-3xl font-display mt-2">{guitar.name || guitar.code}</h1>
            <p className="text-2xl font-display text-brand mt-4">
              {guitar.price && guitar.price > 0 ? `฿${Number(guitar.price).toLocaleString()}` : t("สอบถามราคา", "Price upon request")}
            </p>
          </div>

          {/* ปุ่มสั่งซื้อ Shopee / Lazada */}
          <div className="space-y-3 pt-2 pb-2">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{t("ช่องทางสั่งซื้อ / ร้านค้าออนไลน์", "Buy Online")}</p>
            <div className="flex flex-col gap-2.5">
              {guitar.shopee_url && (
                <a href={guitar.shopee_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#ee4d2d] hover:bg-[#d73211] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                  <ShoppingBag className="mr-2 h-4 w-4" /> สั่งซื้อผ่าน Shopee <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              )}

              {guitar.lazada_url && (
                <a href={guitar.lazada_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#0f146d] hover:bg-[#0b0e52] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                  <ShoppingBag className="mr-2 h-4 w-4" /> สั่งซื้อผ่าน Lazada <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              )}

              <Link href={guitar.line_url || "/contact"} className="inline-flex items-center justify-center bg-brand hover:bg-brand/90 text-brand-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                <MessageCircle className="mr-2 h-4 w-4" /> {t("ติดต่อสอบถาม / สั่งซื้อโดยตรง", "Direct inquiry / order")}
              </Link>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {guitar.description || guitar.specs?.description || t("กีตาร์คุณภาพสูง ออกแบบมาเพื่อเสียงอันประณีตและการเล่นที่พริ้วไหว", "Premium crafted guitar for exceptional tone and playability.")}
          </p>

          {/* รายละเอียดสเปคทางเทคนิค (Specs) */}
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

          {/* คุณสมบัติเด่น (Features) */}
          {guitar.features && Array.isArray(guitar.features) && guitar.features.length > 0 && (
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground">{t("คุณสมบัติเด่น", "Key Features")}</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                {guitar.features.map((feat: string, i: number) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* สถานะสต็อกและบริการ */}
          <div className="border-t border-border pt-6 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {t("สถานะสินค้า", "Stock Status")}: <span className="font-bold text-foreground">{guitar.stock !== undefined ? (guitar.stock > 0 ? `${t("มีสินค้า", "In Stock")} (${guitar.stock} ${t("ตัว", "pcs")})` : t("สินค้าหมด", "Out of Stock")) : t("มีสินค้าพร้อมส่ง", "Available")}</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> {t("รับประกันสินค้าแท้ 100% พร้อมเซ็ตอัพก่อนจัดส่ง", "100% Authentic with professional setup before shipping")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}