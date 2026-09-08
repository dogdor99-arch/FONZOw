import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { supabase } from "@/lib/supabase";
import { withProductMeta } from "@shared/fonzo/customizer";

const ACCESSORY_TERMS = /accessor|อุปกรณ์|อะไหล่|string|สายกีตาร์|strings|bag|case|pick|pickup|capo|tuner|เครื่องตั้งสาย/i;

function isAccessoryProduct(product: any) {
  const sourceCode = String(product?.raw?.specs?.sourceCode ?? product?.specs?.sourceCode ?? product?.code ?? "").toUpperCase();
  if (sourceCode.startsWith("A")) return true;
  if (sourceCode.startsWith("G")) return false;
  const haystack = [product.category, product.seriesName, product.typeName, product.type, product.name, product.nameEn]
    .filter(Boolean)
    .join(" ");
  return ACCESSORY_TERMS.test(haystack);
}

function isCustomGuitar(product: any) {
  const sourceCode = String(product?.raw?.specs?.sourceCode ?? product?.specs?.sourceCode ?? product?.code ?? "").toUpperCase();
  const price = product?.price;
  return sourceCode.startsWith("G") && (price === null || price === undefined || price === "" || Number(price) <= 0 || String(product?.priceLabel ?? "").toLowerCase() === "enquiry");
}

function shopOrder(product: any) {
  const haystack = [product.category, product.seriesName, product.typeName, product.type, product.name, product.nameEn]
    .filter(Boolean)
    .join(" ").toLowerCase();
  if (product.typeCode === "GT0001" || /classic/.test(haystack)) return 0;
  if (product.typeCode === "GT0004" || /acoustic/.test(haystack)) return 1;
  return 2;
}

function normalizeShopTypeCode(product: any, types: any[]) {
  const explicitCode = String(product.typeCode ?? product.type_code ?? "");
  if (explicitCode === "GT0001" || explicitCode === "GT0004") return explicitCode;

  const haystack = [product.category, product.typeName, product.type_name, product.type, product.seriesName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (haystack.includes("classic")) return "GT0001";
  if (haystack.includes("acoustic")) return "GT0004";

  const matchedType = types.find((type: any) => String(type.code) === explicitCode);
  const typeName = String(matchedType?.name ?? "").toLowerCase();
  if (typeName.includes("classic")) return "GT0001";
  if (typeName.includes("acoustic")) return "GT0004";
  return explicitCode;
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

    const catalogByName = new Map<string, any>();
    catalogGuitars.forEach((g: any) => {
      if (g.name) catalogByName.set(String(g.name).toLowerCase().trim(), g);
    });

    // แปลงข้อมูลจาก Supabase พร้อมรักษาข้อมูลประเภท/รหัสเดิมจาก catalog
    // เมื่อรายการใน Admin บันทึกไว้เฉพาะราคา ลิงก์ หรือรูปภาพ
    const formattedSupabaseProducts = supabaseProducts.map((item) => {
      const catalog = catalogByName.get(String(item.name || "").toLowerCase().trim());
      const validImages = item.image_urls && item.image_urls.length > 0
        ? item.image_urls
        : (item.image_url ? [item.image_url] : [catalog?.image || "/fonzo-logo.png"]);
      const mergedCategory = item.category || catalog?.seriesName || "Fonzo Acoustic";
      const mergedTypeName = item.type_name || catalog?.typeName || mergedCategory;

      return withProductMeta({
        ...catalog,
        id: item.id || catalog?.id || `supa-${item.name}`,
        code: item.code || catalog?.code || item.name,
        name: item.name || catalog?.name,
        nameEn: item.name_en || catalog?.nameEn || item.name,
        seriesName: mergedCategory,
        series: item.series || catalog?.series || mergedCategory,
        type: item.type || catalog?.type || mergedTypeName,
        typeCode: item.type_code || catalog?.typeCode || "",
        typeName: mergedTypeName,
        price: item.price == null || item.price === "" ? (catalog?.price ?? null) : Number(item.price),
        image: validImages[0],
        images: validImages,
        inStock: item.stock == null ? catalog?.inStock : Number(item.stock || 0) > 0,
        shopeeUrl: item.shopee_url || item.shopeeUrl || item.shopee || catalog?.shopeeUrl || null,
        lazadaUrl: item.lazada_url || item.lazadaUrl || item.lazada || catalog?.lazadaUrl || null,
        raw: item,
        specs: item.specs || catalog?.specs || {},
      });
    });

    // กรอง catalog เดิมเฉพาะรายการที่ถูกแทนด้วย override ใน Supabase
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
      .filter((product: any) => !isCustomGuitar(product) && product.purchaseMode !== "custom" && !isAccessoryProduct(product))
      .map((product: any, index: number) => ({
        product: { ...product, typeCode: normalizeShopTypeCode(product, types) },
        index,
      }))
      .sort((a, b) => Number(Boolean(b.product.videoUrl)) - Number(Boolean(a.product.videoUrl)) || shopOrder(a.product) - shopOrder(b.product) || a.index - b.index)
      .map(({ product }) => product),
    [allGuitars, types],
  );
  const shopTypes = useMemo(() => {
    const shopTypeCodes = new Set(["GT0001", "GT0004"]);
    return types
      .filter((type: any) => shopTypeCodes.has(String(type.code)))
      .map((type: any) => ({
        ...type,
        count: shopGuitars.filter((product: any) => product.typeCode === type.code).length,
      }))
      .filter((type: any) => type.count > 0);
  }, [shopGuitars, types]);

  return (
    <>
      <CompactPageHeading
        title={t("Guitar Shop", "Guitar Shop")}
        crumbs={[{ label: "Guitar" }]}
        storeNav
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
