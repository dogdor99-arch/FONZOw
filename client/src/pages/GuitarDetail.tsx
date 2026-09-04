import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { ProductDetailView } from "@/components/site/ProductDetailView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function GuitarDetail() {
  const { code = "" } = useParams<{ code: string }>();
  const { locale, t } = useLocale();

  const { data: product, isLoading: catalogLoading } = trpc.fonzo.guitars.byCode.useQuery(
    { code },
    { enabled: Boolean(code) },
  );
  const { data: all = [] } = trpc.fonzo.guitars.list.useQuery();

  const [supabaseProduct, setSupabaseProduct] = useState<any>(null);
  const [loadingSupa, setLoadingSupa] = useState(true);

  const decodedCode = decodeURIComponent(code || "").trim().toLowerCase();

  // ดึงข้อมูลลิงก์ตรงรายชิ้นที่บันทึกไว้ใน Supabase มาผสานร่วม
  useEffect(() => {
    async function fetchSupabaseProduct() {
      if (!decodedCode) return;
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data) {
          const found = data.find((p) => {
            const pName = (p.name || "").toLowerCase().trim();
            const pId = p.id?.toString();
            return pName === decodedCode || pId === decodedCode || decodedCode.includes(pName);
          });
          if (found) setSupabaseProduct(found);
        }
      } catch (err) {
        console.error("Error fetching supabase product:", err);
      } finally {
        setLoadingSupa(false);
      }
    }
    fetchSupabaseProduct();
  }, [decodedCode]);

  const related = product
    ? all.filter(item => item.typeCode === product.typeCode && item.code !== product.code).slice(0, 4)
    : [];

  const isLoading = catalogLoading || loadingSupa;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse bg-secondary" />
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse bg-secondary" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product && !supabaseProduct) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
        <h1 className="text-3xl">{t("ไม่พบรุ่นกีตาร์นี้", "Model not found")}</h1>
        <p className="mt-4 text-muted-foreground">
          {t(
            "รุ่นที่คุณค้นหาอาจถูกนำออกจากแคตตาล็อกแล้ว",
            "The model you are looking for may no longer be in the catalogue.",
          )}
        </p>
        <Button
          asChild
          className="press mt-8 h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
          <Link href="/guitar">{t("กลับไปหน้ากีตาร์", "Back to guitars")}</Link>
        </Button>
      </div>
    );
  }

  // ผสานข้อมูลระหว่างแคตตาล็อกกลางกับลิงก์ตรงรายชิ้นใน Supabase
  const getVal = (obj: any, ...keys: string[]) => {
    if (!obj) return "";
    for (const k of keys) {
      if (obj[k] && typeof obj[k] === 'string' && obj[k].trim() !== "") return obj[k].trim();
    }
    return "";
  };

  const shopeeUrl = getVal(supabaseProduct, "shopee_url", "shopeeUrl", "shopee", "shopeeLink") || getVal(product, "shopee_url", "shopeeUrl", "shopee");
  const lazadaUrl = getVal(supabaseProduct, "lazada_url", "lazadaUrl", "lazada", "lazadaLink") || getVal(product, "lazada_url", "lazadaUrl", "lazada");

  const mergedProduct = {
    ...(product || {}),
    ...(supabaseProduct || {}),
    name: supabaseProduct?.name || product?.name,
    price: supabaseProduct?.price !== undefined ? supabaseProduct.price : product?.price,
    description: supabaseProduct?.description || product?.description,
    shopee_url: shopeeUrl,
    shopeeUrl: shopeeUrl,
    lazada_url: lazadaUrl,
    lazadaUrl: lazadaUrl,
  };

  const title = locale === "th" ? mergedProduct.name || mergedProduct.nameEn : mergedProduct.nameEn || mergedProduct.name;

  return (
    <>
      <div className="border-b border-border/70">
        <nav
          aria-label="breadcrumb"
          className="mx-auto flex max-w-[1400px] items-center gap-1.5 px-4 py-5 text-[11px] text-muted-foreground sm:px-6 lg:px-10">
          <Link href="/" className="tracking-[0.14em] uppercase hover:text-brand">
            {t("หน้าแรก", "Home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/guitar" className="tracking-[0.14em] uppercase hover:text-brand">
            Guitar
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-foreground/80">{title}</span>
        </nav>
      </div>

      <ProductDetailView product={mergedProduct} related={related} basePath="/guitar" />
    </>
  );
}