import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { withProductMeta } from "@shared/fonzo/customizer";
import type { CustomFamily } from "@shared/fonzo/types";
import { PageHeading } from "@/components/site/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";

export default function GuitarCustomList() {
  const { t } = useLocale();
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [loadingSupabase, setLoadingSupabase] = useState(true);
  const [family, setFamily] = useState<"all" | CustomFamily>("all");

  useEffect(() => {
    let active = true;
    supabase.from("products").select("*").order("id", { ascending: false }).then(({ data }) => {
      if (active) setSupabaseProducts(data || []);
      if (active) setLoadingSupabase(false);
    });
    return () => { active = false; };
  }, []);

  const products = useMemo(() => {
    const supaByName = new Map<string, any>();
    supabaseProducts.forEach(item => {
      if (item.name) supaByName.set(item.name.toLowerCase().trim(), item);
    });

    const formatted = supabaseProducts.map(item => {
      const images = Array.isArray(item.image_urls) && item.image_urls.length > 0
        ? item.image_urls
        : item.image_url ? [item.image_url] : [];
      return withProductMeta({
        ...item,
        code: item.code || item.name,
        name: item.name,
        nameEn: item.name_en || item.name,
        seriesName: item.category || "Fonzo Custom",
        typeName: item.type_name || item.category || "Fonzo Custom",
        price: item.price == null ? null : Number(item.price),
        priceLabel: item.price == null ? "Enquiry" : String(item.price),
        image: images[0] || "/fonzo-logo.png",
        images,
        shopeeUrl: item.shopee_url || item.shopeeUrl || item.shopee || null,
        lazadaUrl: item.lazada_url || item.lazadaUrl || item.lazada || null,
      });
    });

    const legacy = catalogGuitars
      .filter((item: any) => !supaByName.has((item.name || item.code || "").toLowerCase().trim()))
      .map((item: any) => withProductMeta(item));

    return [...formatted, ...legacy].filter(item => item.purchaseMode === "custom");
  }, [catalogGuitars, supabaseProducts]);

  const filtered = useMemo(
    () => family === "all" ? products : products.filter(item => item.customFamily === family),
    [family, products],
  );
  const countCustom = products.filter(item => item.customFamily === "custom").length;
  const countSelection = products.filter(item => item.customFamily === "selection").length;
  const loading = catalogLoading || loadingSupabase;

  return (
    <>
      <PageHeading
        eyebrow={t("กีตาร์สั่งทำ", "Bespoke guitars")}
        title="Guitar Custom"
        description={t(
          "เลือกฐานกีตาร์จาก Fonzo Custom หรือ Fonzo Selection แล้วปรับแต่งวัสดุและชิ้นส่วนเพื่อประเมินราคา",
          "Choose a Fonzo Custom or Fonzo Selection base, then configure materials and components for an estimated price.",
        )}
        crumbs={[{ label: "Guitar Custom" }]}
        index="04"
        aside={<div className="hidden text-right sm:block"><p className="eyebrow">{t("รุ่นที่ปรับแต่งได้", "Configurable models")}</p><p className="mt-2 font-display text-3xl tabular-nums">{loading ? "—" : products.length}</p></div>}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {[
            { key: "all" as const, label: t("ทั้งหมด", "All"), count: products.length },
            { key: "custom" as const, label: "Fonzo Custom", count: countCustom },
            { key: "selection" as const, label: "Fonzo Selection", count: countSelection },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFamily(item.key)}
              className={cn("border px-4 py-2.5 text-xs tracking-[0.12em] uppercase transition-colors", family === item.key ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand")}>
              {item.label} <span className="ml-1 opacity-70">{item.count}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-10">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{loading ? t("กำลังโหลด…", "Loading…") : `${filtered.length} ${t("รายการ", "models")}`}</p>
        <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
            : filtered.map(product => <ProductCard key={product.code} product={product} basePath="/guitar-custom" />)}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="mt-12 border border-border p-10 text-center text-sm text-muted-foreground">
            {t("ยังไม่มีรุ่น Custom ที่ตั้งค่าข้อมูลในระบบ", "No Custom models have been configured yet.")}
          </div>
        )}
      </section>
    </>
  );
}
