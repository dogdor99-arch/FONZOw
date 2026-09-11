import { Link, useParams } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { ProductDetailView } from "@/components/site/ProductDetailView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AccessoryDetail() {
  const { code = "" } = useParams<{ code: string }>();
  const { locale, t } = useLocale();

  const { data: product, isLoading } = trpc.fonzo.accessories.byCode.useQuery(
    { code },
    { enabled: Boolean(code) },
  );
  const { data: all = [] } = trpc.fonzo.accessories.list.useQuery();
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.from("products").select("*").then(({ data }) => {
      if (active) setAdminProducts(data ?? []);
      if (active) setAdminLoading(false);
    });
    return () => { active = false; };
  }, []);

  const displayProduct = useMemo(() => {
    if (!product) return null;
    const admin = adminProducts.find(item =>
      item.name?.trim().toLowerCase() === product.name?.trim().toLowerCase() ||
      item.specs?.sourceCode === product.code,
    );
    if (admin?.specs?.hidden) return null;
    if (!admin) return product;
    const adminSpecs = admin.specs && typeof admin.specs === "object" && !Array.isArray(admin.specs)
      ? Object.entries(admin.specs)
        .filter(([key, value]) => !/^(sourceurl|source_url|sourcecode|source_code|purchaseMode|customizer|customFamily)$/i.test(key) && value !== null && value !== undefined && value !== "")
        .map(([title, value]) => ({ title, value: String(value) }))
      : [];
    return {
      ...product,
      description: admin.description || product.description,
      descriptionEn: admin.description || product.descriptionEn,
      shopeeUrl: admin.shopee_url || admin.shopeeUrl || admin.shopee || product.shopeeUrl || null,
      lazadaUrl: admin.lazada_url || admin.lazadaUrl || admin.lazada || product.lazadaUrl || null,
      videoUrl: admin.video_url || admin.videoUrl || admin.video || admin.specs?.videoUrl || admin.specs?.video_url || product.videoUrl || null,
      specs: adminSpecs.length > 0 ? adminSpecs : product.specs,
      specsEn: adminSpecs.length > 0 ? adminSpecs : product.specsEn,
      images: admin.image_urls?.length ? admin.image_urls.map((url: string) => ({ url, isDefault: false })) : product.images,
    };
  }, [product, adminProducts]);

  const related = product
    ? all.filter(item => item.typeCode === product.typeCode && item.code !== product.code).slice(0, 4)
    : [];

  if (isLoading || adminLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse bg-secondary" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse bg-secondary" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product || !displayProduct) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
        <h1 className="text-3xl">{t("ไม่พบสินค้านี้", "Item not found")}</h1>
        <Button
          asChild
          className="press mt-8 h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
          <Link href="/accessories">{t("กลับไปหน้าอุปกรณ์", "Back to accessories")}</Link>
        </Button>
      </div>
    );
  }

  const title = locale === "th" ? displayProduct?.name || displayProduct?.nameEn : displayProduct?.nameEn || displayProduct?.name;

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
          <Link href="/accessories" className="tracking-[0.14em] uppercase hover:text-brand">
            Accessories
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-foreground/80">{title}</span>
        </nav>
      </div>

      <ProductDetailView product={displayProduct ?? product} related={related} basePath="/accessories" />
    </>
  );
}
