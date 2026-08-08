import { useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Seller-side conversation panel.
 *
 * Rendered inside "My listings" for each buyer who has written in, so the
 * seller can read the full thread and reply without leaving the page.
 */
export function SellerThread({
  listingId,
  buyerId,
  buyerName,
}: {
  listingId: number;
  buyerId: number;
  buyerName: string;
}) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const [body, setBody] = useState("");

  const { data: thread = [], isLoading } = trpc.marketplace.messages.thread.useQuery({
    listingId,
    withUserId: buyerId,
  });

  const reply = trpc.marketplace.messages.reply.useMutation({
    onSuccess: () => {
      setBody("");
      utils.marketplace.messages.thread.invalidate({ listingId, withUserId: buyerId });
      utils.marketplace.messages.inbox.invalidate();
      toast.success(t("ส่งข้อความแล้ว", "Reply sent"));
    },
    onError: error => toast.error(error.message || t("ส่งข้อความไม่สำเร็จ", "Could not send reply")),
  });

  return (
    <div className="mt-4 border border-border/70 bg-secondary/30 p-4">
      <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {t("สนทนากับ", "Conversation with")} {buyerName}
      </p>

      {isLoading ? (
        <div className="mt-3 h-16 animate-pulse bg-secondary" />
      ) : (
        <ul className="mt-3 max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {thread.map(item => (
            <li key={item.id} className={cn("flex", item.mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2 text-sm",
                  item.mine ? "bg-brand text-brand-foreground" : "bg-card text-foreground",
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
          if (!body.trim()) return;
          reply.mutate({ listingId, recipientId: buyerId, body: body.trim() });
        }}
        className="mt-3 flex gap-2">
        <Textarea
          rows={2}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={t("พิมพ์ข้อความตอบกลับ", "Write a reply")}
          className="rounded-none border-border bg-card"
        />
        <Button
          type="submit"
          disabled={reply.isPending || !body.trim()}
          aria-label={t("ส่ง", "Send")}
          className="press h-auto shrink-0 rounded-none bg-brand px-4 text-brand-foreground hover:bg-brand/90">
          {reply.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" strokeWidth={1.6} />
          )}
        </Button>
      </form>
    </div>
  );
}

