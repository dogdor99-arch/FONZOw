import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ImagePlus, Loader2, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PageHeading } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_IMAGES = 6;
const MAX_FILE_BYTES = 4 * 1024 * 1024;

export default function MarketplaceNew() {
  const { t } = useLocale();
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const fileInput = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    title: "",
    description: "",
    intent: "sell" as "sell" | "trade" | "both",
    condition: "excellent" as "new" | "mint" | "excellent" | "good" | "fair",
    brand: "",
    model: "",
    year: "",
    price: "",
    location: "",
    contactLine: "",
    contactPhone: "",
  });
  const [images, setImages] = useState<string[]>([]);

  const create = trpc.marketplace.create.useMutation({
    onSuccess: result => {
      utils.marketplace.list.invalidate();
      utils.marketplace.mine.invalidate();
      toast.success(t("ลงประกาศเรียบร้อยแล้ว", "Your listing is live"));
      navigate(`/marketplace/${result.id}`);
    },
    onError: error => {
      toast.error(error.message || t("ลงประกาศไม่สำเร็จ", "Could not publish listing"));
    },
  });

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
          title={t("ลงประกาศขาย / แลกเปลี่ยน", "Create a listing")}
          crumbs={[
            { label: t("ซื้อขายแลกเปลี่ยน", "Marketplace"), href: "/marketplace" },
            { label: t("ลงประกาศ", "New listing") },
          ]}
        />
        <section className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
          <Lock className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.3} />
          <p className="mt-5 font-display text-xl">{t("ต้องเข้าสู่ระบบก่อน", "Sign in required")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "เพื่อความปลอดภัยของผู้ซื้อและผู้ขาย ประกาศทุกรายการต้องผูกกับบัญชีสมาชิก",
              "For everyone's safety, every listing must be attached to a member account.",
            )}
          </p>
          <Button
            onClick={() => startLogin()}
            className="press mt-7 h-11 rounded-none bg-brand px-7 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
            {t("เข้าสู่ระบบ", "Sign in")}
          </Button>
        </section>
      </>
    );
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach(file => {
        if (file.size > MAX_FILE_BYTES) {
          toast.error(t("ไฟล์ใหญ่เกิน 4MB", "Files must be under 4MB"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setImages(prev => (prev.length < MAX_IMAGES ? [...prev, reader.result as string] : prev));
          }
        };
        reader.readAsDataURL(file);
      });
  };

  return (
    <>
      <PageHeading
        eyebrow={t("ชุมชนคนรักกีตาร์", "Fonzo community")}
        title={t("ลงประกาศขาย / แลกเปลี่ยน", "Create a listing")}
        description={t(
          "กรอกรายละเอียดกีตาร์ของคุณให้ครบถ้วน ยิ่งมีข้อมูลและรูปภาพชัดเจน ยิ่งขายได้เร็ว",
          "Describe your instrument fully — clear details and photos sell faster.",
        )}
        crumbs={[
          { label: t("ซื้อขายแลกเปลี่ยน", "Marketplace"), href: "/marketplace" },
          { label: t("ลงประกาศ", "New listing") },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <form
          onSubmit={event => {
            event.preventDefault();
            create.mutate({
              title: form.title,
              description: form.description,
              intent: form.intent,
              condition: form.condition,
              brand: form.brand || undefined,
              model: form.model || undefined,
              year: form.year ? Number(form.year) : undefined,
              price: form.price ? Number(form.price) : undefined,
              location: form.location || undefined,
              contactLine: form.contactLine || undefined,
              contactPhone: form.contactPhone || undefined,
              images: images.length > 0 ? images : undefined,
            });
          }}
          className="space-y-8 border border-border bg-card p-7 sm:p-9">
          <div>
            <label htmlFor="title" className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              {t("หัวข้อประกาศ", "Listing title")} *
            </label>
            <Input
              id="title"
              required
              minLength={3}
              maxLength={200}
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t("เช่น Fonzo Classic ปี 2021 สภาพสวย", "e.g. Fonzo Classic 2021, excellent condition")}
              className="mt-2 h-11 rounded-none border-border"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("ประเภทประกาศ", "Listing type")}
              </label>
              <Select
                value={form.intent}
                onValueChange={value => setForm(prev => ({ ...prev, intent: value as typeof prev.intent }))}>
                <SelectTrigger className="mt-2 h-11 rounded-none border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">{t("ขาย", "For sale")}</SelectItem>
                  <SelectItem value="trade">{t("แลกเปลี่ยน", "For trade")}</SelectItem>
                  <SelectItem value="both">{t("ขายหรือแลกเปลี่ยน", "Sale or trade")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("สภาพสินค้า", "Condition")}
              </label>
              <Select
                value={form.condition}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, condition: value as typeof prev.condition }))
                }>
                <SelectTrigger className="mt-2 h-11 rounded-none border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t("ใหม่", "New")}</SelectItem>
                  <SelectItem value="mint">{t("เหมือนใหม่", "Mint")}</SelectItem>
                  <SelectItem value="excellent">{t("ดีเยี่ยม", "Excellent")}</SelectItem>
                  <SelectItem value="good">{t("ดี", "Good")}</SelectItem>
                  <SelectItem value="fair">{t("พอใช้", "Fair")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="brand" className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("ยี่ห้อ", "Brand")}
              </label>
              <Input
                id="brand"
                value={form.brand}
                onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))}
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
            <div>
              <label htmlFor="model" className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("รุ่น", "Model")}
              </label>
              <Input
                id="model"
                value={form.model}
                onChange={e => setForm(prev => ({ ...prev, model: e.target.value }))}
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
            <div>
              <label htmlFor="year" className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("ปีที่ผลิต", "Year")}
              </label>
              <Input
                id="year"
                type="number"
                min={1900}
                max={2100}
                value={form.year}
                onChange={e => setForm(prev => ({ ...prev, year: e.target.value }))}
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("ราคา (บาท)", "Price (THB)")}
              </label>
              <Input
                id="price"
                type="number"
                min={0}
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder={t("เว้นว่างหากแลกเปลี่ยนเท่านั้น", "Leave blank for trade only")}
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("จังหวัด / พื้นที่", "Location")}
              </label>
              <Input
                id="location"
                value={form.location}
                onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder={t("เช่น กรุงเทพฯ", "e.g. Bangkok")}
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              {t("รายละเอียด", "Description")} *
            </label>
            <Textarea
              id="description"
              required
              minLength={10}
              maxLength={5000}
              rows={7}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t(
                "อธิบายสภาพ ไม้ที่ใช้ ประวัติการซ่อม อุปกรณ์ที่แถม และเหตุผลที่ปล่อยต่อ",
                "Describe the condition, tonewoods, repair history, included accessories and why you are selling.",
              )}
              className="mt-2 rounded-none border-border"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contactLine"
                className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("Line ID", "Line ID")}
              </label>
              <Input
                id="contactLine"
                value={form.contactLine}
                onChange={e => setForm(prev => ({ ...prev, contactLine: e.target.value }))}
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
            <div>
              <label
                htmlFor="contactPhone"
                className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t("เบอร์โทรศัพท์", "Phone")}
              </label>
              <Input
                id="contactPhone"
                value={form.contactPhone}
                onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="mt-2 h-11 rounded-none border-border"
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              {t(`รูปภาพ (สูงสุด ${MAX_IMAGES} รูป)`, `Photos (up to ${MAX_IMAGES})`)}
            </label>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden border border-border">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    aria-label={t("ลบรูป", "Remove photo")}
                    className="press absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-ink/80 text-cream">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="press flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-border text-muted-foreground hover:border-brand/50 hover:text-brand">
                  <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
                  <span className="text-[10px] tracking-[0.14em] uppercase">{t("เพิ่มรูป", "Add")}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={e => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-7">
            <Button
              type="submit"
              disabled={create.isPending}
              className="press h-12 rounded-none bg-brand px-9 text-[11px] tracking-[0.2em] text-brand-foreground uppercase hover:bg-brand/90">
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("เผยแพร่ประกาศ", "Publish listing")}
            </Button>
            <Button
              asChild
              variant="outline"
              className="press h-12 rounded-none border-foreground/25 px-6 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand">
              <Link href="/marketplace">{t("ยกเลิก", "Cancel")}</Link>
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
