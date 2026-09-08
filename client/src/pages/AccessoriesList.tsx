import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";

export default function AccessoriesList() {
  const { t } = useLocale();
  const { data: accessories = [], isLoading } = trpc.fonzo.accessories.list.useQuery();
  const { data: types = [] } = trpc.fonzo.accessories.types.useQuery();

  return (
    <>
      <CompactPageHeading
        title="Accessories"
        crumbs={[{ label: "Accessories" }]}
        storeNav
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
