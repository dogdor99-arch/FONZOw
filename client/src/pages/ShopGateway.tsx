import { Link } from "wouter";
import { BRAND } from "@/lib/brand";
import { FONZO_CATEGORY_ICONS } from "@/lib/fonzoAssets";

const CHOICES = [
  { href: "/guitars/catalog", image: FONZO_CATEGORY_ICONS.ready.white, label: "Ready-to-play guitars" },
  { href: "/guitar-custom", image: FONZO_CATEGORY_ICONS.custom.white, label: "Guitar Custom" },
  { href: "/accessories", image: FONZO_CATEGORY_ICONS.accessories.white, label: "Accessories" },
] as const;

export default function ShopGateway() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,151,78,0.08),transparent_48%)]" />
      <div className="relative flex w-full max-w-5xl flex-col items-center gap-16">
        <Link href="/" aria-label="Fonzo Guitar home" className="transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><img src={BRAND.logo} alt="Fonzo" className="h-auto w-44 object-contain sm:w-56" /></Link>
        <nav aria-label="FONZO shop categories" className="flex w-full max-w-4xl items-center justify-center gap-4 sm:gap-8 lg:gap-16">
          {CHOICES.map(choice => <Link key={choice.href} href={choice.href} aria-label={choice.label} className="group flex aspect-square w-[28vw] max-w-56 items-center justify-center rounded-full border border-cream/15 p-5 transition duration-300 hover:-translate-y-1 hover:border-gold hover:bg-cream/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:p-8 lg:p-12"><img src={choice.image} alt="" className="h-full w-full object-contain opacity-90 transition duration-300 group-hover:scale-105 group-hover:opacity-100" /></Link>)}
        </nav>
      </div>
    </section>
  );
}
