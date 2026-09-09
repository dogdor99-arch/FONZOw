import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { withProductMeta } from "@shared/fonzo/customizer";
import type { CustomFamily } from "@shared/fonzo/types";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

function isAccessoryProduct(product: any) {
  const sourceCode = String(product?.specs?.sourceCode ?? product?.code ?? "").toUpperCase();
  if (sourceCode.startsWith("A")) return true;
  return /accessor|อุปกรณ์|อะไหล่|string|สายกีตาร์|strings|bag|case|pick|pickup|capo|tuner|เครื่องตั้งสาย/i.test([product.category, product.name, product.nameEn].filter(Boolean).join(" "));
}

export default function GuitarCustomList() {
  const { t } = useLocale();
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [loadingSupabase, setLoadingSupabase] = useState(true);
  const [family, setFamily] = useState<"all" | CustomFamily>("all");
  const [query, setQuery] = useState("");

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
    const supaByCode = new Map<string, any>();
    supabaseProducts.forEach(item => {
      if (item.name) supaByName.set(item.name.toLowerCase().trim(), item);
      const sourceCode = String(item.specs?.sourceCode ?? item.code ?? "").toUpperCase();
      if (sourceCode) supaByCode.set(sourceCode, item);
    });

    const catalogByCode = new Map<string, any>();
    catalogGuitars.forEach((item: any) => { if (item.code) catalogByCode.set(String(item.code).toUpperCase(), item); });

    const formatted = supabaseProducts.filter(item => item.name !== "__founder_page__" && item.category !== "__site_content__").map(item => {
      const sourceCode = String(item.specs?.sourceCode ?? item.code ?? "").toUpperCase();
      const catalog = catalogByCode.get(sourceCode) || supaByName.get(String(item.name || "").toLowerCase().trim());
      const images = Array.isArray(item.image_urls) && item.image_urls.length > 0
        ? item.image_urls
        : item.image_url ? [item.image_url] : catalog?.image ? [catalog.image] : [];
      const noPrice = item.price === null || item.price === undefined || item.price === "" || Number(item.price) <= 0;
      return withProductMeta({
        ...catalog,
        ...item,
        code: sourceCode || catalog?.code || item.name,
        name: item.name,
        nameEn: item.name_en || item.name,
        seriesName: item.category || catalog?.seriesName || "Fonzo Custom",
        typeName: item.type_name || catalog?.typeName || item.category || "Fonzo Custom",
        price: item.price == null ? null : Number(item.price),
        priceLabel: item.price == null ? "Enquiry" : String(item.price),
        image: images[0] || "/fonzo-logo.png",
        images,
        shopeeUrl: item.shopee_url || item.shopeeUrl || item.shopee || null,
        lazadaUrl: item.lazada_url || item.lazadaUrl || item.lazada || null,
        videoUrl: item.video_url || item.videoUrl || item.video || item.specs?.videoUrl || item.specs?.video_url || catalog?.videoUrl || null,
        purchaseMode: item.specs?.purchaseMode || catalog?.purchaseMode || (!isAccessoryProduct(item) && noPrice ? "custom" : item.purchaseMode),
        customFamily: item.specs?.customFamily || catalog?.customFamily || (String(item.category || catalog?.seriesName || "").toLowerCase().includes("selection") ? "selection" : "custom"),
      });
    });

    const legacy = catalogGuitars
      .filter((item: any) => !supaByCode.has(String(item.code || "").toUpperCase()) && !supaByName.has((item.name || item.code || "").toLowerCase().trim()))
      .map((item: any) => withProductMeta(item));

    return [...formatted, ...legacy]
      .filter(item => !isAccessoryProduct(item) && item.purchaseMode === "custom")
      .sort((a, b) => Number(Boolean(b.videoUrl)) - Number(Boolean(a.videoUrl)) || Number(a.order ?? 0) - Number(b.order ?? 0));
  }, [catalogGuitars, supabaseProducts]);

  const filtered = useMemo(
    () => {
      const q = query.trim().toLowerCase();
      return products.filter(item => {
        if (family !== "all" && item.customFamily !== family) return false;
        if (!q) return true;
        const haystack = `${item.name} ${item.nameEn} ${item.code} ${item.category} ${item.seriesName} ${item.typeName}`.toLowerCase();
        return haystack.includes(q);
      });
    },
    [family, products, query],
  );
  const countCustom = products.filter(item => item.customFamily === "custom").length;
  const countSelection = products.filter(item => item.customFamily === "selection").length;
  const loading = catalogLoading || loadingSupabase;

  return (
    <>
      <CompactPageHeading
        title="Guitar Custom"
        crumbs={[{ label: "Guitar Custom" }]}
        storeNav
      />

      <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[230px_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-28 lg:self-start lg:border-r lg:border-border/60 lg:pr-8"><p className="eyebrow">{t("หมวดกีตาร์สั่งทำ", "Custom categories")}</p><div className="mt-3 h-px w-10 bg-brand/40" /><div className="mt-4 space-y-1.5">
          {[
            { key: "all" as const, label: t("ทั้งหมด", "All"), count: products.length },
            { key: "custom" as const, label: "Fonzo Custom", count: countCustom },
            { key: "selection" as const, label: "Fonzo Selection", count: countSelection },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFamily(item.key)}
              className={cn("block w-full border px-4 py-2.5 text-center text-xs tracking-[0.12em] uppercase transition-colors", family === item.key ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand")}>
              {item.label} <span className="ml-1 opacity-70">{item.count}</span>
            </button>
          ))}
          </div></aside>
          <div>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={event => setQuery(event.target.value)} placeholder={t("ค้นหาชื่อรุ่น รหัส หรือหมวดหมู่", "Search model, code or category")} className="h-10 rounded-none border-border pl-10 pr-10" aria-label={t("ค้นหากีตาร์ Custom", "Search custom guitars")} />
              {query && <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={t("ล้างการค้นหา", "Clear search")}><X className="h-4 w-4" /></button>}
            </div>
            <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{loading ? t("กำลังโหลด…", "Loading…") : `${filtered.length} ${t("รายการ", "models")}`}</p>
            <div className="mt-4 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />) : filtered.map(product => <ProductCard key={product.code} product={product} basePath="/guitar-custom" />)}
            </div>
            {!loading && filtered.length === 0 && <div className="mt-12 border border-border p-10 text-center text-sm text-muted-foreground">{t("ยังไม่มีรุ่น Custom ที่ตั้งค่าข้อมูลในระบบ", "No Custom models have been configured yet.")}</div>}
          </div>
        </div>
      </section>
    </>
  );
}
