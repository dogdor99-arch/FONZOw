import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

// SVG Vector Path ของโลโก้ตัว F แบรนด์ Fonzo
export const FonzoCrestLogo = ({ className = "h-6 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M85 12C72 12 55 22 42 38C35 46.5 28 58 24 71C20.5 82 18.5 94 22 103C25 110.5 32 114 40 114C52 114 62 102 65 92C66.5 87 65 83 60 83C56 83 52.5 86 49.5 89.5C46.5 93 43 96 38.5 96C35 96 32.5 93.5 32.5 89C32.5 80 38.5 65 47 50C53 39 60 30 68 23.5C73 19.5 80 17 86 17C89 17 91 18 92.5 19.5L98 13.5C94.5 12.5 89.5 12 85 12ZM42 38C36 26 27 18 16 18C10 18 5 21 2 25.5L7.5 30C9.5 27 12.5 25 16.5 25C23.5 25 31 31.5 37 40.5L42 38ZM57 52C53 52 48.5 54.5 45.5 58L49.5 63C51.5 60.5 54.5 58.5 57.5 58.5C61 58.5 63 61 63 64.5C63 70 58 78 52 86L56.5 90.5C64 80.5 70.5 69.5 70.5 61.5C70.5 55.5 65 52 57 52Z"
      fill="currentColor"
    />
  </svg>
);

export function SiteHeader() {
  const { t, locale, setLocale } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cream/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 bg-black/80 shadow-inner text-gold">
            <FonzoCrestLogo className="h-6 w-auto text-gold" />
          </div>
          <span className="font-display text-xl tracking-wider text-cream">Fonzo Guitar</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-cream/80">
          <Link href="/guitars" className="hover:text-gold transition">{t("กีตาร์ทั้งหมด", "Guitars")}</Link>
          <Link href="/accessories" className="hover:text-gold transition">{t("อุปกรณ์เสริม", "Accessories")}</Link>
          <Link href="/dealers" className="hover:text-gold transition">{t("ตัวแทนจำหน่าย", "Dealers")}</Link>
          <Link href="/founder" className="hover:text-gold transition">{t("เรื่องราวแบรนด์", "Our Story")}</Link>
          <Link href="/contact" className="hover:text-gold transition">{t("ติดต่อเรา", "Contact")}</Link>
        </nav>

        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === "th" ? "en" : "th")}
          className="rounded-full border border-cream/20 bg-white/5 px-3 py-1 text-xs text-cream hover:border-gold hover:text-gold transition"
        >
          {locale === "th" ? "EN" : "TH"}
        </button>

      </div>
    </header>
  );
}