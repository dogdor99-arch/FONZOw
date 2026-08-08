import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { RichText } from "@/components/site/RichText";
import { Reveal } from "@/components/site/Reveal";
import { BRAND } from "@/lib/brand";

export default function Founder() {
  const { locale, t } = useLocale();
  const { data: articles = [], isLoading } = trpc.fonzo.content.founder.useQuery();

  const article = articles.find(a => a.locale === locale) ?? articles[0];

  return (
    <>
      <PageHeading
        eyebrow={t("ผู้ก่อตั้งแบรนด์", "The founder")}
        title="Founder"
        description={t(
          "เรื่องราวของเบิร์ด เอกชัย เจียรกุล นักกีตาร์คลาสสิกคนไทยคนแรกที่คว้าแชมป์การแข่งขันระดับโลก และผู้ให้กำเนิดแบรนด์ Fonzo",
          "The story of Bird Ekachai Jearakul — the first Thai classical guitarist to win the world's most prestigious competition, and the creator of Fonzo.",
        )}
        crumbs={[{ label: "Founder" }]}
        index="01"
      />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <div className="sticky top-28">
              {article?.image && (
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={locale === "th" ? BRAND.founder.th : BRAND.founder.en}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,color-mix(in_oklch,var(--ink)_30%,transparent)_100%)]"
                  />
                </div>
              )}

              <p className="mt-7 font-display text-2xl leading-snug">
                {locale === "th" ? BRAND.founder.th : BRAND.founder.en}
              </p>
              <div className="mt-4 gold-rule" />

              <dl className="mt-7 divide-y divide-border/70 border-y border-border/70">
                {[
                  {
                    term: t("รางวัลสำคัญ", "Signature award"),
                    detail: "GFA International Concert Artist Competition",
                    note: t("ชนะเลิศ ปี 2014", "First prize, 2014"),
                  },
                  {
                    term: t("บทบาท", "Role"),
                    detail: t("ผู้ก่อตั้งและผู้ควบคุมคุณภาพเสียง", "Founder & tonal director"),
                    note: t("คัดเลือกไม้และปรับตั้งทุกตัวก่อนส่งมอบ", "Selects tonewoods and voices every instrument"),
                  },
                ].map(row => (
                  <div key={row.term} className="py-5">
                    <dt className="eyebrow">{row.term}</dt>
                    <dd className="mt-2 font-display text-lg leading-snug">{row.detail}</dd>
                    <dd className="mt-1 text-sm text-muted-foreground">{row.note}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7">
                <p className="font-display text-[3.25rem] leading-none text-brand/15">01</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse bg-secondary"
                    style={{ width: `${88 - (i % 4) * 9}%` }}
                  />
                ))}
              </div>
            ) : article ? (
              <RichText html={article.html} className="max-w-[46rem]" />
            ) : (
              <p className="text-muted-foreground">
                {t("ไม่พบเนื้อหาในขณะนี้", "Content is unavailable right now.")}
              </p>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
