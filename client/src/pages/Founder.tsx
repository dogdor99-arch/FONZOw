import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { RichText } from "@/components/site/RichText";
import { Reveal } from "@/components/site/Reveal";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Founder() {
  const { locale, t } = useLocale();
  const { data: articles = [], isLoading } = trpc.fonzo.content.founder.useQuery();

  const article = articles.find(a => a.locale === locale) ?? articles[0];
  const [override, setOverride] = useState<any>(null);
  useEffect(() => { supabase.from("products").select("id,name,image_url,image_urls,specs").eq("name", "__founder_page__").order("id", { ascending: false }).limit(1).maybeSingle().then(({ data }) => setOverride(data)); }, []);
  const rawPage = override?.specs?.founderPage;
  const page = typeof rawPage === "string" ? (() => { try { return JSON.parse(rawPage); } catch { return {}; } })() : (rawPage || {});
  const displayArticle = page.html ? { ...article, html: page.html } : article;
  const displayImage = page.imageUrl || article?.image;
  const storedImages = Array.isArray(override?.image_urls) ? override.image_urls.filter(Boolean) : [];
  const gallery = Array.from(new Set([
    ...(Array.isArray(page.galleryUrls) ? page.galleryUrls : []),
    ...storedImages.filter((url: string) => url !== page.imageUrl),
  ].filter(Boolean)));

  return (
    <>
      <CompactPageHeading title={page.title || "Founder"} crumbs={[{ label: "Founder" }]} />

      <section className="mx-auto max-w-[1400px] px-4 pb-12 pt-3 sm:px-6 lg:px-10 lg:pb-16 lg:pt-5">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          <Reveal>
            <div className="sticky top-28">
              {displayImage && (
                <div className="relative overflow-hidden">
                  <img
                    src={displayImage}
                    alt={locale === "th" ? BRAND.founder.th : BRAND.founder.en}
                    className="block w-full max-w-none object-cover"
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
            ) : displayArticle ? (
              <>
                <RichText html={displayArticle.html} className="max-w-[46rem]" />
                {gallery.length > 0 && <div className="mt-8 w-full border-t border-border/70 pt-5"><p className="mb-4 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{t("ภาพเพิ่มเติม", "More images")}</p><div className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{gallery.map((url: string, index: number) => <img key={`${url}-${index}`} src={url} alt={`${page.title || "Founder"} ${index + 1}`} className="h-44 w-72 shrink-0 snap-start object-cover sm:h-52 sm:w-80 lg:h-60 lg:w-[22rem]" loading="lazy" onError={event => { event.currentTarget.style.display = "none"; }} />)}</div></div>}
              </>
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
