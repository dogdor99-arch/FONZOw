import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronDown, Inbox, ListPlus, Loader2, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PageHeading } from "@/components/site/SiteLayout";
import { SellerThread } from "@/components/site/SellerThread";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MyListings() {
  const { t } = useLocale();
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [openThread, setOpenThread] = useState<string | null>(null);

  const { data: listings = [], isLoading } = trpc.marketplace.mine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: inbox = [] } = trpc.marketplace.messages.inbox.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const update = trpc.marketplace.update.useMutation({
    onSuccess: () => {
      utils.marketplace.mine.invalidate();
      utils.marketplace.list.invalidate();
      toast.success(t("อัปเดตประกาศแล้ว", "Listing updated"));
    },
    onError: error => toast.error(error.message || t("อัปเดตไม่สำเร็จ", "Update failed")),
  });

  const remove = trpc.marketplace.remove.useMutation({
    onSuccess: () => {
      utils.marketplace.mine.invalidate();
      utils.marketplace.list.invalidate();
      toast.success(t("ลบประกาศแล้ว", "Listing removed"));
    },
  });

  /**
   * Group inbox rows into one conversation per (listing, buyer) pair so the
   * seller sees a single thread per interested buyer instead of loose messages.
   */
  const conversations = useMemo(() => {
    if (!user) return [];
    const map = new Map<
      string,
      { listingId: number; listingTitle: string; buyerId: number; buyerName: string; lastAt: Date; lastBody: string; unread: number }
    >();

    inbox.forEach(item => {
      // The counterpart is whoever isn't the current user.
      const buyerId = item.senderId === user.id ? item.recipientId : item.senderId;
      const buyerName = item.senderId === user.id ? t("ผู้ซื้อ", "Buyer") : item.senderName;
      const key = `${item.listingId}:${buyerId}`;
      const existing = map.get(key);
      const createdAt = new Date(item.createdAt);
      const unread = !item.mine && !item.readAt ? 1 : 0;

      if (!existing) {
        map.set(key, {
          listingId: item.listingId,
          listingTitle: item.listingTitle,
          buyerId,
          buyerName,
          lastAt: createdAt,
          lastBody: item.body,
          unread,
        });
      } else {
        existing.unread += unread;
        if (createdAt > existing.lastAt) {
          existing.lastAt = createdAt;
          existing.lastBody = item.body;
          if (!item.mine) existing.buyerName = item.senderName;
        }
      }
    });

    return Array.from(map.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
  }, [inbox, user, t]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageHeading
          eyebrow={t("ชุมชนคนรักกีตาร์", "Fonzo community")}
          title={t("ประกาศของฉัน", "My listings")}
          crumbs={[
            { label: t("ซื้อขายแลกเปลี่ยน", "Marketplace"), href: "/marketplace" },
            { label: t("ประกาศของฉัน", "My listings") },
          ]}
        />
        <section className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
          <Lock className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.3} />
          <p className="mt-5 font-display text-xl">{t("ต้องเข้าสู่ระบบก่อน", "Sign in required")}</p>
          <Button
            onClick={() => startLogin()}
            className="press mt-7 h-11 rounded-none bg-brand px-7 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
            {t("เข้าสู่ระบบ", "Sign in")}
          </Button>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow={t("ชุมชนคนรักกีตาร์", "Fonzo community")}
        title={t("ประกาศของฉัน", "My listings")}
        description={t(
          "จัดการประกาศของคุณ ปรับสถานะเมื่อมีผู้จองหรือขายได้ และดูข้อความจากผู้สนใจ",
          "Manage your listings, update status when reserved or sold, and read messages from interested buyers.",
        )}
        crumbs={[
          { label: t("ซื้อขายแลกเปลี่ยน", "Marketplace"), href: "/marketplace" },
          { label: t("ประกาศของฉัน", "My listings") },
        ]}
      />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">{t("ประกาศทั้งหมด", "Your listings")}</h2>
          <Button
            asChild
            className="press h-11 rounded-none bg-brand px-5 text-[11px] tracking-[0.16em] text-brand-foreground uppercase hover:bg-brand/90">
            <Link href="/marketplace/new">
              <ListPlus className="mr-2 h-4 w-4" strokeWidth={1.6} />
              {t("ลงประกาศใหม่", "New listing")}
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse bg-secondary" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <p className="mt-8 border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {t("คุณยังไม่มีประกาศ", "You have no listings yet.")}
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {listings.map(listing => (
              <li key={listing.id} className="flex flex-wrap items-center gap-4 py-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden bg-secondary/70">
                  {listing.images[0] ? (
                    <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-[200px] flex-1">
                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="font-display text-base hover:text-brand">
                    {listing.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {listing.price ? `฿${Number(listing.price).toLocaleString("en-US")}` : t("แลกเปลี่ยน", "Trade")}
                    {" · "}
                    {new Date(listing.createdAt).toLocaleDateString()}
                    {" · "}
                    {listing.viewCount} {t("ครั้ง", "views")}
                  </p>
                </div>
                <Select
                  value={listing.status}
                  onValueChange={value =>
                    update.mutate({ id: listing.id, status: value as "active" | "reserved" | "sold" | "hidden" })
                  }>
                  <SelectTrigger className="h-10 w-[150px] rounded-none border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("กำลังขาย", "Active")}</SelectItem>
                    <SelectItem value="reserved">{t("จองแล้ว", "Reserved")}</SelectItem>
                    <SelectItem value="sold">{t("ขายแล้ว", "Sold")}</SelectItem>
                    <SelectItem value="hidden">{t("ซ่อน", "Hidden")}</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t("ลบประกาศนี้?", "Delete this listing?"))) {
                      remove.mutate({ id: listing.id });
                    }
                  }}
                  aria-label={t("ลบประกาศ", "Delete listing")}
                  className="press inline-flex h-10 w-10 items-center justify-center border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive">
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-16">
          <h2 className="font-display text-xl">{t("ข้อความ", "Messages")}</h2>
          {conversations.length === 0 ? (
            <p className="mt-6 border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              <Inbox className="mx-auto mb-3 h-6 w-6" strokeWidth={1.3} />
              {t("ยังไม่มีข้อความ", "No messages yet.")}
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {conversations.map(conversation => {
                const open = openThread === conversation.key;
                return (
                  <li key={conversation.key} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenThread(open ? null : conversation.key)}
                      className="press flex w-full items-start gap-3 text-left">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-medium">
                            {conversation.listingTitle}
                            <span className="ml-2 text-xs text-muted-foreground">
                              · {conversation.buyerName}
                            </span>
                            {conversation.unread > 0 && (
                              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center bg-brand px-1.5 text-[10px] text-brand-foreground">
                                {conversation.unread}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastAt.toLocaleString()}
                          </span>
                        </span>
                        <span className="mt-1.5 block truncate text-sm text-muted-foreground">
                          {conversation.lastBody}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          open && "rotate-180",
                        )}
                        strokeWidth={1.6}
                      />
                    </button>

                    {open && (
                      <>
                        <SellerThread
                          listingId={conversation.listingId}
                          buyerId={conversation.buyerId}
                          buyerName={conversation.buyerName}
                        />
                        <Link
                          href={`/marketplace/${conversation.listingId}`}
                          className="mt-2 inline-block text-xs text-brand hover:underline">
                          {t("ดูประกาศ", "View listing")}
                        </Link>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
