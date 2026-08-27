import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, Truck, ArrowLeft, Loader2 } from "lucide-react";

export default function GuitarDetail() {
  const { code } = useParams();
  const { t } = useLocale();

  // 1. ดึงข้อมูลจากแคตตาล็อกหลัก
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  
  // 2. ดึงข้อมูลที่แก้ไขจาก Supabase
  const [supabaseProduct, setSupabaseProduct] = useState<any>(null);
  const [loadingSupa, setLoadingSupa] = useState(true);

  // ถอดรหัส URL code เพื่อค้นหาชื่อรุ่นให้ตรงกัน
  const decodedCode = decodeURIComponent(code || "").trim();

  useEffect(() => {
    async function fetchSupabaseProduct() {
      if (!decodedCode) return;
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .ilike("name", decodedCode)
          .maybeSingle();
        
        if (!error && data) {
          setSupabaseProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product override:", err);
      } finally {
        setLoadingSupa(false);
      }
    }
    fetchSupabaseProduct();
  }, [decodedCode]);

  // ค้นหารุ่นจากแคตตาล็อกหลัก
  const catalogItem = catalogGuitars.find((g: any) => {
    const gName = (g.name || g.code || "").toLowerCase().trim();
    return gName === decodedCode.toLowerCase();
  });

  // ผสานข้อมูล: หากมีข้อมูลใน Supabase ให้ใช้ข้อมูลจาก Supabase ทับทันที (รวมถึงรูปภาพหลายมุม)
  const guitar = supabaseProduct ? {
    ...catalogItem,
    ...supabaseProduct,
    name: supabaseProduct.name || catalogItem?.name,
    price: supabaseProduct.price !== undefined ? supabaseProduct.price : catalogItem?.price,
    description: supabaseProduct.description || catalogItem?.description,
    specs: supabaseProduct.specs || catalogItem?.specs,
    // ดึงรูปภาพหลายมุมจาก Supabase (ถ้ามี) ถ้าไม่มีให้ใช้รูปเดิม
    images: supabaseProduct.image_urls && supabaseProduct.image_urls.length > 0 
      ? supabaseProduct.image_urls 
      : (catalogItem?.images || [supabaseProduct.image_url || catalogItem?.image || "/fonzo-logo.png"]),
    image: supabaseProduct.image_urls?.[0] || supabaseProduct.image_url || catalogItem?.image || "/fonzo-logo.png",
  } : catalogItem;

  const [selectedImage, setSelectedImage] = useState<string>("");

  // ตั้งค่ารูปแรกเป็นรูปเริ่มต้นเมื่อโหลดข้อมูลเสร็จ
  useEffect(() => {
    if (guitar) {
      const firstImg = guitar.images?.[0] || guitar.image || "/fonzo-logo.png";
      setSelectedImage(firstImg);
    }
  }, [guitar]);

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

  const imagesList = guitar.images && guitar.images.length > 0 ? guitar.images : [guitar.image || "/fonzo-logo.png"];
  const specsEntries = guitar.specs ? Object.entries(guitar.specs) : [];

  return (
    <>
      <PageHeading
        eyebrow={t("รายละเอียดกีตาร์", "Guitar details")}
        title={guitar.name}
        description={guitar.description || t("กีตาร์งานฝีมือระดับพรีเมียมจาก Fonzo", "Premium handcrafted guitar by Fonzo.")}
        crumbs={[{ label: "Guitar", href: "/guitar" }, { label: guitar.name }]}
        index="03"
      />

      <section className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8">
          <a href="/guitar" className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand">
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปหน้าแคตตาล็อก
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ส่วนแสดงรูปภาพหลายมุม */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-border bg-card p-4 flex items-center justify-center h-[450px] sm:h-[550px] overflow-hidden">
              <img 
                src={selectedImage || imagesList[0]} 
                alt={guitar.name} 
                className="max-h-full max-w-full object-contain transition-all duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = "/fonzo-logo.png"; }}
              />
            </div>

            {/* แกลเลอรีรูปภาพย่อยด้านล่าง */}
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
              <h1 className="text-2xl sm:text-3xl font-display mt-1">{guitar.name}</h1>
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
                      <span className="text-foreground font-semibold text-right">{val || "—"}</span>
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

// Helper utility ป้องกัน cn error หากในไฟล์ยังไม่มี
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}