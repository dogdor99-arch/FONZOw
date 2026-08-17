import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { supabase } from "@/lib/supabase";

export default function GuitarList() {
  const { t } = useLocale();

  // 1. ดึงข้อมูลแคตตาล็อก 114 ตัวเดิมจาก tRPC
  const { data: catalogGuitars = [], isLoading: isLoadingCatalog } = trpc.fonzo.guitars.list.useQuery();
  const { data: types = [] } = trpc.fonzo.guitars.types.useQuery();

  // 2. ดึงข้อมูลสินค้าที่บันทึกเพิ่มจากหน้า Admin ผ่าน Supabase
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(true);

  useEffect(() => {
    async function fetchSupabaseProducts() {
      try {
        const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
        if (!error && data) {
          setSupabaseProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch Supabase products:", err);
      } finally {
        setIsLoadingSupabase(false);
      }
    }
    fetchSupabaseProducts();
  }, []);

  // 3. จัด Format สินค้า ป้องกันรูปภาพแตก และแมปหมวดหมู่ให้ตรงกับ CatalogBrowser
  const allGuitars = useMemo(() => {
    const formattedSupabaseProducts = supabaseProducts.map((item) => {
      // ตรวจสอบรูปภาพ หากไม่มีรูปหรือเป็นค่าว่าง ให้ใช้รูปโลโก้แทนกันรูปแตก
      const validImage = item.image_url && item.image_url.trim() !== "" 
        ? item.image_url 
        : "/fonzo-logo.png";

      return {
        id: item.id || `supa-${item.name}`,
        code: item.name,
        name: item.name,
        series: item.category || "Fonzo Custom",
        type: "Acoustic",
        price: Number(item.price || 0),
        image: validImage,
        inStock: Number(item.stock || 0) > 0,
        raw: item,
      };
    });

    return [...formattedSupabaseProducts, ...catalogGuitars];
  }, [catalogGuitars, supabaseProducts]);

  const isLoading = isLoadingCatalog || isLoadingSupabase;

  return (
    <>
      <PageHeading
        eyebrow={t("แคตตาล็อกกีตาร์", "Guitar catalogue")}
        title="Guitar"
        description={t(
          "กีตาร์คลาสสิกและอะคูสติกทุกซีรีส์ของ Fonzo ตั้งแต่รุ่น Top Solid สำหรับผู้เริ่มต้นจริงจัง จนถึงงาน All Solid Handmade และงานสั่งทำพิเศษ",
          "Every Fonzo classical and acoustic series — from serious-beginner Top Solid models through All Solid Handmade and bespoke commissions.",
        )}
        crumbs={[{ label: "Guitar" }]}
        index="03"
        aside={
          <div className="hidden text-right sm:block">
            <p className="eyebrow">{t("รุ่นในแคตตาล็อก", "Models in catalogue")}</p>
            <p className="mt-2 font-display text-3xl tabular-nums">
              {isLoading ? "—" : allGuitars.length}
            </p>
          </div>
        }
      />
      <CatalogBrowser
        products={allGuitars}
        categories={types}
        isLoading={isLoading}
        basePath="/guitar"
        categoryLabel={t("ประเภทกีตาร์", "Guitar type")}
      />
    </>
  );
}