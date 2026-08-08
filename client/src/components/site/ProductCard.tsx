import { Link } from "wouter";
import type { FonzoProductSummary } from "@shared/fonzo/types";
import { useLocale } from "@/contexts/LocaleContext";
import { BuyChannels } from "./BuyChannels";
import { hasMarketplaceListing } from "@shared/fonzo/marketplace";
import { cn } from "@/lib/utils";

export function formatThb(price: number | null, priceLabel: string, locale: "th" | "en") {
  if (price === null) return locale === "th" ? "สอบถามราคา" : "Price on enquiry";
  return `฿${price.toLocaleString("en-US")}`;
}

export function ProductCard({
  product,
  basePath,
  className,
}: {
  product: FonzoProductSummary;
  basePath: string;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const title = locale === "th" ? product.name || product.nameEn : product.nameEn || product.name;
  const buyable = hasMarketplaceListing(product.code);

  return (
    <Link
      href={`${basePath}/${product.code}`}
      className={cn("group block", className)}
      aria-label={title}>
      <div className="relative overflow-hidden bg-secondary/70">
        <div className="aspect-[3/4] w-full">
          {product.image ? (
            <img
              src={product.image}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              {t("ไม่มีรูปภาพ", "No image")}
            </div>
          )}
        </div>
        {product.popular && (
          <span className="absolute left-3 top-3 bg-brand px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-brand-foreground uppercase">
            {t("แนะนำ", "Featured")}
          </span>
        )}
        {buyable && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 bg-background/92 px-2 py-1 backdrop-blur-sm">
            <BuyChannels code={product.code} title={product.nameEn || product.name} variant="compact" />
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="pt-4">
        <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{product.seriesName}</p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-[1.0625rem] leading-snug transition-colors group-hover:text-brand">
          {title}
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-sm text-foreground/80">
            {formatThb(product.price, product.priceLabel, locale)}
          </p>
          {buyable && (
            <span className="text-[10px] tracking-[0.16em] text-gold uppercase">
              {t("ซื้อออนไลน์ได้", "Buy online")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] w-full animate-pulse bg-secondary" />
      <div className="pt-4 space-y-2">
        <div className="h-2.5 w-20 animate-pulse bg-secondary" />
        <div className="h-4 w-full animate-pulse bg-secondary" />
        <div className="h-3 w-24 animate-pulse bg-secondary" />
      </div>
    </div>
  );
}
