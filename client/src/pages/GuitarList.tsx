import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { supabase } from "@/lib/supabase";
import { withProductMeta } from "@shared/fonzo/customizer";

const ACCESSORY_TERMS = /accessor|อุปกรณ์|อะไหล่|string|สายกีตาร์|strings|bag|case|pick|pickup|capo|tuner|เครื่องตั้งสาย/i;

function isAccessoryProduct(product: any) {
  const haystack = [product.category, product.seriesName, product.typeName, product.type, product.name, product.nameEn]
    .filter(Boolean)
    .join(" ");
  return ACCESSORY_TERMS.test(haystack);
}

function shopOrder(product: any) {
  const haystack = [product.category, product.seriesName, product.typeName, product.type, product.name, product.nameEn]
    .filter(Boolean)
    .join(" ").toLowerCase();
  if (/classic/.test(haystack)) return 0;
  if (/acoustic/.test(haystack)) return 1;
  return 2;
}

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

  // 3. ผสานข้อมูล: แทนที่จะเอามาต่อกันโต้งๆ เราจะกรองตัวเก่าในแคตตาล็อกออก ถ้ารุ่นนั้นถูกแก้ไขอยู่ใน Supabase แล้ว
  const allGuitars = useMemo(() => {
    const supaNameMap = new Map();
    supabaseProducts.forEach((item) => {
      if (item.name) {
        supaNameMap.set(item.name.toLowerCase().trim(), item);
      }
    });

    // แปลงข้อมูลสินค้าจาก Supabase เป็นรูปแบบที่ CatalogBrowser รองรับ
    const formattedSupabaseProducts = supabaseProducts.map((item) => {
      const validImages = item.image_urls && item.image_urls.length > 0 
        ? item.image_urls 
        : (item.image_url ? [item.image_url] : ["/fonzo-logo.png"]);

      return withProductMeta({
        id: item.id || `supa-${item.name}`,
        code: item.code || item.name,
        name: item.name,
        nameEn: item.name_en || item.name,
        seriesName: item.category || "Fonzo Acoustic",
        series: item.category || "Fonzo Acoustic",
        type: item.type || "Acoustic",
        typeCode: item.type_code || "",
        typeName: item.type_name || item.category || "Acoustic",
        price: item.price == null || item.price === "" ? null : Number(item.price),
        image: validImages[0], // รูปหลักหน้าปก
        images: validImages,   // รูปภาพหลายมุมทั้งหมด
        inStock: Number(item.stock || 0) > 0,
        shopeeUrl: item.shopee_url || item.shopeeUrl || item.shopee || null,
        lazadaUrl: item.lazada_url || item.lazadaUrl || item.lazada || null,
        raw: item,
        specs: item.specs || {},
      });
    });

    // กรองแคตตาล็อกเดิม: ถ้ารุ่นไหนมีชื่อตรงกับใน Supabase แล้ว ให้ซ่อนตัวเก่าทิ้งทันที (ป้องกันตัวซ้ำ)
    const filteredCatalog = catalogGuitars.filter((g: any) => {
      const gName = (g.name || g.code || "").toLowerCase().trim();
      return !supaNameMap.has(gName);
    });

    // รวมรายชื่อโดยให้สินค้าจาก Supabase (ที่แก้ไขแล้ว) ขึ้นแสดงแทนที่ตัวเก่าอย่างสะอาดตา
    return [...formattedSupabaseProducts, ...filteredCatalog];
  }, [catalogGuitars, supabaseProducts]);

  const isLoading = isLoadingCatalog || isLoadingSupabase;
  const shopGuitars = useMemo(
    () => allGuitars
      .filter((product: any) => product.purchaseMode !== "custom" && !isAccessoryProduct(product))
      .map((product: any, index: number) => ({ product, index }))
      .sort((a, b) => shopOrder(a.product) - shopOrder(b.product) || a.index - b.index)
      .map(({ product }) => product),
    [allGuitars],
  );
  const shopTypes = useMemo(() => {
    const typeCodes = new Set(shopGuitars.map((product: any) => product.typeCode).filter(Boolean));
    return types.filter((type: any) => typeCodes.size === 0 || typeCodes.has(type.code));
  }, [shopGuitars, types]);

  return (
    <>
      <PageHeading
        eyebrow={t("แคตตาล็อกกีตาร์", "Guitar catalogue")}
          title={t("Guitar Shop", "Guitar Shop")}
          description={t(
            "กีตาร์ Fonzo Classic และ Fonzo Acoustic สำหรับสั่งซื้อผ่าน Shopee, Lazada หรือติดต่อร้านโดยตรง",
            "Fonzo Classic and Fonzo Acoustic models available through Shopee, Lazada, or direct enquiry.",
          )}
        crumbs={[{ label: "Guitar" }]}
        index="03"
        aside={
          <div className="hidden text-right sm:block">
            <p className="eyebrow">{t("รุ่นในแคตตาล็อก", "Models in catalogue")}</p>
            <p className="mt-2 font-display text-3xl tabular-nums">
              {isLoading ? "—" : shopGuitars.length}
            </p>
          </div>
        }
      />
      <CatalogBrowser
        products={shopGuitars}
        categories={shopTypes}
        isLoading={isLoading}
        basePath="/guitar"
        categoryLabel={t("ประเภทกีตาร์ใน Guitar Shop", "Guitar Shop categories")}
      />
    </>
  );
}