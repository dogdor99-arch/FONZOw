import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Truck, ArrowLeft, Loader2 } from "lucide-react";

export default function GuitarDetail() {
  const { code } = useParams();
  const { t } = useLocale();

  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
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

  // ค้นหาและผสานข้อมูลรุ่นกีตาร์
  const guitar = useMemo(() => {
    const supaMatch = supabaseProducts.find((p) => {
      const pName = (p.name || "").toLowerCase().trim();
      return pName === decodedCode || p.id?.toString() === decodedCode;
    });

    const catalogMatch = catalogGuitars.find((g: any) => {
      const gName = (g.name || "").toLowerCase().trim();
      const gCode = (g.code || "").toLowerCase().trim();
      return gName === decodedCode || gCode === decodedCode || g.id?.toString() === decodedCode;
    });

    if (supaMatch) {
      const mergedSpecs = (supaMatch.specs && Object.keys(supaMatch.specs).length > 0)
        ? supaMatch.specs
        : (catalogMatch?.specs || {});

      return {
        ...catalogMatch,
        ...supaMatch,
        name: supaMatch.name || catalogMatch?.name,
        price: supaMatch.price !== undefined ? supaMatch.price : catalogMatch?.price,
        description: supaMatch.description || catalogMatch?.description,
        specs: mergedSpecs,
        images: supaMatch.image_urls && supaMatch.image_urls.length > 0 
          ? supaMatch.image_urls 
          : (catalogMatch?.images || [supaMatch.image_url || catalogMatch?.image || "/fonzo-logo.png"]),
        image: supaMatch.image_urls?.[0] || supaMatch.image_url || catalogMatch?.image || "/fonzo-logo.png",
      };
    }

    return catalogMatch || null;
  }, [catalogGuitars, supabaseProducts, decodedCode]);

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

  const isLoading = catalogLoading || loadingSupa;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!guitar) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h2 className="text-xl font-display">ไม่พบข้อมูลกีตาร์รุ่นนี้</h2>
        <p className="mt-2 text-xs text-muted-foreground">กรุณากลับไปเลือกดูรุ่นอื่นในแคตตาล็อก</p>
        <a href="/guitar" className="mt-6 inline-block bg-brand px-6 py-3 text-xs uppercase tracking-widest text-brand-foreground">
          กลับสู่หน้าแคตตาล็อก
        </a>
      </div>
    );
  }

  // แปลงสเปคให้อยู่ในรูปแบบที่รองรับทั้งแคตตาล็อกเดิมและ Supabase ได้อย่างสมบูรณ์
  const specsEntries = useMemo(() => {
    if (!guitar.specs) return [];
    
    // ถ้าเป็นสเปคจากแคตตาล็อกเดิม (มักเป็น object camelCase เช่น topWood, backSides)
    if (guitar.specs.topWood || guitar.specs.neck || guitar.specs.fingerboard || guitar.specs.scaleLength || guitar.specs.nutWidth || guitar.specs.bridge || guitar.specs.finish) {
      const s = guitar.specs;
      const formatted = [
        ["Top Wood (ไม้หน้า)", s.topWood],
        ["Back & Sides (ไม้ข้างและหลัง)", s.backSides],
        ["Neck (คอกีตาร์)", s.neck],
        ["Fingerboard (ฟิงเกอร์บอร์ด)", s.fingerboard],
        ["Scale Length (สเกล)", s.scaleLength],
        ["Nut Width (ความกว้างนัท)", s.nutWidth],
        ["Bridge (สะพานสาย)", s.bridge],
        ["Finish (เคลือบผิว)", s.finish],
      ];
      return formatted.filter(([_, val]) => val !== null && val !== undefined && val !== "");
    }

    // ถ้าเป็นสเปคจาก Supabase (ที่เป็นตัวพิมพ์ใหญ่หรือคีย์ทั่วไป)
    return Object.entries(guitar.specs).filter(([_, val]) => val !== null && val !== undefined && val !== "");
  }, [guitar.specs]);

  return (
    <>
      <PageHeading
        eyebrow={t("รายละเอียดกีตาร์", "Guitar details")}
        title={guitar.name || guitar.code}
        description={guitar.description || t("กีตาร์งานฝีมือระดับพรีเมียมจาก Fonzo", "Premium handcrafted guitar by Fonzo.")}
        crumbs={[{ label: "Guitar", href: "/guitar" }, { label: guitar.name || guitar.code }]}
        index="03"
      />

      <section className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8">
          <a href="/guitar" className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand">
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปหน้าแคตตาล็อก
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ส่วนแสดงรูปภาพหลักและแกลเลอรี */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-border bg-card p-4 flex items-center justify-center h-[450px] sm:h-[550px] overflow-hidden">
              <img 
                src={selectedImage || imagesList[0]} 
                alt={guitar.name || guitar.code} 
                className="max-h-full max-w-full object-contain transition-all duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = "/fonzo-logo.png"; }}
              />
            </div>

            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imagesList.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      "h-20 w-20 border bg-background shrink-0 overflow-hidden p-1 transition-all",
                      selectedImage === img ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-brand/50"
                    )}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ส่วนข้อมูลรายละเอียดและราคา */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-brand font-semibold">
                {guitar.series || guitar.category || "Fonzo Acoustic"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-display mt-1">{guitar.name || guitar.code}</h1>
            </div>

            <div className="text-2xl font-bold font-display text-foreground">
              {Number(guitar.price || 0) > 0 ? `฿${Number(guitar.price).toLocaleString()}` : t("สอบถามราคา", "Contact for price")}
            </div>

            {guitar.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guitar.description}
              </p>
            )}

            {/* สเปคสินค้า */}
            {specsEntries.length > 0 && (
              <div className="border-t border-border pt-6 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-foreground">สเปคทางเทคนิค (Specifications)</h3>
                <div className="border border-border divide-y divide-border text-xs">
                  {specsEntries.map(([key, val]: [string, any], idx) => (
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}