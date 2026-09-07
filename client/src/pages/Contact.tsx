import { ExternalLink, Facebook, Mail, MapPin, MessageCircle, Phone, Instagram, Youtube } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { BRAND } from "@/lib/brand";

export default function Contact() {
  const { t } = useLocale();
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    BRAND.showroom.mapQuery,
  )}&z=16&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.showroom.mapQuery)}`;

  return (
    <>
      <CompactPageHeading
        eyebrow={t("ติดต่อเรา", "Get in touch")}
        title="Contact"
        crumbs={[{ label: "Contact" }]}
      />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-10 lg:py-14" style={{ backgroundImage: "linear-gradient(rgba(245, 241, 232, 0.38), rgba(245, 241, 232, 0.38)), url('/brand-story.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="relative mx-auto grid max-w-[1400px] items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <Reveal>
            <div className="h-full overflow-hidden rounded-sm border border-border bg-card shadow-[0_12px_35px_-24px_rgba(28,22,17,0.55)]">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-7">
                <div><p className="eyebrow text-brand">{t("พิกัดโชว์รูม", "Showroom location")}</p><h2 className="mt-1 font-display text-2xl">{t("แวะมาหาเรา", "Find us")}</h2></div>
                <a href={mapLink} target="_blank" rel="noreferrer" className="press inline-flex items-center gap-2 border border-border px-3 py-2 text-[10px] font-semibold tracking-[0.1em] text-brand uppercase transition hover:border-brand hover:bg-brand hover:text-brand-foreground">{t("นำทาง", "Directions")}<ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
              <iframe title={t("แผนที่โชว์รูม Fonzo", "Fonzo showroom map")} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[300px] w-full border-0 sm:h-[360px] lg:h-full lg:min-h-[430px]" />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="h-full border border-border bg-card p-7 sm:p-9">
              <p className="eyebrow">{t("โชว์รูม", "Showroom")}</p>
              <h3 className="mt-3 font-display text-2xl">{BRAND.showroom.nameTh}</h3>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} /><span>{t(BRAND.showroom.addressTh, BRAND.showroom.addressEn)}</span></li>
                {BRAND.contact.phones.map(phone => <li key={phone} className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} /><a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-brand">{phone}</a></li>)}
                <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} /><a href={`mailto:${BRAND.contact.email}`} className="hover:text-brand">{BRAND.contact.email}</a></li>
              </ul>
              <div className="my-7 hairline" />
              <p className="eyebrow">{t("วันและเวลาทำการ", "Opening hours")}</p><p className="mt-2 text-sm text-muted-foreground">{t(BRAND.showroom.hoursTh, BRAND.showroom.hoursEn)}</p>
              <div className="my-7 hairline" />
              <p className="eyebrow">{t("ช่องทางออนไลน์", "Social")}</p><div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{[{ href: BRAND.contact.facebook, icon: Facebook, label: "Facebook" }, { href: BRAND.contact.youtube, icon: Youtube, label: "YouTube" }, { href: BRAND.contact.line, icon: MessageCircle, label: "Line" }, { href: BRAND.contact.instagram, icon: Instagram, label: "Instagram" }].map(social => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="press inline-flex shrink-0 items-center gap-2 whitespace-nowrap border border-border px-4 py-2 text-xs text-muted-foreground hover:border-brand/50 hover:text-brand"><social.icon className="h-3.5 w-3.5" strokeWidth={1.6} />{social.label}</a>)}<button type="button" onClick={() => window.dispatchEvent(new Event("fonzo:open-chat"))} className="press inline-flex shrink-0 items-center gap-2 whitespace-nowrap border border-brand bg-brand px-4 py-2 text-xs text-brand-foreground transition hover:bg-brand/90"><MessageCircle className="h-3.5 w-3.5" strokeWidth={1.6} />{t("ติดต่อทันที", "Chat now")}</button></div>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
