import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";

export default function GuitarList() {
  const { t } = useLocale();

  // 1. ดึงแคตตาล็อก 114 ตัวเดิม
  const { data: catalogGuitars = [], isLoading: isLoadingCatalog } = trpc.fonzo.guitars.list.useQuery();
  const { data: types = [] } = trpc.fonzo.guitars.types.useQuery();

  // 2. ดึงสินค้าที่เพิ่มจากหน้า Admin
  const shopQuery = (trpc as any).shop?.products?.useQuery?.() ?? 
                    (trpc as any).shop?.list?.useQuery?.() ?? 
                    (trpc as any).products?.list?.useQuery?.() ?? 
                    { data: [], isLoading: false };

  const shopProducts = shopQuery.data || [];
  const isLoadingShop = shopQuery.isLoading;

  // 3. รวมสินค้าและกำหนดฟิลด์ให้รองรับระบบค้นหา/ตัวกรอง
  const allGuitars = useMemo(() => {
    const formattedShopProducts = shopProducts.map((item: any) => ({
      id: item.id || `shop-${item.name}`,
      code: item.code || item.name,
      name: item.name || "",
      series: item.category || item.series || "Fonzo Custom",
      type: item.type || "Acoustic",
      price: typeof item.price === "number" ? item.price : parseFloat(item.price || "0"),
      image: item.image || item.imageUrl || "/fonzo-logo.png",
      inStock: item.stock !== undefined ? item.stock > 0 : true,
      raw: item,
    }));

    // รวมสินค้าจากหน้า Admin เข้ากับแคตตาล็อกหลัก
    return [...formattedShopProducts, ...catalogGuitars];
  }, [catalogGuitars, shopProducts]);

  const isLoading = isLoadingCatalog || isLoadingShop;

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