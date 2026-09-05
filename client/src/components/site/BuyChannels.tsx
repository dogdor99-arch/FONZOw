import { ExternalLink, Facebook, MessageCircle, Phone } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { BRAND } from "@/lib/brand";
import {
  FACEBOOK_MESSENGER_URL,
  LAZADA_STORE_URL,
  SHOPEE_STORE_URL,
  lazadaSearchUrl,
  marketplaceLinksFor,
  shopeeSearchUrl,
} from "@shared/fonzo/marketplace";

/** Shopee bag mark, drawn to match the brand silhouette without shipping a raster asset. */
function ShopeeMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.4 7.6h15.2l-1 12.1a1.6 1.6 0 0 1-1.6 1.5H7a1.6 1.6 0 0 1-1.6-1.5L4.4 7.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 7.6V6.3a3.3 3.3 0 0 1 6.6 0v1.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.6 15.4c.5.7 1.4 1.1 2.4 1.1 1.3 0 2.2-.6 2.2-1.5 0-1-.9-1.3-2.3-1.7-1.3-.3-2.1-.7-2.1-1.6 0-.9.9-1.5 2.1-1.5.9 0 1.7.3 2.2.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Lazada's stylised "L" bag mark. */
function LazadaMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.6 20.4 7v10L12 21.4 3.6 17V7L12 2.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.6 8.7v6.6h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  /** Upstream product code, e.g. `G0051` or `A0001`. */
  code: string;
  /** Display name used for search fallbacks and the enquiry message. */
  title: string;
  /** Optional direct listing URLs managed from Admin/Supabase. */
  shopeeUrl?: string | null;
  lazadaUrl?: string | null;
  /**
   * `full` — stacked buttons for the product page.
   * `row` — two condensed buttons for list rows.
   * `compact` — icon-only badges for product cards.
   */
  variant?: "full" | "row" | "compact";
  className?: string;
};

/**
 * Purchase routing for a single model.
 *
 * Fonzo fulfils online orders through Shopee and Lazada, so the primary
 * actions link straight to that model's listing. When a listing has not been
 * matched yet the button still works: it opens the official store filtered to
 * the model name, and the Facebook enquiry sits alongside as the human channel
 * the showroom actually answers.
 */
export function BuyChannels({ code, title, shopeeUrl, lazadaUrl, variant = "full", className = "" }: Props) {
  const { t } = useLocale();
  const links = marketplaceLinksFor(code);

  const shopeeHref = shopeeUrl || links?.shopee || shopeeSearchUrl(title);
  const lazadaHref = lazadaUrl || links?.lazada || lazadaSearchUrl(title);
  const shopeeDirect = Boolean(shopeeUrl || links?.shopee);
  const lazadaDirect = Boolean(lazadaUrl || links?.lazada);

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {shopeeHref && (
          <a
            href={shopeeHref}
            target="_blank"
            rel="noreferrer"
            onClick={event => event.stopPropagation()}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ee4d2d]/10 text-[#ee4d2d] hover:bg-[#ee4d2d] hover:text-white"
            title={shopeeDirect ? "Shopee" : t("ค้นหาใน Shopee", "Search Shopee")}>
            <ShopeeMark className="h-3.5 w-3.5" />
          </a>
        )}
        {lazadaHref && (
          <a
            href={lazadaHref}
            target="_blank"
            rel="noreferrer"
            onClick={event => event.stopPropagation()}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0f146d]/10 text-[#0f146d] hover:bg-[#0f146d] hover:text-white"
            title={lazadaDirect ? "Lazada" : t("ค้นหาใน Lazada", "Search Lazada")}>
            <LazadaMark className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <a
          href={shopeeHref}
          target="_blank"
          rel="noreferrer"
          className="press inline-flex flex-1 items-center justify-center gap-2 border border-[#ee4d2d]/30 bg-[#ee4d2d] px-4 py-2.5 text-[10px] tracking-[0.18em] text-white uppercase transition-colors duration-160 hover:bg-[#d8431f]">
          <ShopeeMark className="h-4 w-4" />
          Shopee
        </a>
        <a
          href={lazadaHref}
          target="_blank"
          rel="noreferrer"
          className="press inline-flex flex-1 items-center justify-center gap-2 border border-[#0f146d]/30 bg-[#0f146d] px-4 py-2.5 text-[10px] tracking-[0.18em] text-white uppercase transition-colors duration-160 hover:bg-[#0b1057]">
          <LazadaMark className="h-4 w-4" />
          Lazada
        </a>
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={t("สอบถามทาง Facebook", "Ask on Facebook")}
          title={t("สอบถามทาง Facebook", "Ask on Facebook")}
          className="press inline-flex h-[38px] w-[38px] items-center justify-center border border-[#1877f2]/40 text-[#1877f2] transition-colors duration-160 hover:bg-[#1877f2]/8">
          <Facebook className="h-4 w-4" strokeWidth={1.7} />
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
        {t("สั่งซื้อออนไลน์", "Order online")}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a
          href={shopeeHref}
          target="_blank"
          rel="noreferrer"
          className="press group flex items-center gap-3 border border-[#ee4d2d]/30 bg-[#ee4d2d] px-5 py-4 text-white transition-colors duration-160 hover:bg-[#d8431f]">
          <ShopeeMark className="h-6 w-6 shrink-0" />
          <span className="min-w-0">
            <span className="block text-[11px] tracking-[0.2em] uppercase">Shopee</span>
            <span className="mt-0.5 block truncate text-[11px] text-white/80">
              {shopeeDirect
                ? t("ซื้อรุ่นนี้ทันที", "Buy this model")
                : t("ค้นหาในร้านทางการ", "Find in official store")}
            </span>
          </span>
          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.8} />
        </a>

        <a
          href={lazadaHref}
          target="_blank"
          rel="noreferrer"
          className="press group flex items-center gap-3 border border-[#0f146d]/30 bg-[#0f146d] px-5 py-4 text-white transition-colors duration-160 hover:bg-[#0b1057]">
          <LazadaMark className="h-6 w-6 shrink-0" />
          <span className="min-w-0">
            <span className="block text-[11px] tracking-[0.2em] uppercase">Lazada</span>
            <span className="mt-0.5 block truncate text-[11px] text-white/80">
              {lazadaDirect
                ? t("ซื้อรุ่นนี้ทันที", "Buy this model")
                : t("ค้นหาในร้านทางการ", "Find in official store")}
            </span>
          </span>
          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.8} />
        </a>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noreferrer"
          className="press flex items-center gap-3 border border-[#1877f2]/40 px-5 py-3.5 text-[#1877f2] transition-colors duration-160 hover:bg-[#1877f2]/8">
          <Facebook className="h-5 w-5 shrink-0" strokeWidth={1.7} />
          <span className="text-[11px] tracking-[0.16em] uppercase">
            {t("สอบถามทาง Facebook", "Ask on Facebook")}
          </span>
        </a>

        <a
          href={BRAND.contact.line}
          target="_blank"
          rel="noreferrer"
          className="press flex items-center gap-3 border border-foreground/20 px-5 py-3.5 transition-colors duration-160 hover:border-brand hover:text-brand">
          <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={1.7} />
          <span className="text-[11px] tracking-[0.16em] uppercase">
            {t("คุยผ่าน Line", "Chat on Line")}
          </span>
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.7} />
          {BRAND.contact.phones[0]}
        </span>
        <span>
          {t(
            "ชำระเงินและติดตามสินค้าผ่านระบบของ Shopee / Lazada",
            "Payment and tracking handled by Shopee / Lazada",
          )}
        </span>
        {!shopeeDirect && !lazadaDirect && (
          <span className="inline-flex items-center gap-3">
            <a
              href={SHOPEE_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline">
              {t("ดูร้าน Shopee", "Shopee store")}
            </a>
            <a
              href={LAZADA_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline">
              {t("ดูร้าน Lazada", "Lazada store")}
            </a>
          </span>
        )}
      </div>
    </div>
  );
}
