import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { supabase } from "@/lib/supabase";
import type { FonzoProductSummary } from "@shared/fonzo/types";

function isSpecificMarketplaceUrl(value: unknown, marketplace: "shopee" | "lazada") {
  const url = String(value ?? "").trim().toLowerCase();
  if (!url || !/^https?:\/\//.test(url)) return false;
  if (marketplace === "shopee") return /^https?:\/\/shopee\.co\.th\/[^/?#]+(?:-[^/?#]+)?-i\.\d+\.\d+(?:[/?#].*)?$/.test(url);
  return /^https?:\/\/(?:www\.)?lazada\.co\.th\/products\/(?:[^/?#]+-i\d+(?:-s\d+)?|pdp-i\d+)\.html(?:[?#].*)?$/.test(url);
}

export default function CourseList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.from("products").select("*").eq("category", "Bird Course").order("id", { ascending: true }).then(({ data }) => {
      if (active) { setRows(data ?? []); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  const courses = useMemo<FonzoProductSummary[]>(() => rows.filter(row => !row.specs?.hidden).map((row, index) => ({
    code: String(row.specs?.sourceCode || `BIRD-COURSE-${row.id}`), order: index + 1,
    name: row.name, nameEn: row.name, price: row.price == null ? null : Number(row.price),
    priceLabel: row.price == null ? "Enquiry" : Number(row.price).toLocaleString("en-US"),
    typeCode: "BIRD-COURSE", typeName: "Bird Course", seriesCode: "BIRD", seriesName: "คอร์สเรียนของคุณเบิร์ด",
    popular: false, videoUrl: row.video_url || row.specs?.videoUrl || null,
    image: row.image_url || "/fonzo-logo.png", shopeeUrl: row.shopee_url || null, lazadaUrl: row.lazada_url || null,
    description: row.description || null, raw: row,
  })).sort((a, b) => Number(isSpecificMarketplaceUrl(b.shopeeUrl, "shopee") && isSpecificMarketplaceUrl(b.lazadaUrl, "lazada")) - Number(isSpecificMarketplaceUrl(a.shopeeUrl, "shopee") && isSpecificMarketplaceUrl(a.lazadaUrl, "lazada"))), [rows]);

  return <>
    <CompactPageHeading title="Bird Guitar Courses" crumbs={[{ label: "Courses" }]} />
    <section className="mx-auto max-w-[1400px] px-4 pt-7 sm:px-6 lg:px-10"><div className="border border-brand/20 bg-brand/5 p-5 sm:p-7"><p className="eyebrow text-brand">Fonzo Academy</p><h2 className="mt-2 font-display text-2xl sm:text-3xl">เรียนกีตาร์กับคุณเบิร์ด</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">รวมคอร์สเรียนออนไลน์สำหรับกีตาร์คลาสสิกและกีตาร์โปร่ง เลือกดูรายละเอียดและสั่งซื้อผ่านร้านต้นทางได้โดยตรง</p><Link href="/contact" className="mt-5 inline-flex border border-brand px-5 py-2.5 text-xs tracking-widest text-brand uppercase">สอบถามรายละเอียดคอร์ส</Link></div></section>
    <CatalogBrowser products={courses} categories={[{ code: "BIRD-COURSE", name: "คอร์สเรียนของคุณเบิร์ด", count: courses.length }]} isLoading={loading} basePath="/courses" categoryLabel="ประเภทคอร์ส" />
  </>;
}
