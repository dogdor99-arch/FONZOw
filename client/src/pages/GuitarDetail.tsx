import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Truck, ArrowLeft, Loader2, ExternalLink, ShoppingBag, MessageCircle } from "lucide-react";

export default function GuitarDetail() {
  const { code } = useParams();
  const { t } = useLocale();

  const { data: catalogGuitars, isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  const catalogRows = (catalogGuitars as any[] | undefined) ?? [];
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

    const supaMatch = supabaseProducts.find((p) => {
      const pName = cleanStr(p.name);
      const pCode = cleanStr(p.code);
      const pId = cleanStr(p.id?.toString());
      return pName === decodedClean || pCode === decodedClean || pId === decodedClean || decodedClean.includes(pName) || pName.includes(decodedClean);
    });

    const base = catalogMatch || {};
    const supa = supaMatch || {};

    if (supaMatch || catalogMatch) {
      const mergedSpecs = (supa.specs && Object.keys(supa.specs).length > 0)
        ? supa.specs
        : (base.specs || {});

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
          : (base.images || [supa.image_url || base.image || "/fonzo-logo.png"]),
        image: supa.image_urls?.[0] || supa.image_url || base.image || "/fonzo-logo.png",
        shopee_url: shopeeLink,
        lazada_url: lazadaLink,
        line_url: lineLink,
      };
    }

    return null;
  }, [catalogRows, supabaseProducts, decodedCode]);

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
    const s = guitar.specs || {};
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
      return Object.entries(s).filter(([_, val]) => val !== null && val !== undefined && val !== "") as [string, any][];
    }
    return rawList;
  }, [guitar]);

  const isLoading = catalogLoading || loadingSupa;

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
      <PageHeading eyebrow={t("รายละเอียดกีตาร์", "Guitar details")} title={guitar.name || guitar.code} description={guitar.description || t("กีตาร์งานฝีมือระดับพรีเมียมจาก Fonzo", "Premium handcrafted guitar by Fonzo.")} crumbs={[{ label: "Guitar", href: "/guitar" }, { label: guitar.name || guitar.code }]} index="03" />

      <section className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8">
          <Link href="/guitar" className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand">
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปหน้าแคตตาล็อก
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-border bg-card p-4 flex items-center justify-center h-[450px] sm:h-[550px] overflow-hidden">
              <img src={selectedImage || imagesList[0]} alt={guitar.name || guitar.code} className="max-h-full max-w-full object-contain transition-all duration-300" onError={(e) => { (e.target as HTMLImageElement).src = "/fonzo-logo.png"; }} />
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
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-brand font-semibold">{guitar.series || guitar.category || "Fonzo Acoustic"}</span>
              <h1 className="text-2xl sm:text-3xl font-display mt-1">{guitar.name || guitar.code}</h1>
            </div>

            <div className="text-2xl font-bold font-display text-foreground">
              {Number(guitar.price || 0) > 0 ? `฿${Number(guitar.price).toLocaleString()}` : t("สอบถามราคา", "Contact for price")}
            </div>

            {/* แสดงปุ่มสั่งซื้อ Shopee และ Lazada */}
            <div className="space-y-3 pt-2 pb-2">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">ช่องทางสั่งซื้อ / ร้านค้าออนไลน์</p>
              
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
                  <MessageCircle className="mr-2 h-4 w-4" /> ติดต่อสอบถาม / สั่งซื้อโดยตรง
                </Link>
              </div>
            </div>

            {guitar.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">{guitar.description}</p>
            )}

            {specsEntries.length > 0 && (
              <div className="border-t border-border pt-6 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-foreground">สเปคทางเทคนิค (Specifications)</h3>
                <div className="border border-border divide-y divide-border text-xs">
                  {specsEntries.map(([key, val], idx) => (
                    <div key={idx} className="flex justify-between p-3">
                      <span className="text-muted-foreground uppercase font-medium">{key}</span>
                      <span className="text-foreground font-semibold text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-brand" /> รับประกันคุณภาพมาตรฐานโรงงาน Fonzo Guitar
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 text-brand" /> จัดส่งปลอดภัยด้วยกล่องกันกระแทกมาตรฐานสูง
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(" "); }