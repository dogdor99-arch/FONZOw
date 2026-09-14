import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { ProductDetailView } from "@/components/site/ProductDetailView";
import { supabase } from "@/lib/supabase";
import type { FonzoProductDetail } from "@shared/fonzo/types";

export default function CourseDetail() {
  const { code = "" } = useParams<{ code: string }>();
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.from("products").select("*").eq("category", "Bird Course").then(({ data }) => {
      const found = (data ?? []).find(item => String(item.specs?.sourceCode || `BIRD-COURSE-${item.id}`) === code);
      if (active) { setRow(found ?? null); setLoading(false); }
    });
    return () => { active = false; };
  }, [code]);

  if (loading) return <div className="mx-auto max-w-[1400px] px-4 py-24 text-center text-sm text-muted-foreground">กำลังโหลดข้อมูลคอร์ส…</div>;
  if (!row || row.specs?.hidden) return <><CompactPageHeading title="Course not found" crumbs={[{ label: "Courses", href: "/courses" }]} /><div className="mx-auto max-w-3xl px-4 py-24 text-center"><p className="text-muted-foreground">ไม่พบคอร์สนี้ หรือคอร์สถูกซ่อนชั่วคราว</p><Link href="/courses" className="mt-6 inline-flex border border-brand px-5 py-3 text-xs tracking-widest text-brand uppercase">กลับไปหน้าคอร์ส</Link></div></>;

  const specs = Object.entries(row.specs ?? {}).filter(([key]) => !/^(sourceCode|content type)$/i.test(key)).map(([title, value]) => ({ title, value: String(value ?? "") }));
  const product: FonzoProductDetail = {
    code: String(row.specs?.sourceCode || `BIRD-COURSE-${row.id}`), order: 1, name: row.name, nameEn: row.name,
    price: row.price == null ? null : Number(row.price), priceLabel: row.price == null ? "Enquiry" : Number(row.price).toLocaleString("en-US"),
    typeCode: "BIRD-COURSE", typeName: "Bird Course", seriesCode: "BIRD", seriesName: "คอร์สเรียนของคุณเบิร์ด", popular: false,
    videoUrl: row.video_url || row.specs?.videoUrl || null, image: row.image_url || "/fonzo-logo.png", images: (row.image_urls ?? [row.image_url || "/fonzo-logo.png"]).map((url: string, index: number) => ({ url, isDefault: index === 0 })),
    specs, specsEn: specs, description: row.description || null, descriptionEn: row.description || null, shopeeUrl: row.shopee_url || null, lazadaUrl: row.lazada_url || null,
  };
  return <><CompactPageHeading title="Bird Guitar Course" crumbs={[{ label: "Courses", href: "/courses" }, { label: row.name }]} /><ProductDetailView product={product} related={[]} basePath="/courses" /></>;
}
