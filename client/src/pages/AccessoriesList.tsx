import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";

export default function AccessoriesList() {
  const { t } = useLocale();
  const { data: accessories = [], isLoading } = trpc.fonzo.accessories.list.useQuery();
  const { data: types = [] } = trpc.fonzo.accessories.types.useQuery();

  return (
    <>
      <PageHeading
        eyebrow={t("อุปกรณ์และอะไหล่", "Accessories & parts")}
        title="Accessories"
        description={t(
          "สายกีตาร์ กระเป๋า ปิ๊กการ์ด ปิ๊กอัพ คาโป้ และอะไหล่คุณภาพที่คัดเลือกมาให้เข้ากับเครื่องดนตรีของคุณ",
          "Strings, cases, pickguards, pickups, capos and quality parts selected to match your instrument.",
        )}
        crumbs={[{ label: "Accessories" }]}
        index="04"
        aside={
          <div className="hidden text-right sm:block">
            <p className="eyebrow">{t("รายการทั้งหมด", "Items available")}</p>
            <p className="mt-2 font-display text-3xl tabular-nums">
              {isLoading ? "—" : accessories.length}
            </p>
          </div>
        }
      />
      <CatalogBrowser
        products={accessories}
        categories={types}
        isLoading={isLoading}
        basePath="/accessories"
        categoryLabel={t("หมวดอุปกรณ์", "Category")}
      />
    </>
  );
}
