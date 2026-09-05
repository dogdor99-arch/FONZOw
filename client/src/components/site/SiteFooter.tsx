import React from "react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

export const SiteFooter: React.FC = () => {
  const { t } = useLocale();
  const links = [
    { href: "/guitars", label: t("Guitar Shop", "Guitar Shop") },
    { href: "/guitar-custom", label: t("Guitar Custom", "Guitar Custom") },
    { href: "/works", label: t("ผลงาน", "Works") },
    { href: "/artists", label: t("ศิลปิน", "Artists") },
    { href: "/dealers", label: t("ตัวแทนจำหน่าย", "Dealers") },
    { href: "/contact", label: t("ติดต่อเรา", "Contact") },
  ];

  return (
    <footer className="border-t border-border bg-ink py-10 text-cream">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="font-display text-xl tracking-[0.16em]">FONZO GUITAR</p>
          <p className="mt-2 text-xs text-cream/55">world-class guitar of Thailand</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-cream/70">
          {links.map(link => <Link key={link.href} href={link.href} className="transition-colors hover:text-gold">{link.label}</Link>)}
        </nav>
        <p className="text-xs text-cream/45">© {new Date().getFullYear()} Fonzo Guitar</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
