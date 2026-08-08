import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";

export default function GuitarList() {
  const { t } = useLocale();
  const { data: guitars = [], isLoading } = trpc.fonzo.guitars.list.useQuery();
  const { data: types = [] } = trpc.fonzo.guitars.types.useQuery();

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
              {isLoading ? "—" : guitars.length}
            </p>
          </div>
        }
      />
      <CatalogBrowser
        products={guitars}
        categories={types}
        isLoading={isLoading}
        basePath="/guitar"
        categoryLabel={t("ประเภทกีตาร์", "Guitar type")}
      />
    </>
  );
}
