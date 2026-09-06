import { ArrowRight, Guitar, Hammer, Package } from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";

function CapoIcon({ className = "h-10 w-10", strokeWidth = 1.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M11 9.5h26v6H11z" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M15 15.5v17.2c0 3.1 2.5 5.6 5.6 5.6h6.8c3.1 0 5.6-2.5 5.6-5.6V15.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M20 9.5v-3h8v3M20 23h8M19 30h10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

const CHOICES = [
  {
    href: "/guitars/catalog",
    icon: Guitar,
    eyebrow: ["กีตาร์สำเร็จรูป", "Ready-to-play guitars"],
    title: ["กีตาร์ที่พร้อมเล่น", "Ready-to-play guitars"],
    body: ["เลือกรุ่น Fonzo Classic และ Fonzo Acoustic พร้อมดูรายละเอียดและช่องทางสั่งซื้อ", "Browse Fonzo Classic and Fonzo Acoustic models with product details and buying channels."],
  },
  {
    href: "/guitar-custom",
    icon: Hammer,
    eyebrow: ["กีตาร์สั่งทำ", "Guitar Custom"],
    title: ["สร้างกีตาร์ในแบบของคุณ", "Build your own guitar"],
    body: ["เลือกฐาน Fonzo Custom หรือ Fonzo Selection แล้วปรับแต่งวัสดุและชิ้นส่วน", "Choose a Fonzo Custom or Fonzo Selection base, then explore materials and parts."],
  },
  {
    href: "/accessories",
    icon: CapoIcon,
    eyebrow: ["คาโป้และอุปกรณ์", "Capos & accessories"],
    title: ["อุปกรณ์สำหรับการเล่น", "Playing accessories"],
    body: ["รวมคาโป้ สายกีตาร์ และอุปกรณ์เสริมของ Fonzo ในร้านเดียว", "Find Fonzo capos, strings and playing accessories in one place."],
  },
];

export default function ShopGateway() {
  const { t } = useLocale();

  return (
    <>
      <PageHeading
        eyebrow={t("เลือกทางเข้าร้าน", "Choose your path")}
        title={t("Guitar Shop", "Guitar Shop")}
        index="01"
        description={t(
          "เลือกดูสินค้าพร้อมเล่น สั่งทำกีตาร์ หรือเลือกอุปกรณ์เสริมได้จากหน้านี้",
          "Choose ready-to-play guitars, custom builds or playing accessories from one simple hub.",
        )}
        crumbs={[{ label: t("Guitar Shop", "Guitar Shop") }]}
      />

      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10 lg:pb-28">
        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {CHOICES.map((choice, index) => {
            const Icon = choice.icon;
            return (
              <Reveal key={choice.href} delay={index * 70}>
                <Link
                  href={choice.href}
                  className="group flex min-h-[330px] flex-col justify-between bg-card p-7 transition-colors duration-300 hover:bg-ink hover:text-cream sm:p-9"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="flex h-16 w-16 items-center justify-center border border-border text-brand transition-colors group-hover:border-gold group-hover:text-gold">
                        <Icon className="h-9 w-9" strokeWidth={1.25} />
                      </span>
                      <span className="font-display text-4xl text-border transition-colors group-hover:text-cream/15">0{index + 1}</span>
                    </div>
                    <p className="mt-10 text-[10px] tracking-[0.2em] text-muted-foreground uppercase transition-colors group-hover:text-gold">
                      {t(choice.eyebrow[0], choice.eyebrow[1])}
                    </p>
                    <h2 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">{t(choice.title[0], choice.title[1])}</h2>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-cream/65">
                      {t(choice.body[0], choice.body[1])}
                    </p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-[11px] tracking-[0.16em] text-brand uppercase transition-colors group-hover:text-gold">
                    {t("เข้าหน้าร้าน", "Enter")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5 text-xs text-muted-foreground">
          <span>{t("กีตาร์สำเร็จรูป · กีตาร์สั่งทำ · คาโป้และอุปกรณ์", "Ready-to-play · Custom · Capos and accessories")}</span>
          <Link href="/contact" className="inline-flex items-center gap-2 text-brand hover:text-gold">
            {t("ต้องการคำแนะนำ", "Need advice?")}
            <Package className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </>
  );
}
