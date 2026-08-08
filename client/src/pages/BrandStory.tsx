import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { EditorialArticle } from "@/components/site/EditorialArticle";

export default function BrandStory() {
  const { locale, t } = useLocale();
  const { data: articles = [], isLoading } = trpc.fonzo.content.brandStory.useQuery();

  const article = articles.find(a => a.locale === locale) ?? articles[0];

  return (
    <>
      <PageHeading
        eyebrow={t("เรื่องราวแบรนด์", "Brand story")}
        title="Brand Story"
        description={t(
          "จากประสบการณ์บนเวทีนานาชาติ สู่แบรนด์กีตาร์ที่ให้ความสำคัญกับโครงสร้าง วัสดุ และคุณภาพเสียงเป็นอันดับแรก",
          "From the international concert stage to a guitar brand that puts structure, materials and tone first.",
        )}
        crumbs={[{ label: "Brand Story" }]}
        index="02"
      />

      <EditorialArticle
        index="02"
        kicker={t("เรื่องราวของแบรนด์", "The brand")}
        pullQuote={t(
          "เครื่องดนตรีที่ดีเริ่มจากการฟัง ไม่ใช่จากการตกแต่ง",
          "A fine instrument begins with listening, not with ornament.",
        )}
        image={article?.image}
        imageAlt={t("เรื่องราวแบรนด์ Fonzo", "Fonzo brand story")}
        html={article?.html}
        isLoading={isLoading}
      />
    </>
  );
}
