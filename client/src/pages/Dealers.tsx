import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { RichText } from "@/components/site/RichText";
import { Reveal } from "@/components/site/Reveal";

export default function Dealers() {
  const { locale, t } = useLocale();
  const { data: sections = [], isLoading } = trpc.fonzo.content.dealers.useQuery();

  const localized = sections.filter(section => section.locale === locale);
  const visible = localized.length > 0 ? localized : sections.slice(0, 1);

  return (
    <>
      <PageHeading
        eyebrow={t("เครือข่ายตัวแทนจำหน่าย", "Dealer network")}
        title="Dealers"
        description={t(
          "รายชื่อตัวแทนจำหน่ายและร้านค้าที่จำหน่ายกีตาร์ Fonzo อย่างเป็นทางการ ทั้งในประเทศไทยและต่างประเทศ",
          "Official Fonzo dealers and partner stores, in Thailand and abroad.",
        )}
        crumbs={[{ label: "Dealers" }]}
        index="08"
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
        {isLoading ? (
          <div className="space-y-4 border border-border bg-card p-7 sm:p-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse bg-secondary"
                style={{ width: `${90 - (i % 5) * 8}%` }}
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-muted-foreground">
            {t("ไม่พบข้อมูลตัวแทนจำหน่ายในขณะนี้", "Dealer information is unavailable right now.")}
          </p>
        ) : (
          visible.map((section, index) => (
            <Reveal key={section.code} delay={index * 60}>
              <article className="lift mb-12 border border-border bg-card p-7 sm:p-11">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow">{t("เครือข่ายทางการ", "Authorised network")}</p>
                    <h2 className="mt-2 font-display text-2xl leading-snug">{section.title}</h2>
                  </div>
                  <span className="hidden font-display text-[2.75rem] leading-none text-brand/15 sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-5 gold-rule" />
                <RichText html={section.html} className="mt-7" />
              </article>
            </Reveal>
          ))
        )}
      </section>
    </>
  );
}
