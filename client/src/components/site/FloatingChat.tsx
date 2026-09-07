import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, Phone, Send, X } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { FACEBOOK_MESSENGER_URL } from "@shared/fonzo/marketplace";
import { cn } from "@/lib/utils";

type Action = { key: string; label: string; detail: string; href: string; tint: string; icon: React.ReactNode };

function MessengerGlyph({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.2.16.14.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.99-.88c.17-.07.36-.09.53-.04 1.62.45 3.36.5 5.05.11C19.4 20.1 22 16.3 22 11.7 22 6.13 17.64 2 12 2Zm6 7.53-2.94 4.67a1.5 1.5 0 0 1-2.17.4L10.55 12.7a.6.6 0 0 0-.72 0l-2.6 1.98c-.35.26-.8-.16-.57-.53l2.94-4.67a1.5 1.5 0 0 1 2.17-.4l2.34 1.9a.6.6 0 0 0 .72 0l2.6-1.98c-.27-.38.15-.8.53-.57Z" /></svg>;
}
function LineGlyph({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}><path d="M12 3C6.9 3 2.75 6.4 2.75 10.58c0 3.75 3.3 6.89 7.76 7.48.3.06.71.2.81.46.09.24.06.6.03.84l-.13.79c-.04.23-.18.9.8.49 1-.42 5.36-3.16 7.32-5.41 1.35-1.48 2-2.99 2-4.65C21.34 6.4 17.1 3 12 3ZM8.2 13.2H6.34a.4.4 0 0 1-.4-.4V9.05a.4.4 0 0 1 .8 0v3.35H8.2a.4.4 0 0 1 0 .8Zm1.57-.4a.4.4 0 0 1-.8 0V9.05a.4.4 0 0 1 .8 0v3.75Zm4.05 0a.4.4 0 0 1-.72.24l-1.92-2.6v2.36a.4.4 0 0 1-.8 0V9.05a.4.4 0 0 0-.72-.24l1.92 2.61V9.05a.4.4 0 0 0 .8 0v3.75Zm2.98-2.28a.4.4 0 0 1 0 .8h-1.3v.68h1.3a.4.4 0 0 1 0 .8h-1.7a.4.4 0 0 1-.4-.4V9.05a.4.4 0 0 1 .4-.4h1.7a.4.4 0 0 1 0 .8h1.7a.4.4 0 0 1 0 .8Z" /></svg>;
}

function getVisitorToken() {
  const key = "fonzo-chat-visitor-token";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(key, token);
  return token;
}

export function FloatingChat() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setToken(getVisitorToken());
    const check = () => setHidden(document.body.style.overflow === "hidden");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const openChat = () => { setOpen(true); setChatOpen(true); };
    window.addEventListener("fonzo:open-chat", openChat);
    return () => window.removeEventListener("fonzo:open-chat", openChat);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const roomQuery = trpc.chat.room.useQuery({ token }, { enabled: Boolean(token && chatOpen), refetchInterval: chatOpen ? 5000 : false });
  const start = trpc.chat.start.useMutation({ onSuccess: () => roomQuery.refetch(), onError: error => toast.error(error.message) });
  const send = trpc.chat.send.useMutation({ onSuccess: () => { setBody(""); roomQuery.refetch(); }, onError: error => toast.error(error.message) });
  const room = roomQuery.data?.room;
  const messages = roomQuery.data?.messages ?? [];

  const actions: Action[] = useMemo(() => [
    { key: "messenger", label: t("แชท Facebook", "Facebook Messenger"), detail: t("ตอบเร็วที่สุด", "Fastest reply"), href: FACEBOOK_MESSENGER_URL, tint: "#0866FF", icon: <MessengerGlyph className="h-5 w-5" /> },
    { key: "line", label: BRAND.contact.lineLabel, detail: t("สอบถามผ่าน Line", "Chat on Line"), href: BRAND.contact.line, tint: "#06C755", icon: <LineGlyph className="h-5 w-5" /> },
    { key: "phone", label: BRAND.contact.phones[0], detail: t("โทรถึงโชว์รูม", "Call the showroom"), href: `tel:${BRAND.contact.phones[0].replace(/\s/g, "")}`, tint: "#8a6a3a", icon: <Phone className="h-5 w-5" strokeWidth={1.7} /> },
  ], [t]);

  const startChat = (event: React.FormEvent) => { event.preventDefault(); start.mutate({ token, name, email }); };
  const sendMessage = (event: React.FormEvent) => { event.preventDefault(); if (body.trim()) send.mutate({ token, body }); };

  return <div className={cn("fixed right-4 bottom-4 z-[70] flex flex-col items-end gap-2.5 transition-opacity duration-200 sm:right-6 sm:bottom-6", hidden ? "pointer-events-none opacity-0" : "opacity-100")}>
    {chatOpen && <div className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-border bg-background shadow-[0_18px_50px_-20px_rgba(28,22,17,0.55)]">
      <div className="flex items-center justify-between bg-brand px-4 py-3 text-brand-foreground"><div><p className="text-sm font-semibold">{t("แชทกับ Fonzo", "Chat with Fonzo")}</p><p className="text-[10px] opacity-80">{t("ฝากข้อความไว้ได้ เราจะตอบกลับในห้องนี้", "Leave a message and we will reply here")}</p></div><button type="button" onClick={() => setChatOpen(false)} aria-label={t("ปิดแชท", "Close chat")}><X className="h-4 w-4" /></button></div>
      {!room ? <form onSubmit={startChat} className="space-y-3 p-4"><p className="text-xs leading-relaxed text-muted-foreground">{t("เริ่มต้นด้วยการกรอกชื่อ เพื่อให้ทีมงานตอบกลับได้ถูกคน", "Start with your name so our team can reply to you personally.")}</p><input required value={name} onChange={event => setName(event.target.value)} placeholder={t("ชื่อของคุณ", "Your name")} className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-brand" /><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={t("อีเมล (ไม่บังคับ)", "Email (optional)")} className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-brand" /><button disabled={start.isPending} className="flex h-10 w-full items-center justify-center bg-brand text-xs font-semibold tracking-wider text-brand-foreground uppercase">{start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("เริ่มแชท", "Start chat")}</button></form> : <><div className="h-64 space-y-3 overflow-y-auto bg-cream/30 p-4">{messages.length === 0 && <p className="pt-20 text-center text-xs text-muted-foreground">{t("พิมพ์ข้อความแรกได้เลยครับ", "Send your first message.")}</p>}{messages.map(message => <div key={message.id} className={cn("max-w-[85%] rounded-sm px-3 py-2 text-sm", message.senderType === "visitor" ? "ml-auto bg-brand text-brand-foreground" : "bg-background text-foreground")}>{message.body}</div>)}</div><form onSubmit={sendMessage} className="flex gap-2 border-t border-border p-3"><input required value={body} onChange={event => setBody(event.target.value)} placeholder={t("พิมพ์ข้อความ...", "Type a message...")} className="min-w-0 flex-1 border border-border px-3 text-sm outline-none focus:border-brand" /><button disabled={send.isPending} type="submit" aria-label={t("ส่งข้อความ", "Send message")} className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand text-brand-foreground"><Send className="h-4 w-4" /></button></form></>}
    </div>}
    <div className={cn("flex flex-col items-end gap-2", open ? "pointer-events-auto" : "pointer-events-none invisible")}>
      <button type="button" onClick={() => setChatOpen(value => !value)} className={cn("press group flex items-center gap-3 border border-border/70 bg-background/97 py-2.5 pr-3 pl-3.5 shadow-[0_10px_30px_-16px_rgba(28,22,17,0.5)]", chatOpen && "border-brand")}><span className="text-right"><span className="block text-[12px] font-medium">{t("แชทกับ Fonzo", "Chat with Fonzo")}</span><span className="block text-[10px] tracking-[0.1em] text-muted-foreground uppercase">{t("คุยผ่านเว็บไซต์", "Chat on site")}</span></span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground"><MessageCircle className="h-5 w-5" /></span></button>
      {actions.map((action, index) => <a key={action.key} href={action.href} target={action.href.startsWith("tel:") ? undefined : "_blank"} rel="noreferrer" style={{ transitionDelay: `${index * 45}ms` }} className="press group flex items-center gap-3 border border-border/70 bg-background/97 py-2.5 pr-3 pl-3.5 shadow-[0_10px_30px_-16px_rgba(28,22,17,0.5)]"><span className="text-right"><span className="block text-[12px] font-medium">{action.label}</span><span className="block text-[10px] tracking-[0.1em] text-muted-foreground uppercase">{action.detail}</span></span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: action.tint }}>{action.icon}</span></a>)}
    </div>
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? t("ปิดเมนูติดต่อ", "Close contact menu") : t("ติดต่อเรา", "Contact us")} className="press relative flex h-13 items-center gap-2.5 rounded-full bg-brand px-4 text-brand-foreground shadow-[0_14px_36px_-14px_rgba(140,26,34,0.75)] transition-transform duration-200 hover:scale-[1.03]"><span className="flex h-7 w-7 items-center justify-center">{open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}</span><span className="hidden text-[11px] font-semibold tracking-[0.16em] uppercase sm:inline">{open ? t("ปิด", "Close") : t("สอบถาม", "Chat")}</span>{!open && <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-brand/40 motion-safe:animate-ping" />}</button>
  </div>;
}
