/**
 * Order registration page.
 *
 * Orders are placed on Shopee or Lazada, so buyers arrive here with the order
 * number from that platform's confirmation. Registering it locally lets the
 * Fonzo team post setup, inspection and dispatch updates that the buyer can
 * follow from `/orders/track` alongside the courier's own tracking.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "wouter";
import { CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrderConfirm() {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const registered = useRef(false);

  const urlOrderNumber = params.get("order") ?? params.get("order_number") ?? "";
  const urlEmail = params.get("email") ?? "";

  const [form, setForm] = useState({ orderNumber: urlOrderNumber, email: urlEmail });
  const [done, setDone] = useState(false);

  const register = trpc.orders.register.useMutation({
    onSuccess: () => setDone(true),
  });

  // Auto-register when both values arrive in the URL.
  useEffect(() => {
    if (registered.current) return;
    if (!urlOrderNumber || !urlEmail) return;
    registered.current = true;
    register.mutate({ orderNumber: urlOrderNumber, email: urlEmail });
  }, [urlOrderNumber, urlEmail]);

  return (
    <>
      <PageHeading
        eyebrow={t("ขอบคุณสำหรับคำสั่งซื้อ", "Thank you")}
        title={t("ลงทะเบียนคำสั่งซื้อ", "Register your order")}
        description={t(
          "หากคุณสั่งซื้อผ่าน Shopee หรือ Lazada แล้ว นำเลขที่คำสั่งซื้อมาลงทะเบียนที่นี่ เพื่อรับอัปเดตการตรวจเช็คและตั้งสายจากทีมงาน Fonzo",
          "If you have ordered on Shopee or Lazada, register the order number here to receive inspection and setup updates from the Fonzo team.",
        )}
        crumbs={[{ label: t("ลงทะเบียนคำสั่งซื้อ", "Register order") }]}
      />

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        {done || register.isSuccess ? (
          <div className="border border-border bg-card p-10 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-brand" strokeWidth={1.4} />
            <p className="mt-5 font-display text-2xl">
              {t("บันทึกคำสั่งซื้อเรียบร้อย", "Your order is registered")}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {t(
                "คุณสามารถติดตามสถานะได้ตลอดเวลาด้วยเลขที่คำสั่งซื้อและอีเมลที่ใช้สั่งซื้อ",
                "You can follow its progress any time with your order number and email.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="press h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
                <Link href="/orders/track">{t("ติดตามคำสั่งซื้อ", "Track order")}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="press h-11 rounded-none border-foreground/25 px-6 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand">
                <Link href="/shop">{t("ดูช่องทางสั่งซื้อ", "Where to buy")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={event => {
              event.preventDefault();
              register.mutate({ orderNumber: form.orderNumber.trim(), email: form.email.trim() });
            }}
            className="border border-border bg-card p-7 sm:p-9">
            <p className="text-sm text-muted-foreground">
              {t(
                "กรอกเลขที่คำสั่งซื้อจาก Shopee หรือ Lazada และอีเมลที่ใช้สั่งซื้อ เพื่อเปิดใช้การติดตามสถานะจากทีมงาน",
                "Enter the order number from Shopee or Lazada and the email you used, to enable team updates.",
              )}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="orderNumber"
                  className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {t("เลขที่คำสั่งซื้อ", "Order number")}
                </label>
                <Input
                  id="orderNumber"
                  required
                  value={form.orderNumber}
                  onChange={e => setForm(prev => ({ ...prev, orderNumber: e.target.value }))}
                  className="mt-2 h-11 rounded-none border-border"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {t("อีเมล", "Email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2 h-11 rounded-none border-border"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={register.isPending}
              className="press mt-7 h-12 w-full rounded-none bg-brand text-[11px] tracking-[0.2em] text-brand-foreground uppercase hover:bg-brand/90 sm:w-auto sm:px-10">
              {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("เปิดใช้การติดตาม", "Enable tracking")}
            </Button>
          </form>
        )}
      </section>
    </>
  );
}
