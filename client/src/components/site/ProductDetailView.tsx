import { Link } from "wouter";
import { Play } from "lucide-react";
import type { FonzoProductDetail, FonzoProductSummary } from "@shared/fonzo/types";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "./Reveal";
import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { BuyChannels } from "./BuyChannels";

function youtubeEmbed(url: string): string | null {
  const patterns = [/[?&]v=([\w-]{6,})/, /youtu\.be\/([\w-]{6,})/, /embed\/([\w-]{6,})/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function ProductDetailView({
  product,
  related,
  basePath,
}: {
  product: FonzoProductDetail;
  related: FonzoProductSummary[];
  basePath: string;
}) {
  const { locale, t } = useLocale();

  const title = locale === "th" ? product.name || product.nameEn : product.nameEn || product.name;
  const specs = locale === "th" ? product.specs : product.specsEn;
  const images = product.images.length > 0 ? product.images : [];
  const embed = product.videoUrl ? youtubeEmbed(product.videoUrl) : null;

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-16">
          {/* ---------- Media ---------- */}
          {/* Sticky on desktop so the instrument stays in view while the spec
              table (which can run to 20+ rows) is read alongside it. */}
          {/* `min-w-0` on both grid children: without it the columns can fall
              back to min-content sizing, which collapses the text column. */}
          <div className="min-w-0 lg:sticky lg:top-24">
            <ProductGallery images={images} alt={title} />
          </div>

          {/* ---------- Info ---------- */}
          <div className="min-w-0">
            <p className="eyebrow">
              {product.typeName}
              {product.seriesName ? ` · ${product.seriesName}` : ""}
            </p>
            <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">
              {t("รหัสสินค้า", "Reference")} {product.code}
            </p>

            <div className="mt-8 gold-rule" />

            <p className="mt-8 font-display text-3xl">
              {product.price !== null
                ? `฿${product.price.toLocaleString("en-US")}`
                : t("สอบถามราคา", "Price on enquiry")}
            </p>

            <BuyChannels code={product.code} title={title} className="mt-8" />

            {/* Specs */}
            {specs.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow">{t("ข้อมูลจำเพาะ", "Specification")}</p>
                <dl className="mt-5 grid border-t border-border/70 sm:grid-cols-2 sm:gap-x-8">
                  {/* Upstream specs can repeat the same title/value pair, so the
                      row position is part of the key to keep it unique. */}
                  {specs.map((spec, index) => (
                    <div
                      key={`${spec.title}-${spec.value}-${index}`}
                      className="border-b border-border/70 py-3.5">
                      <dt className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
                        {spec.title}
                      </dt>
                      <dd className="mt-1 text-sm leading-snug text-foreground/90">
                        {spec.value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video */}
      {embed && (
        <section className="border-y border-border/70 bg-secondary/40">
          <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
            <Reveal>
              <p className="eyebrow inline-flex items-center gap-2">
                <Play className="h-3 w-3" fill="currentColor" />
                {t("ฟังเสียงจริง", "Hear it played")}
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl">{t("วิดีโอสาธิตเสียง", "Sound demonstration")}</h2>
              <div className="mt-8 aspect-video w-full bg-ink">
                <iframe
                  src={embed}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
          <Reveal>
            <p className="eyebrow">{t("รุ่นใกล้เคียง", "You may also like")}</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              {t(`อื่น ๆ ใน ${product.typeName}`, `More from ${product.typeName}`)}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.code} delay={index * 50}>
                <ProductCard product={item} basePath={basePath} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
