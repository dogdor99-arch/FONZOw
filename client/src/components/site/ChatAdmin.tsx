import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send, Trash2, UserRound, Search } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

export function ChatAdmin() {
  const { t } = useLocale();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const rooms = trpc.chat.rooms.useQuery({ query: query.trim() || undefined }, { refetchInterval: 5000 });
  const messages = trpc.chat.messages.useQuery({ roomId: selectedId ?? 0 }, { enabled: Boolean(selectedId), refetchInterval: selectedId ? 5000 : false });
  const reply = trpc.chat.reply.useMutation({ onSuccess: () => { setBody(""); messages.refetch(); rooms.refetch(); }, onError: error => toast.error(error.message) });
  const remove = trpc.chat.remove.useMutation({ onSuccess: () => { setSelectedId(null); rooms.refetch(); }, onError: error => toast.error(error.message) });

  useEffect(() => {
    if (selectedId && rooms.data?.some(room => room.id === selectedId)) return;
    if (!selectedId && rooms.data?.[0]) setSelectedId(rooms.data[0].id);
  }, [rooms.data, selectedId]);

  const selected = rooms.data?.find(room => room.id === selectedId);
  const send = (event: React.FormEvent) => { event.preventDefault(); if (selectedId && body.trim()) reply.mutate({ roomId: selectedId, body }); };

  return <div className="grid min-h-[520px] gap-5 lg:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.6fr)]">
    <section className="border border-border bg-card"><div className="flex items-center justify-between border-b border-border p-4"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-brand" /><h2 className="font-display text-xl">{t("ห้องแชท", "Chat rooms")}</h2></div><span className="text-xs text-muted-foreground">{rooms.data?.length ?? 0}</span></div><div className="border-b border-border p-3"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder={t("ค้นหาอีเมลหรือข้อความ", "Search email or message")} className="h-9 rounded-none pl-8 text-xs" /></div></div><div className="max-h-[410px] overflow-y-auto">{rooms.isLoading ? <Loader2 className="m-5 h-5 animate-spin text-brand" /> : rooms.data?.length ? rooms.data.map(room => <button key={room.id} type="button" onClick={() => setSelectedId(room.id)} className={cn("block w-full border-b border-border p-4 text-left transition hover:bg-secondary/60", room.id === selectedId && "bg-secondary")}><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{room.name || t("ผู้เยี่ยมชม", "Visitor")}</span><span className={cn("text-[10px] font-semibold uppercase", room.unreadCount > 0 ? "text-brand" : "text-emerald-600")}>{room.unreadCount > 0 ? t("รอตอบ", "Needs reply") : t("ตอบแล้ว", "Replied")}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{room.email || t("ไม่มีอีเมล", "No email")}</p><p className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span>{new Date(room.lastMessageAt).toLocaleString()}</span>{room.unreadCount > 0 && <span className="rounded-full bg-brand px-1.5 py-0.5 text-[9px] text-brand-foreground">{room.unreadCount}</span>}</p></button>) : <p className="p-5 text-sm text-muted-foreground">{t("ไม่พบห้องแชท", "No matching chat rooms")}</p>}</div></section>
    <section className="flex min-h-[520px] flex-col border border-border bg-card">{selected ? <><div className="flex items-center justify-between gap-3 border-b border-border p-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"><UserRound className="h-4 w-4 text-brand" /></span><div className="min-w-0"><h2 className="truncate font-medium">{selected.name || t("ผู้เยี่ยมชม", "Visitor")}</h2><p className="truncate text-xs text-muted-foreground">{selected.email || selected.phone || t("ไม่ระบุช่องทางติดต่อ", "No contact details")}</p></div></div><Button type="button" variant="ghost" className="h-8 rounded-none px-2 text-red-600" disabled={remove.isPending} onClick={() => { if (window.confirm(t("ลบห้องและข้อความทั้งหมดหรือไม่?", "Delete this room and all messages?"))) remove.mutate({ roomId: selected.id }); }} aria-label={t("ลบห้อง", "Delete room")}><Trash2 className="h-4 w-4" /></Button></div><div className="flex-1 space-y-3 overflow-y-auto bg-cream/30 p-5">{messages.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-brand" /> : messages.data?.length ? messages.data.map(message => <div key={message.id} className={cn("max-w-[75%] rounded-sm px-3 py-2 text-sm", message.senderType === "admin" ? "ml-auto bg-brand text-brand-foreground" : "bg-background text-foreground")}><p>{message.body}</p><p className={cn("mt-1 text-[10px]", message.senderType === "admin" ? "text-brand-foreground/70" : "text-muted-foreground")}>{new Date(message.createdAt).toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">{t("ยังไม่มีข้อความ", "No messages yet")}</p>}</div><form onSubmit={send} className="flex gap-2 border-t border-border p-4"><Input required value={body} onChange={event => setBody(event.target.value)} placeholder={t("พิมพ์ตอบลูกค้า...", "Reply to customer...")} className="h-10 rounded-none" /><Button type="submit" disabled={reply.isPending} className="h-10 rounded-none bg-brand text-brand-foreground"><Send className="mr-2 h-4 w-4" />{t("ตอบกลับ", "Reply")}</Button></form></> : <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">{t("เลือกห้องแชทเพื่อดูข้อความ", "Select a chat room to view messages")}</div>}</section>
  </div>;
}
