import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, MessageCircle, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { CustomConfigurator } from "@/components/site/CustomConfigurator";
import { readCustomizer, withProductMeta } from "@shared/fonzo/customizer";
import { cn } from "@/lib/utils";

function youtubeEmbed(url: string): string | null {
  const patterns = [/[?&]v=([\w-]{6,})/, /youtu\.be\/([\w-]{6,})/, /embed\/([\w-]{6,})/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export default function GuitarCustomDetail() {
  const { code } = useParams();
  const { t } = useLocale();
  const { data: catalogGuitars, isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  const catalogRows = (catalogGuitars as any[] | undefined) ?? [];
  const { data: catalogDetail, isLoading: detailLoading } = trpc.fonzo.guitars.byCode.useQuery(
    { code: decodeURIComponent(code || "") },
    { enabled: Boolean(code) },
  );
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [loadingSupabase, setLoadingSupabase] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    let active = true;
    supabase.from("products").select("*").then(({ data }) => {
      if (active) setSupabaseProducts(data || []);
      if (active) setLoadingSupabase(false);
    });
    return () => { active = false; };
  }, []);

  const product = useMemo(() => {
    const decoded = decodeURIComponent(code || "").trim().toLowerCase();
    const clean = (value: unknown) => String(value || "").toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, "");
    const catalog = catalogRows.find((item: any) => [item.name, item.code].some(value => clean(value) === clean(decoded) || clean(decoded).includes(clean(value))));
    const supabaseMatch = supabaseProducts.find(item => clean(item.specs?.sourceCode) === clean(decoded) || clean(item.code) === clean(decoded))
      || supabaseProducts.find(item => [item.name, item.id].some(value => clean(value) === clean(decoded) || clean(decoded).includes(clean(value))));
    if (!catalog && !supabaseMatch) return null;

    const base = { ...(catalog || {}), ...(catalogDetail || {}) };
    const override = supabaseMatch || {};
    const images = Array.isArray(override.image_urls) && override.image_urls.length > 0
      ? override.image_urls
      : Array.isArray(base.images) && base.images.length > 0
        ? base.images.map((image: any) => typeof image === "string" ? image : image.url).filter(Boolean)
        : [override.image_url || base.image || "/fonzo-logo.png"];

    const overrideSpecEntries = override.specs && typeof override.specs === "object" && !Array.isArray(override.specs)
      ? Object.entries(override.specs).filter(([key, value]) => !["customizer", "purchaseMode", "customFamily"].includes(key) && value !== null && value !== undefined && value !== "")
      : [];
    const mergedSpecs = overrideSpecEntries.length > 0 ? override.specs : (base.specs || {});

    return withProductMeta({
      ...base,
      ...override,
      code: override.code || base.code || override.name,
      name: override.name || base.name || decoded,
      nameEn: override.name_en || base.nameEn || override.name || decoded,
      price: override.price !== undefined ? (override.price == null ? null : Number(override.price)) : base.price,
      category: override.category || base.seriesName || base.typeName,
      seriesName: override.category || base.seriesName,
      image: images[0],
      images,
      specs: mergedSpecs,
      shopeeUrl: override.shopee_url || override.shopeeUrl || override.shopee || base.shopeeUrl || null,
      lazadaUrl: override.lazada_url || override.lazadaUrl || override.lazada || base.lazadaUrl || null,
      videoUrl: override.video_url || override.videoUrl || override.video || override.guitar_vdo || override.specs?.videoUrl || override.specs?.video_url || base.videoUrl || null,
    });
  }, [catalogRows, catalogDetail, supabaseProducts, code]);

  const images = useMemo(() => product?.images?.map((image: any) => typeof image === "string" ? image : image.url).filter(Boolean) || ["/fonzo-logo.png"], [product]);
  useEffect(() => { setSelectedImage(images[0] || ""); }, [images]);
  const config = useMemo(() => product ? readCustomizer(product) : null, [product]);
  const videoEmbed = product?.videoUrl ? youtubeEmbed(product.videoUrl) : null;
  const specs = product?.specs || {};
  const specsEntries = useMemo(() => {
    if (Array.isArray(specs)) {
      return specs
        .map((item: any) => [item.title || item.key || "Specification", item.value])
        .filter(([key, value]: any[]) => !/^(sourceurl|source_url|sourcecode|source_code)$/i.test(String(key)) && value !== null && value !== undefined && value !== "");
    }
    return Object.entries(specs).filter(([key, value]) => !["customizer", "purchaseMode", "customFamily"].includes(key) && !/^(sourceurl|source_url|sourcecode|source_code)$/i.test(key) && value !== null && value !== undefined && value !== "");
  }, [specs]);
  const isLoading = catalogLoading || detailLoading || loadingSupabase;

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;
  if (!product) return <div className="mx-auto max-w-lg px-4 py-24 text-center"><h2 className="text-xl font-display">{t("ไม่พบข้อมูลกีตาร์รุ่นนี้", "Custom guitar not found")}</h2><Link href="/guitar-custom" className="mt-6 inline-block bg-brand px-6 py-3 text-xs uppercase tracking-widest text-brand-foreground">{t("กลับสู่ Guitar Custom", "Back to Guitar Custom")}</Link></div>;

  const title = product.name || product.code;
  return (
    <>
      <PageHeading
        title={title}
        crumbs={[{ label: "Guitar Custom", href: "/guitar-custom" }, { label: title }]}
        index="04"
        compact
      />
      <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <Link href="/guitar-custom" className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand"><ArrowLeft className="mr-2 h-4 w-4" />{t("กลับไป Guitar Custom", "Back to Guitar Custom")}</Link>
        <div className="mt-4 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden border border-border bg-card p-6">
              <img src={selectedImage || images[0]} alt={title} className="max-h-[620px] w-full object-contain" onError={event => { event.currentTarget.src = "/fonzo-logo.png"; }} />
            </div>
            {images.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2">{images.map((image: string, index: number) => <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(image)} className={cn("h-20 w-20 shrink-0 border p-1", selectedImage === image ? "border-brand ring-2 ring-brand/20" : "border-border")}><img src={image} alt={`${title} ${index + 1}`} className="h-full w-full object-contain" /></button>)}</div>}
            <div className="mt-6 space-y-3 border-t border-border pt-5"><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">ช่องทางติดต่อ / สั่งซื้อ</p><div className="flex flex-col gap-3">{product.shopeeUrl && <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center bg-[#ee4d2d] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"><ShoppingBag className="mr-2 h-4 w-4" />สั่งซื้อผ่าน Shopee<ExternalLink className="ml-2 h-3.5 w-3.5" /></a>}{product.lazadaUrl && <a href={product.lazadaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center bg-[#0f146d] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"><ShoppingBag className="mr-2 h-4 w-4" />สั่งซื้อผ่าน Lazada<ExternalLink className="ml-2 h-3.5 w-3.5" /></a>}<Link href="/contact" className="inline-flex w-full items-center justify-center bg-brand px-6 py-3 text-xs font-bold uppercase tracking-widest text-brand-foreground"><MessageCircle className="mr-2 h-4 w-4" />ติดต่อสอบถาม / สั่งซื้อโดยตรง</Link></div></div>
            <div className="mt-6 space-y-3 border-t border-border pt-5 text-xs text-muted-foreground"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" />{t("รองรับการประเมินราคาแบบกำหนดสเปก", "Specification-based price estimation")}</div><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand" />{t("ทีมงาน Fonzo ติดต่อกลับเพื่อยืนยันรายละเอียด", "Fonzo team will confirm the final specification")}</div></div>
          </div>
          <div className="space-y-8">
            {videoEmbed && <div className="border-t border-border pt-6"><p className="eyebrow">{t("ฟังเสียงจริง", "Hear it played")}</p><h2 className="mt-3 text-2xl sm:text-3xl">{t("วิดีโอสาธิตเสียง", "Sound demonstration")}</h2><div className="mt-6 aspect-video w-full bg-ink"><iframe src={videoEmbed} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full border-0" /></div></div>}
            <CustomConfigurator config={config} fallbackImage={images[0]} basePrice={product.price} />
            {product.description && <div className="border-t border-border pt-6"><h2 className="text-xl font-display">{t("ประวัติกีตาร์", "Guitar story")}</h2><p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p></div>}
            {specsEntries.length > 0 && <div className="border-t border-border pt-6"><p className="eyebrow">{t("รายละเอียดและสเปกกีต้าเดิม", "Original details and specifications")}</p><dl className="mt-4 divide-y divide-border border-y border-border">{specsEntries.map(([key, value]) => <div key={String(key)} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-muted-foreground">{String(key)}</dt><dd className="text-right">{String(value)}</dd></div>)}</dl></div>}
          </div>
        </div>
      </section>
    </>
  );
}
