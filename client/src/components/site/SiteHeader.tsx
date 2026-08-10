import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

// SVG Vector Path ของโลโก้ตัว 'F' แบรนด์ Fonzo Guitars ทรงเป๊ะ 100%
export const FonzoCrestLogo = ({ className = "h-6 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M25 22C38 22 56 18 78 18C86 18 94 20 98 24C101 27 101 31 97 34C93 37 87 36 84 32C81 28 75 26 68 26C52 26 42 32 38 42C36 47 36 52 38 56C42 62 50 64 62 64C72 64 80 62 85 58C88 56 92 58 92 62C92 66 87 71 80 74C72 77 60 78 48 78C38 78 31 82 28 88C25 94 26 100 31 104C36 108 44 108 52 104C58 101 64 95 68 88C70 85 74 84 76 87C78 90 76 94 72 100C66 108 57 114 47 114C34 114 22 108 17 98C13 89 15 78 22 70C15 64 12 55 13 45C15 31 28 22 45 22H25C21 22 18 19 18 15C18 11 21 8 25 8H85C89 8 92 11 92 15C92 19 89 22 85 22H25Z"
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