import { useState } from "react";
import { Facebook, Instagram, Loader2, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const submit = trpc.enquiry.submit.useMutation({
    onSuccess: () => {
      toast.success(t("ส่งข้อความเรียบร้อยแล้ว", "Your message has been sent."), {
        description: t("ทีมงานจะติดต่อกลับโดยเร็วที่สุด", "Our team will get back to you shortly."),
      });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: error => {
      toast.error(t("ส่งข้อความไม่สำเร็จ", "Could not send your message"), {
        description: error.message,
      });
    },
  });

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    BRAND.showroom.mapQuery,
  )}&z=16&output=embed`;

  return (
    <>
      <PageHeading
        eyebrow={t("ติดต่อเรา", "Get in touch")}
        title="Contact"
        description={t(
          "สอบถามรายละเอียดสินค้า นัดหมายเข้าชมโชว์รูม หรือปรึกษาเรื่องการสั่งทำพิเศษ ทีมงาน Fonzo พร้อมให้คำแนะนำ",
          "Ask about a model, book a showroom appointment, or discuss a custom commission — the Fonzo team is happy to help.",
        )}
        crumbs={[{ label: "Contact" }]}
        index="09"
      />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">{t("แบบฟอร์ม", "Enquiry form")}</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">{t("ส่งข้อความถึงเรา", "Send us a message")}</h2>
            <div className="mt-5 gold-rule" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t(
                "กรอกรายละเอียดด้านล่าง ทีมงานจะติดต่อกลับทางอีเมลหรือโทรศัพท์",
                "Fill in the details below and we will reply by email or phone.",
              )}
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={event => {
                event.preventDefault();
                submit.mutate(form);
              }}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("ชื่อ-นามสกุล", "Full name")}</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="rounded-none border-border bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("อีเมล", "Email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="rounded-none border-border bg-card"
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("เบอร์โทรศัพท์", "Phone")}</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="rounded-none border-border bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("เรื่องที่ต้องการสอบถาม", "Subject")}</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="rounded-none border-border bg-card"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t("ข้อความ", "Message")}</Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="rounded-none border-border bg-card"
                />
              </div>
              <Button
                type="submit"
                disabled={submit.isPending}
                className="press h-12 rounded-none bg-brand px-8 text-[11px] tracking-[0.2em] text-brand-foreground uppercase hover:bg-brand/90">
                {submit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("ส่งข้อความ", "Send message")}
              </Button>
            </form>
          </Reveal>

          <Reveal delay={80}>
            <div className="border border-border bg-card p-7 sm:p-9">
              <p className="eyebrow">{t("โชว์รูม", "Showroom")}</p>
              <h3 className="mt-3 font-display text-2xl">{BRAND.showroom.nameTh}</h3>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span>{t(BRAND.showroom.addressTh, BRAND.showroom.addressEn)}</span>
                </li>
                {BRAND.contact.phones.map(phone => (
                  <li key={phone} className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-brand">
                      {phone}
                    </a>
                  </li>
                ))}
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <a href={`mailto:${BRAND.contact.email}`} className="hover:text-brand">
                    {BRAND.contact.email}
                  </a>
                </li>
              </ul>

              <div className="my-7 hairline" />

              <p className="eyebrow">{t("วันและเวลาทำการ", "Opening hours")}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(BRAND.showroom.hoursTh, BRAND.showroom.hoursEn)}
              </p>

              <div className="my-7 hairline" />

              <p className="eyebrow">{t("ช่องทางออนไลน์", "Social")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { href: BRAND.contact.facebook, icon: Facebook, label: "Facebook" },
                  { href: BRAND.contact.youtube, icon: Youtube, label: "YouTube" },
                  { href: BRAND.contact.line, icon: MessageCircle, label: "Line" },
                  { href: BRAND.contact.instagram, icon: Instagram, label: "Instagram" },
                ].map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="press inline-flex items-center gap-2 border border-border px-4 py-2 text-xs text-muted-foreground hover:border-brand/50 hover:text-brand">
                    <social.icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border/70">
        <iframe
          title={t("แผนที่โชว์รูม Fonzo", "Fonzo showroom map")}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[420px] w-full border-0"
        />
      </section>
    </>
  );
}
