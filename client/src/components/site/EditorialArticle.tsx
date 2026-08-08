import { ReactNode } from "react";
import { RichText } from "./RichText";
import { Reveal } from "./Reveal";
import { useLocale } from "@/contexts/LocaleContext";

/**
 * Long-form editorial layout shared by Founder and Brand Story.
 *
 * A full-bleed lead image sits above a two-column reading area: a sticky
 * meta rail on the left (chapter marker, pull quote, optional extras) and the
 * prose column on the right, capped at a comfortable measure.
 */
export function EditorialArticle({
  index,
  kicker,
  pullQuote,
  image,
  imageAlt,
  html,
  isLoading,
  extras,
}: {
  index: string;
  kicker: string;
  pullQuote?: string;
  image?: string | null;
  imageAlt: string;
  html?: string;
  isLoading: boolean;
  extras?: ReactNode;
}) {
  const { t } = useLocale();

  return (
    <>
      {image && (
        <section className="relative">
          <Reveal>
            <div className="relative mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-10">
              <div className="relative overflow-hidden">
                <img
                  src={image}
                  alt={imageAlt}
                  className="max-h-[620px] w-full object-cover"
                  loading="lazy"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,color-mix(in_oklch,var(--ink)_35%,transparent)_100%)]"
                />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-display text-[3.25rem] leading-none text-brand/20">{index}</p>
            <p className="eyebrow mt-4">{kicker}</p>
            <div className="mt-5 gold-rule" />
            {pullQuote && (
              <blockquote className="mt-7 border-l-2 border-brand/40 pl-5 font-display text-lg leading-snug text-foreground/85">
                {pullQuote}
              </blockquote>
            )}
            {extras && <div className="mt-8">{extras}</div>}
          </aside>

          <Reveal>
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
            ) : html ? (
              <RichText html={html} className="max-w-[46rem]" />
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
