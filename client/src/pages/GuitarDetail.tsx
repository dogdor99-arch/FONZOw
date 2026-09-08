import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Truck, ArrowLeft, Loader2, ExternalLink, ShoppingBag, MessageCircle, Play } from "lucide-react";

function youtubeEmbed(url: string): string | null {
  const patterns = [/[?&]v=([\w-]{6,})/, /youtu\.be\/([\w-]{6,})/, /embed\/([\w-]{6,})/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export default function GuitarDetail() {
  const { code } = useParams();
  const { t } = useLocale();

  const { data: catalogGuitars, isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  const catalogRows = (catalogGuitars as any[] | undefined) ?? [];
  const { data: catalogDetail, isLoading: detailLoading } = trpc.fonzo.guitars.byCode.useQuery(
    { code: decodeURIComponent(code || "") },
    { enabled: Boolean(code) },
  );
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [loadingSupa, setLoadingSupa] = useState(true);

  const decodedCode = decodeURIComponent(code || "").trim().toLowerCase();

  useEffect(() => {
    async function fetchSupabaseProducts() {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data) {
          setSupabaseProducts(data);
        }
      } catch (err) {
        console.error("Error fetching supabase products:", err);
      } finally {
        setLoadingSupa(false);
      }
    }
    fetchSupabaseProducts();
  }, []);

  const guitar = useMemo(() => {
    const cleanStr = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, "").trim();
    const decodedClean = cleanStr(decodedCode);

    const catalogMatch = catalogRows.find((g: any) => {
      const gName = cleanStr(g.name);
      const gCode = cleanStr(g.code);
      return gName === decodedClean || gCode === decodedClean || decodedClean.includes(gName) || gName.includes(decodedClean);
    });

    const supaMatch = supabaseProducts.find((p) => cleanStr(p.specs?.sourceCode) === decodedClean || cleanStr(p.code) === decodedClean) || supabaseProducts.find((p) => {
      const pName = cleanStr(p.name);
      const pCode = cleanStr(p.code);
      const pId = cleanStr(p.id?.toString());
      return pName === decodedClean || pCode === decodedClean || pId === decodedClean || decodedClean.includes(pName) || pName.includes(decodedClean);
    });

    const base = catalogMatch || {};
    const supa = supaMatch || {};

    if (supaMatch || catalogMatch) {
      const overrideSpecEntries = supa.specs && typeof supa.specs === "object" && !Array.isArray(supa.specs)
        ? Object.entries(supa.specs).filter(([key, value]) => !["customizer", "purchaseMode", "customFamily"].includes(key) && value !== null && value !== undefined && value !== "")
        : [];
      const mergedSpecs = overrideSpecEntries.length > 0
        ? supa.specs
        : (catalogDetail?.specs && catalogDetail.specs.length > 0 ? catalogDetail.specs : (base.specs || {}));

      const nameStr = supa.name || base.name || catalogMatch?.name || decodedCode;

      // ลิงก์สำรองอย่างเป็นทางการของ Fonzo ที่ถูกต้อง 100%
      const fallbackShopee = "https://shopee.co.th/fonzo_guitar";
      const fallbackLazada = "https://www.lazada.co.th/shop/fonzo-guitar";

      const shopeeLink = supa.shopee_url || supa.shopeeUrl || supa.shopee || base.shopee_url || base.shopeeUrl || fallbackShopee;
      const lazadaLink = supa.lazada_url || supa.lazadaUrl || supa.lazada || base.lazada_url || base.lazadaUrl || fallbackLazada;
      const lineLink = supa.line_url || base.line_url || supa.lineUrl || base.lineUrl || "";

      return {
        ...base,
        ...supa,
        name: nameStr,
        price: supa.price !== undefined ? supa.price : base.price,
        description: supa.description || base.description,
        specs: mergedSpecs,
        images: supa.image_urls && supa.image_urls.length > 0
          ? supa.image_urls
          : (Array.isArray(base.images) && base.images.length > 0
            ? base.images.map((item: any) => typeof item === "string" ? item : item.url).filter(Boolean)
            : [supa.image_url || base.image || "/fonzo-logo.png"]),
        image: supa.image_urls?.[0] || supa.image_url || base.image || "/fonzo-logo.png",
        shopee_url: shopeeLink,
        lazada_url: lazadaLink,
        line_url: lineLink,
        videoUrl: supa.video_url || supa.videoUrl || supa.video || supa.guitar_vdo || supa.specs?.videoUrl || supa.specs?.video_url || base.videoUrl || null,
      };
    }

    return null;
  }, [catalogRows, catalogDetail, supabaseProducts, decodedCode]);

  const imagesList = useMemo(() => {
    if (!guitar) return ["/fonzo-logo.png"];
    return guitar.images && guitar.images.length > 0 ? guitar.images : [guitar.image || "/fonzo-logo.png"];
  }, [guitar]);

  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (imagesList.length > 0) {
      setSelectedImage(imagesList[0]);
    }
  }, [imagesList]);

  const specsEntries = useMemo(() => {
    if (!guitar) return [];
    const s: any = guitar.specs || {};
    if (Array.isArray(s)) {
      return s
        .map((item: any) => [item.title || item.key || "Specification", item.value])
        .filter(([key, value]: any[]) => !/^(sourceurl|source_url|sourcecode|source_code)$/i.test(String(key)) && value !== null && value !== undefined && value !== "");
    }
    const root = guitar as any;

    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        if (s[k] !== undefined && s[k] !== null && s[k] !== "" && s[k] !== "—") return s[k];
        if (root[k] !== undefined && root[k] !== null && root[k] !== "" && root[k] !== "—") return root[k];
      }
      return null;
    };

    const rawList = [
      ["Top Wood (ไม้หน้า)", getVal("TOP WOOD", "Top Wood", "topWood", "top_wood", "top")],
      ["Back & Sides (ไม้ข้างและหลัง)", getVal("BACK & SIDES", "Back & Sides", "backSides", "back_sides", "backAndSides")],
      ["Neck (คอกีตาร์)", getVal("NECK", "Neck", "neck")],
      ["Fingerboard (ฟิงเกอร์บอร์ด)", getVal("FINGERBOARD", "Fingerboard", "fingerboard")],
      ["Scale Length (สเกล)", getVal("SCALE LENGTH", "Scale Length", "scaleLength", "scale_length")],
      ["Nut Width (ความกว้างนัท)", getVal("NUT WIDTH", "Nut Width", "nutWidth", "nut_width")],
      ["Bridge (สะพานสาย)", getVal("BRIDGE", "Bridge", "bridge")],
      ["Finish (เคลือบผิว)", getVal("FINISH", "Finish", "finish")],
    ].filter(([_, val]) => val !== null && val !== undefined && val !== "");

    if (rawList.length === 0 && Object.keys(s).length > 0) {
      return Object.entries(s).filter(([key, val]) => !/^(sourceurl|source_url|sourcecode|source_code)$/i.test(key) && val !== null && val !== undefined && val !== "") as [string, any][];
    }
    return rawList;
  }, [guitar]);

  const isLoading = catalogLoading || detailLoading || loadingSupa;
  const videoEmbed = guitar?.videoUrl ? youtubeEmbed(guitar.videoUrl) : null;

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;
  }

  if (!guitar) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h2 className="text-xl font-display">ไม่พบข้อมูลกีตาร์รุ่นนี้</h2>
        <a href="/guitar" className="mt-6 inline-block bg-brand px-6 py-3 text-xs uppercase tracking-widest text-brand-foreground">กลับสู่หน้าแคตตาล็อก</a>
      </div>
    );
  }

  return (
    <>
      <PageHeading title={guitar.name || guitar.code} crumbs={[{ label: "Guitar", href: "/guitar" }, { label: guitar.name || guitar.code }]} index="03" compact />

      <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mb-4">
          <Link href="/guitar" className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand">
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปหน้าแคตตาล็อก
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden border border-border bg-card p-6">
              <img src={selectedImage || imagesList[0]} alt={guitar.name || guitar.code} className="max-h-[620px] w-full object-contain transition-all duration-300" onError={(e) => { (e.target as HTMLImageElement).src = "/fonzo-logo.png"; }} />
            </div>
            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imagesList.map((img: string, idx: number) => (
                  <button key={idx} type="button" onClick={() => setSelectedImage(img)} className={cn("h-20 w-20 border bg-background shrink-0 overflow-hidden p-1 transition-all", selectedImage === img ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-brand/50")}>
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 space-y-3 border-t border-border pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">ช่องทางสั่งซื้อ / ร้านค้าออนไลน์</p>
              <div className="flex flex-col gap-3">
                {guitar.shopee_url && <a href={guitar.shopee_url} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center bg-[#ee4d2d] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#d73211]"><ShoppingBag className="mr-2 h-4 w-4" />สั่งซื้อผ่าน Shopee<ExternalLink className="ml-2 h-3.5 w-3.5" /></a>}
                {guitar.lazada_url && <a href={guitar.lazada_url} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center bg-[#0f146d] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#0b0e52]"><ShoppingBag className="mr-2 h-4 w-4" />สั่งซื้อผ่าน Lazada<ExternalLink className="ml-2 h-3.5 w-3.5" /></a>}
                <Link href={guitar.line_url || "/contact"} className="inline-flex w-full items-center justify-center bg-brand px-6 py-3 text-xs font-bold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90"><MessageCircle className="mr-2 h-4 w-4" />ติดต่อสอบถาม / สั่งซื้อโดยตรง</Link>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {videoEmbed && <div className="border-t border-border pt-6"><p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-brand"><Play className="h-3.5 w-3.5" fill="currentColor" />{t("ฟังเสียงจริง", "Hear it played")}</p><h2 className="mt-3 text-xl font-display">{t("วิดีโอสาธิตเสียง", "Sound demonstration")}</h2><div className="mt-5 aspect-video w-full bg-ink"><iframe src={videoEmbed} title={guitar.name || guitar.code} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full border-0" /></div></div>}
            <div>
              <h1 className="text-2xl sm:text-3xl font-display">{guitar.name || guitar.code}</h1>
            </div>

            <div className="text-2xl font-bold font-display text-foreground">
              {Number(guitar.price || 0) > 0 ? `฿${Number(guitar.price).toLocaleString()}` : t("สอบถามราคา", "Contact for price")}
            </div>

            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-brand" /> รับประกันคุณภาพมาตรฐานโรงงาน Fonzo Guitar
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 text-brand" /> จัดส่งปลอดภัยด้วยกล่องกันกระแทกมาตรฐานสูง
              </div>
            </div>

            {guitar.description && (
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-display">{t("รายละเอียดกีตาร์", "Guitar details")}</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{guitar.description}</p>
              </div>
            )}

            {specsEntries.length > 0 && (
              <div className="border-t border-border pt-6 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-foreground">สเปคทางเทคนิค (Specifications)</h3>
                <div className="grid border border-border divide-y divide-border text-xs sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                  {specsEntries.map(([key, val], idx) => (
                    <div key={idx} className="flex justify-between gap-4 border-b border-border p-3 last:border-b-0 sm:odd:border-r">
                      <span className="text-muted-foreground uppercase font-medium">{key}</span>
                      <span className="text-right font-semibold text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </>
  );
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(" "); }
