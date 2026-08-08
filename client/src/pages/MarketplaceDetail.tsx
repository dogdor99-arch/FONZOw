import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeftRight,
  ChevronRight,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Repeat,
  SendHorizonal,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CONDITION_LABEL = {
  new: { th: "ใหม่", en: "New" },
  mint: { th: "สภาพเหมือนใหม่", en: "Mint" },
  excellent: { th: "สภาพดีเยี่ยม", en: "Excellent" },
  good: { th: "สภาพดี", en: "Good" },
  fair: { th: "สภาพพอใช้", en: "Fair" },
} as const;

const INTENT_LABEL = {
  sell: { th: "ขาย", en: "For sale" },
  trade: { th: "แลกเปลี่ยน", en: "For trade" },
  both: { th: "ขาย / แลกเปลี่ยน", en: "Sale or trade" },
} as const;

export default function MarketplaceDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const listingId = Number(id);
  const { t } = useLocale();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");

  const { data: listing, isLoading } = trpc.marketplace.byId.useQuery(
    { id: listingId },
    { enabled: Number.isFinite(listingId) && listingId > 0 },
  );

  const isOwner = Boolean(listing && user && listing.sellerId === user.id);

  const { data: thread = [] } = trpc.marketplace.messages.thread.useQuery(
    { listingId },
    { enabled: isAuthenticated && Number.isFinite(listingId) && listingId > 0 && !isOwner },
  );

  const send = trpc.marketplace.messages.send.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.marketplace.messages.thread.invalidate({ listingId });
      toast.success(t("ส่งข้อความถึงผู้ขายแล้ว", "Message sent to the seller"));
    },
    onError: error => toast.error(error.message || t("ส่งข้อความไม่สำเร็จ", "Could not send message")),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
        <h1 className="text-3xl">{t("ไม่พบประกาศนี้", "Listing not found")}</h1>
        <Button
          asChild
          className="press mt-8 h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
          <Link href="/marketplace">{t("กลับไปหน้าตลาด", "Back to marketplace")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-border/70">
        <nav
          aria-label="breadcrumb"
          className="mx-auto flex max-w-[1400px] items-center gap-1.5 px-4 py-5 text-[11px] text-muted-foreground sm:px-6 lg:px-10">
          <Link href="/" className="tracking-[0.14em] uppercase hover:text-brand">
            {t("หน้าแรก", "Home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/marketplace" className="tracking-[0.14em] uppercase hover:text-brand">
            {t("ซื้อขายแลกเปลี่ยน", "Marketplace")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-foreground/80">{listing.title}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="aspect-[4/3] w-full overflow-hidden bg-secondary/70">
              {listing.images[activeImage] ? (
                <img
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t("ไม่มีรูปภาพ", "No photo")}
                </div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6">
                {listing.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "press aspect-square overflow-hidden border bg-secondary/70",
                      index === activeImage ? "border-brand" : "border-transparent hover:border-border",
                    )}>
                    <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-ink px-2.5 py-1 text-[10px] tracking-[0.14em] text-cream uppercase">
                {listing.intent === "trade" ? (
                  <ArrowLeftRight className="h-3 w-3" />
                ) : listing.intent === "both" ? (
                  <Repeat className="h-3 w-3" />
                ) : (
                  <Tag className="h-3 w-3" />
                )}
                {t(INTENT_LABEL[listing.intent].th, INTENT_LABEL[listing.intent].en)}
              </span>
              <span className="border border-border px-2.5 py-1 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {t(CONDITION_LABEL[listing.condition].th, CONDITION_LABEL[listing.condition].en)}
              </span>
              {listing.status === "reserved" && (
                <span className="bg-gold px-2.5 py-1 text-[10px] tracking-[0.14em] text-ink uppercase">
                  {t("จองแล้ว", "Reserved")}
                </span>
              )}
              {listing.status === "sold" && (
                <span className="bg-muted px-2.5 py-1 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  {t("ขายแล้ว", "Sold")}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl leading-tight sm:text-4xl">{listing.title}</h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {listing.brand && <span>{listing.brand}</span>}
              {listing.model && <span>{listing.model}</span>}
              {listing.year && <span>{listing.year}</span>}
              {listing.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" strokeWidth={1.6} />
                  {listing.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" strokeWidth={1.6} />
                {listing.viewCount}
              </span>
            </div>

            <div className="mt-7 gold-rule" />

            <p className="mt-7 font-display text-3xl">
              {listing.price
                ? `฿${Number(listing.price).toLocaleString("en-US")}`
                : t("แลกเปลี่ยนเท่านั้น", "Trade only")}
            </p>

            <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
              {listing.description}
            </div>

            <div className="mt-10 border border-border bg-card p-6">
              <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("ผู้ลงประกาศ", "Listed by")}
              </p>
              <p className="mt-2 font-display text-lg">{listing.sellerName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(listing.createdAt).toLocaleDateString()}
              </p>

              {(listing.contactLine || listing.contactPhone) && isAuthenticated && (
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {listing.contactPhone && (
                    <p className="inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.6} />
                      {listing.contactPhone}
                    </p>
                  )}
                  {listing.contactLine && (
                    <p className="inline-flex items-center gap-2">
                      <MessageCircle className="h-3.5 w-3.5 text-gold" strokeWidth={1.6} />
                      Line: {listing.contactLine}
                    </p>
                  )}
                </div>
              )}

              {isOwner ? (
                <p className="mt-5 text-xs text-muted-foreground">
                  {t("นี่คือประกาศของคุณ", "This is your listing.")}{" "}
                  <Link href="/marketplace/my-listings" className="text-brand hover:underline">
                    {t("จัดการประกาศ", "Manage listings")}
                  </Link>
                </p>
              ) : !isAuthenticated ? (
                <div className="mt-5">
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "เข้าสู่ระบบเพื่อดูช่องทางติดต่อและส่งข้อความถึงผู้ขาย",
                      "Sign in to view contact details and message the seller.",
                    )}
                  </p>
                  <Button
                    onClick={() => startLogin()}
                    className="press mt-4 h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
                    {t("เข้าสู่ระบบ", "Sign in")}
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="eyebrow">{t("ส่งข้อความถึงผู้ขาย", "Message the seller")}</p>

                  {thread.length > 0 && (
                    <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                      {thread.map(item => (
                        <li
                          key={item.id}
                          className={cn("flex", item.mine ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[85%] px-4 py-2.5 text-sm",
                              item.mine
                                ? "bg-brand text-brand-foreground"
                                : "bg-secondary text-foreground",
                            )}>
                            <p className="whitespace-pre-line">{item.body}</p>
                            <p
                              className={cn(
                                "mt-1 text-[10px]",
                                item.mine ? "text-brand-foreground/70" : "text-muted-foreground",
                              )}>
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    onSubmit={event => {
                      event.preventDefault();
                      if (!message.trim()) return;
                      send.mutate({ listingId, body: message.trim() });
                    }}
                    className="mt-4">
                    <Textarea
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={t("สนใจครับ ขอรายละเอียดเพิ่มเติม", "I'm interested — could you tell me more?")}
                      className="rounded-none border-border"
                    />
                    <Button
                      type="submit"
                      disabled={send.isPending || !message.trim()}
                      className="press mt-3 h-11 w-full rounded-none bg-brand text-[11px] tracking-[0.18em] text-brand-foreground uppercase hover:bg-brand/90">
                      {send.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SendHorizonal className="mr-2 h-4 w-4" strokeWidth={1.6} />
                      )}
                      {t("ส่งข้อความ", "Send message")}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              {t(
                "ประกาศในตลาดนี้เป็นการซื้อขายระหว่างสมาชิก Fonzo เป็นผู้ให้พื้นที่เท่านั้น และไม่ได้เป็นตัวกลางการชำระเงิน กรุณาตรวจสอบสินค้าให้แน่ใจก่อนโอนเงิน",
                "Marketplace listings are member-to-member. Fonzo provides the space only and is not a payment intermediary — please inspect any instrument before transferring funds.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
