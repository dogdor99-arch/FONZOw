import { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  Circle,
  CreditCard,
  Hammer,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGES = ["paid", "in_production", "shipped", "delivered"] as const;

const STAGE_META: Record<
  (typeof STAGES)[number],
  { icon: typeof CreditCard; th: string; en: string }
> = {
  paid: { icon: CreditCard, th: "ยืนยันการชำระเงิน", en: "Payment confirmed" },
  in_production: { icon: Hammer, th: "เตรียมสินค้า / งานช่าง", en: "Preparing & setup" },
  shipped: { icon: Truck, th: "จัดส่งแล้ว", en: "Shipped" },
  delivered: { icon: PackageCheck, th: "ถึงมือผู้รับ", en: "Delivered" },
};

export default function TrackOrder() {
  const { t } = useLocale();
  const [form, setForm] = useState({ orderNumber: "", email: "" });
  const [query, setQuery] = useState<{ orderNumber: string; email: string } | null>(null);

  const { data, isFetching, isError } = trpc.orders.track.useQuery(query!, {
    enabled: Boolean(query),
    retry: false,
  });

  const currentIndex = data ? STAGES.indexOf(data.status as (typeof STAGES)[number]) : -1;
  const cancelled = data?.status === "cancelled";

  return (
    <>
      <PageHeading
        eyebrow={t("บริการหลังการขาย", "After-sales")}
        title={t("ติดตามคำสั่งซื้อ", "Track your order")}
        description={t(
          "กรอกเลขที่คำสั่งซื้อและอีเมลที่ใช้สั่งซื้อ เพื่อดูสถานะการเตรียมสินค้าและการจัดส่ง",
          "Enter your order number and the email used at checkout to see preparation and delivery status.",
        )}
        crumbs={[{ label: t("ติดตามคำสั่งซื้อ", "Track order") }]}
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <form
          onSubmit={event => {
            event.preventDefault();
            if (!form.orderNumber.trim() || !form.email.trim()) return;
            setQuery({ orderNumber: form.orderNumber.trim(), email: form.email.trim() });
          }}
          className="border border-border bg-card p-7 sm:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
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
                placeholder="1042"
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
                placeholder="you@example.com"
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isFetching}
            className="press mt-7 h-12 w-full rounded-none bg-brand text-[11px] tracking-[0.2em] text-brand-foreground uppercase hover:bg-brand/90 sm:w-auto sm:px-10">
            <Search className="mr-2 h-4 w-4" strokeWidth={1.6} />
            {isFetching ? t("กำลังค้นหา", "Searching") : t("ค้นหาคำสั่งซื้อ", "Find my order")}
          </Button>
        </form>

        {query && !isFetching && (data === null || isError) && (
          <div className="mt-8 border border-border bg-card p-8 text-center">
            <XCircle className="mx-auto h-7 w-7 text-muted-foreground" strokeWidth={1.4} />
            <p className="mt-4 font-display text-lg">{t("ไม่พบคำสั่งซื้อนี้", "Order not found")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "กรุณาตรวจสอบเลขที่คำสั่งซื้อและอีเมลอีกครั้ง หรือติดต่อทีมงานเพื่อให้ช่วยตรวจสอบ",
                "Please double-check the order number and email, or contact our team for help.",
              )}
            </p>
            <Button
              asChild
              variant="outline"
              className="press mt-6 h-11 rounded-none border-foreground/25 px-6 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand">
              <Link href="/contact">{t("ติดต่อทีมงาน", "Contact us")}</Link>
            </Button>
          </div>
        )}

        {data && (
          <div className="mt-8 border border-border bg-card">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/70 px-7 py-6">
              <div>
                <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {t("คำสั่งซื้อเลขที่", "Order")}
                </p>
                <p className="mt-1 font-display text-2xl">#{data.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {t("ยอดรวม", "Total")}
                </p>
                <p className="mt-1 font-display text-xl">
                  {data.totalAmount
                    ? `${data.currencyCode === "THB" ? "฿" : ""}${Number(data.totalAmount).toLocaleString("en-US")}`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="px-7 py-8">
              {cancelled ? (
                <p className="flex items-center gap-3 text-sm text-destructive">
                  <XCircle className="h-5 w-5" strokeWidth={1.5} />
                  {t("คำสั่งซื้อนี้ถูกยกเลิกแล้ว", "This order has been cancelled.")}
                </p>
              ) : (
                <ol className="space-y-6">
                  {STAGES.map((stage, index) => {
                    const meta = STAGE_META[stage];
                    const Icon = meta.icon;
                    const done = index <= currentIndex;
                    const active = index === currentIndex;
                    return (
                      <li key={stage} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full border",
                              done ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted-foreground",
                            )}>
                            <Icon className="h-4 w-4" strokeWidth={1.6} />
                          </span>
                          {index < STAGES.length - 1 && (
                            <span
                              className={cn(
                                "mt-1 w-px flex-1 self-center",
                                index < currentIndex ? "bg-brand/50" : "bg-border",
                              )}
                              style={{ minHeight: 24 }}
                            />
                          )}
                        </div>
                        <div className="pb-1">
                          <p
                            className={cn(
                              "font-display text-base",
                              active ? "text-brand" : done ? "text-foreground" : "text-muted-foreground",
                            )}>
                            {t(meta.th, meta.en)}
                          </p>
                          {active && data.note && (
                            <p className="mt-1 text-sm text-muted-foreground">{data.note}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {data.trackingNumber && (
                <div className="mt-8 border border-border/70 bg-secondary/40 p-5">
                  <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                    {t("เลขพัสดุ", "Tracking number")}
                  </p>
                  <p className="mt-1.5 font-mono text-sm">{data.trackingNumber}</p>
                  {data.carrier && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("ขนส่งโดย", "Carrier")}: {data.carrier}
                    </p>
                  )}
                </div>
              )}

              {data.events.length > 0 && (
                <div className="mt-8">
                  <p className="eyebrow">{t("ประวัติการอัปเดต", "Activity")}</p>
                  <ul className="mt-4 space-y-3 text-sm">
                    {data.events.map((event, index) => (
                      <li key={index} className="flex items-start gap-3 text-muted-foreground">
                        {index === data.events.length - 1 ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.6} />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.4} />
                        )}
                        <span>
                          <span className="text-foreground/85">
                            {t(
                              STAGE_META[event.status as (typeof STAGES)[number]]?.th ?? event.status,
                              STAGE_META[event.status as (typeof STAGES)[number]]?.en ?? event.status,
                            )}
                          </span>
                          {event.description ? ` — ${event.description}` : ""}
                          <span className="ml-2 text-xs">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
