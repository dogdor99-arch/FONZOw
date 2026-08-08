/**
 * Newsroom management panel (inside the shop console).
 *
 * The shop team pastes a post/listing URL from any channel, adds a headline and
 * optional thumbnail, and it appears in the homepage feed. Editing is inline so
 * reordering and pinning stay one click away.
 */

import { useState } from "react";
import { Loader2, Pin, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CHANNELS } from "@/lib/brand";
import { CHANNEL_TINT, ChannelIcon } from "./ChannelIcon";
import { isEmbeddable } from "./PostEmbed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Platform = (typeof CHANNELS)[number]["key"] | "site";

const PLATFORM_OPTIONS: Platform[] = [
  ...CHANNELS.map(channel => channel.key),
  "site",
];

export function NewsroomAdmin() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const { data: posts = [], isLoading } = trpc.newsroom.listAll.useQuery();
  const { data: tokenStatus } = trpc.social.status.useQuery();
  const [adding, setAdding] = useState(false);

  const invalidate = () => {
    utils.newsroom.listAll.invalidate();
    utils.newsroom.feed.invalidate();
    utils.social.feed.invalidate();
  };

  const create = trpc.newsroom.create.useMutation({
    onSuccess: () => {
      invalidate();
      setAdding(false);
      toast.success(t("เพิ่มคอนเทนต์แล้ว", "Post added"));
    },
    onError: error => toast.error(error.message || t("เพิ่มไม่สำเร็จ", "Could not add")),
  });

  const update = trpc.newsroom.update.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(t("บันทึกแล้ว", "Saved"));
    },
    onError: error => toast.error(error.message || t("บันทึกไม่สำเร็จ", "Could not save")),
  });

  const remove = trpc.newsroom.remove.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(t("ลบแล้ว", "Deleted"));
    },
    onError: error => toast.error(error.message || t("ลบไม่สำเร็จ", "Could not delete")),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t(
            "เพิ่มลิงก์โพสต์หรือสินค้าจาก Shopee, Lazada, Facebook, TikTok, YouTube และ Instagram เพื่อแสดงบนหน้าแรก โพสต์จาก TikTok, Facebook และ YouTube จะแสดงเนื้อหาสดจากแพลตฟอร์มได้ในหน้าเว็บ",
            "Add post or product links from Shopee, Lazada, Facebook, TikTok, YouTube and Instagram to publish them on the homepage. TikTok, Facebook and YouTube posts can render live on the page.",
          )}
        </p>
        <Button
          type="button"
          onClick={() => setAdding(value => !value)}
          className="press h-11 shrink-0 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase hover:bg-brand/90">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.8} />
          {adding ? t("ยกเลิก", "Cancel") : t("เพิ่มคอนเทนต์", "Add post")}
        </Button>
      </div>

      {adding && (
        <PostForm
          pending={create.isPending}
          onSubmit={values => create.mutate(values)}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Connection status: makes it obvious which tier the feed is running on. */}
      {tokenStatus && (
        <div className="mt-6 border border-border bg-cream/40 p-4 sm:p-5">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {t("สถานะการเชื่อมต่อฟีด", "Feed connection status")}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {(
              [
                ["instagram", tokenStatus.instagram],
                ["facebook", tokenStatus.facebook],
                ["tiktok", tokenStatus.tiktok],
              ] as const
            ).map(([platform, connected]) => (
              <span
                key={platform}
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase">
                <span style={{ color: CHANNEL_TINT[platform] }}>
                  <ChannelIcon channel={platform} className="h-3.5 w-3.5" />
                </span>
                <span className="text-foreground/70">{platform}</span>
                <span className={connected ? "text-emerald-700" : "text-muted-foreground"}>
                  {connected
                    ? t("ดึงอัตโนมัติ", "Auto-sync")
                    : t("ดึงจากลิงก์ที่เพิ่ม", "From added links")}
                </span>
              </span>
            ))}
          </div>
          <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
            {t(
              "ขณะนี้ระบบดึงรูปและคำบรรยายสดจากลิงก์ที่เพิ่มไว้ หากต้องการให้ดึงโพสต์ใหม่เองอัตโนมัติ ต้องเชื่อม Access Token ของบัญชี Instagram หรือเพจ Facebook",
              "The feed currently resolves images and captions live from the links you add. To pull new posts automatically, connect an Instagram or Facebook Page access token.",
            )}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-secondary" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="mt-8 border border-dashed border-border bg-cream/40 p-12 text-center text-sm text-muted-foreground">
          {t("ยังไม่มีคอนเทนต์ กด “เพิ่มคอนเทนต์” เพื่อเริ่ม", "No posts yet — use “Add post” to start.")}
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {posts.map(post => (
            <PostRow
              key={post.id}
              post={post}
              pending={update.isPending || remove.isPending}
              onSave={patch => update.mutate({ id: post.id, ...patch })}
              onDelete={() => remove.mutate({ id: post.id })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

type FormValues = {
  platform: Platform;
  title: string;
  titleEn?: string | null;
  excerpt?: string | null;
  url: string;
  imageUrl?: string | null;
  priceLabel?: string | null;
  pinned?: boolean;
  published?: boolean;
};

function PostForm({
  pending,
  onSubmit,
  onCancel,
}: {
  pending: boolean;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [preview, setPreview] = useState<{ image: string | null; source: string } | null>(null);

  const canSubmit = title.trim().length > 0 && /^https?:\/\//.test(url.trim());
  const embeddable = url.trim() ? isEmbeddable(platform, url.trim()) : false;

  /**
   * Pulls the live thumbnail/caption for the pasted URL and pre-fills the form,
   * so adding a post is one paste instead of hand-copying the caption.
   */
  const resolve = trpc.social.preview.useMutation({
    onSuccess: data => {
      setPreview({ image: data.image, source: data.source });
      if (data.platform !== "site") setPlatform(data.platform as Platform);
      if (data.title && !title.trim()) setTitle(data.title);
      if (data.source === "none") {
        toast.warning(
          t(
            "ดึงข้อมูลจากลิงก์นี้ไม่ได้ — กรอกหัวข้อและรูปปกเอง",
            "Could not read this link — fill in the headline and thumbnail manually.",
          ),
        );
      } else {
        toast.success(t("ดึงข้อมูลจากโพสต์แล้ว", "Post details loaded"));
      }
    },
    onError: error =>
      toast.error(error.message || t("ดึงข้อมูลไม่สำเร็จ", "Could not read the link")),
  });

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          platform,
          title: title.trim(),
          titleEn: titleEn.trim() || null,
          excerpt: excerpt.trim() || null,
          url: url.trim(),
          imageUrl: imageUrl.trim() || null,
          priceLabel: priceLabel.trim() || null,
        });
      }}
      className="mt-6 border border-border bg-card p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("แพลตฟอร์ม", "Platform")}>
          <Select value={platform} onValueChange={value => setPlatform(value as Platform)}>
            <SelectTrigger className="h-11 rounded-none border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORM_OPTIONS.map(value => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <span style={{ color: CHANNEL_TINT[value] }}>
                      <ChannelIcon channel={value} className="h-3.5 w-3.5" />
                    </span>
                    {CHANNELS.find(channel => channel.key === value)?.name ??
                      t("เว็บไซต์ Fonzo", "Fonzo site")}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label={t("ลิงก์โพสต์ / สินค้า", "Post or product URL")}
          hint={
            url.trim()
              ? embeddable
                ? t("รองรับการแสดงเนื้อหาสดในหน้าเว็บ", "Supports live embedding on the page")
                : t("จะแสดงเป็นการ์ดพร้อมลิงก์ออกไปยังแพลตฟอร์ม", "Will show as a card linking out")
              : undefined
          }>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                setPreview(null);
              }}
              placeholder="https://"
              className="h-11 rounded-none border-border"
            />
            <Button
              type="button"
              variant="outline"
              disabled={!/^https?:\/\//.test(url.trim()) || resolve.isPending}
              onClick={() => resolve.mutate({ url: url.trim() })}
              title={t("ดึงรูปและคำบรรยายจากโพสต์", "Load image and caption from the post")}
              className="press h-11 shrink-0 rounded-none border-foreground/25 px-4 text-[11px] tracking-[0.14em] uppercase">
              {resolve.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" strokeWidth={1.7} />
              )}
            </Button>
          </div>
        </Field>

        <Field label={t("หัวข้อ (ไทย)", "Headline (Thai)")}>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="h-11 rounded-none border-border"
          />
        </Field>

        <Field label={t("หัวข้อ (อังกฤษ)", "Headline (English)")}>
          <Input
            value={titleEn}
            onChange={e => setTitleEn(e.target.value)}
            className="h-11 rounded-none border-border"
          />
        </Field>

        <Field label={t("รูปปก (URL)", "Thumbnail URL")}>
          <Input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://"
            className="h-11 rounded-none border-border"
          />
        </Field>

        <Field label={t("ราคา (ถ้ามี)", "Price label (optional)")}>
          <Input
            value={priceLabel}
            onChange={e => setPriceLabel(e.target.value)}
            placeholder="฿89,000"
            className="h-11 rounded-none border-border"
          />
        </Field>
      </div>

      <Field label={t("คำบรรยายสั้น", "Short description")} className="mt-4">
        <Textarea
          rows={2}
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          className="rounded-none border-border"
        />
      </Field>

      {preview?.image && (
        <div className="mt-4 flex items-center gap-3 border border-border bg-cream/40 p-3">
          <img src={preview.image} alt="" className="h-20 w-20 shrink-0 object-cover" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t(
              "รูปนี้จะถูกดึงสดจากแพลตฟอร์มทุกครั้งที่มีผู้เข้าชม ไม่ต้องกรอกรูปปกเอง",
              "This image is resolved live from the platform on every visit — no need to fill in a thumbnail.",
            )}
          </p>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <Button
          type="submit"
          disabled={!canSubmit || pending}
          className="press h-11 rounded-none bg-brand px-7 text-[11px] tracking-[0.18em] text-brand-foreground uppercase hover:bg-brand/90">
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" strokeWidth={1.6} />
          )}
          {t("เผยแพร่", "Publish")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="press h-11 rounded-none border-foreground/25 px-6 text-[11px] tracking-[0.18em] uppercase">
          {t("ยกเลิก", "Cancel")}
        </Button>
      </div>
    </form>
  );
}

function PostRow({
  post,
  pending,
  onSave,
  onDelete,
}: {
  post: {
    id: number;
    platform: string;
    title: string;
    titleEn: string | null;
    excerpt: string | null;
    url: string;
    imageUrl: string | null;
    priceLabel: string | null;
    pinned: boolean;
    published: boolean;
    postedAt: Date;
  };
  pending: boolean;
  onSave: (patch: Partial<FormValues>) => void;
  onDelete: () => void;
}) {
  const { t } = useLocale();
  const [title, setTitle] = useState(post.title);
  const [titleEn, setTitleEn] = useState(post.titleEn ?? "");
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [priceLabel, setPriceLabel] = useState(post.priceLabel ?? "");
  const [expanded, setExpanded] = useState(false);

  const dirty =
    title !== post.title ||
    titleEn !== (post.titleEn ?? "") ||
    excerpt !== (post.excerpt ?? "") ||
    priceLabel !== (post.priceLabel ?? "");

  const channelName =
    CHANNELS.find(channel => channel.key === post.platform)?.name ??
    t("เว็บไซต์ Fonzo", "Fonzo site");

  return (
    <li className="border border-border bg-card">
      <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="h-14 w-20 shrink-0 overflow-hidden bg-secondary/70">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              className="flex h-full items-center justify-center"
              style={{ color: CHANNEL_TINT[post.platform] }}>
              <ChannelIcon channel={post.platform} className="h-5 w-5 opacity-40" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase">
            <span style={{ color: CHANNEL_TINT[post.platform] }}>
              <ChannelIcon channel={post.platform} className="h-3.5 w-3.5" />
            </span>
            <span className="text-foreground/70">{channelName}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground normal-case">
              {new Date(post.postedAt).toLocaleDateString()}
            </span>
          </p>
          <p className="mt-1 truncate font-display text-base">{post.title}</p>
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block truncate text-xs text-brand hover:underline">
            {post.url}
          </a>
        </div>

        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            <Pin className="h-3.5 w-3.5" strokeWidth={1.7} />
            <Switch
              checked={post.pinned}
              disabled={pending}
              onCheckedChange={checked => onSave({ pinned: checked })}
            />
          </label>
          <label className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            {t("เผยแพร่", "Live")}
            <Switch
              checked={post.published}
              disabled={pending}
              onCheckedChange={checked => onSave({ published: checked })}
            />
          </label>
          <button
            type="button"
            onClick={() => setExpanded(value => !value)}
            className="press text-[11px] tracking-[0.14em] text-muted-foreground uppercase hover:text-brand">
            {expanded ? t("ปิด", "Close") : t("แก้ไข", "Edit")}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            aria-label={t("ลบ", "Delete")}
            className="press text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/70 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("หัวข้อ (ไทย)", "Headline (Thai)")}>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="h-11 rounded-none border-border"
              />
            </Field>
            <Field label={t("หัวข้อ (อังกฤษ)", "Headline (English)")}>
              <Input
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                className="h-11 rounded-none border-border"
              />
            </Field>
            <Field label={t("ราคา", "Price label")}>
              <Input
                value={priceLabel}
                onChange={e => setPriceLabel(e.target.value)}
                className="h-11 rounded-none border-border"
              />
            </Field>
          </div>
          <Field label={t("คำบรรยายสั้น", "Short description")} className="mt-4">
            <Textarea
              rows={2}
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="rounded-none border-border"
            />
          </Field>
          <Button
            type="button"
            disabled={!dirty || pending}
            onClick={() =>
              onSave({
                title: title.trim(),
                titleEn: titleEn.trim() || null,
                excerpt: excerpt.trim() || null,
                priceLabel: priceLabel.trim() || null,
              })
            }
            className="press mt-5 h-11 rounded-none bg-brand px-7 text-[11px] tracking-[0.18em] text-brand-foreground uppercase hover:bg-brand/90">
            <Save className="mr-2 h-4 w-4" strokeWidth={1.6} />
            {t("บันทึก", "Save")}
          </Button>
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{label}</label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
