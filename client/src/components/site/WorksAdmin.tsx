import { useEffect, useMemo, useState } from "react";
import { Edit2, Eye, EyeOff, ImagePlus, Loader2, Plus, Save, Trash2, Users, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";

const EMPTY_FORM = {
  kind: "event" as "event" | "student",
  title: "",
  titleEn: "",
  eventDate: "",
  description: "",
  descriptionEn: "",
  imageUrl: "",
  imageUrls: [] as string[],
  sourceUrl: "",
  published: true,
  sortOrder: "0",
};

type FormState = typeof EMPTY_FORM;

export function WorksAdmin() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.works.listAll.useQuery();
  const create = trpc.works.create.useMutation();
  const update = trpc.works.update.useMutation();
  const remove = trpc.works.remove.useMutation();
  const uploadImage = trpc.works.uploadImage.useMutation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const events = useMemo(() => items.filter(item => item.kind === "event"), [items]);
  const students = useMemo(() => items.filter(item => item.kind === "student"), [items]);

  useEffect(() => {
    if (!open && items.length === 0) setOpen(true);
  }, [items.length, open]);

  const reset = () => { setForm(EMPTY_FORM); setEditingId(null); setOpen(false); };
  const fill = (item: (typeof items)[number]) => {
    setEditingId(item.id);
    setForm({
      kind: item.kind,
      title: item.title,
      titleEn: item.titleEn ?? "",
      eventDate: item.eventDate ?? "",
      description: item.description ?? "",
      descriptionEn: item.descriptionEn ?? "",
      imageUrl: item.imageUrl ?? item.imageUrls?.[0] ?? "",
      imageUrls: item.imageUrls ?? [],
      sourceUrl: item.sourceUrl ?? "",
      published: item.published,
      sortOrder: String(item.sortOrder),
    });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const set = (key: keyof FormState, value: string | boolean | string[]) => setForm(current => ({ ...current, [key]: value }));
  const uploadFile = async (file: File, target: "main" | "gallery") => {
    if (file.size > 8 * 1024 * 1024) throw new Error("Image must be smaller than 8MB");
    const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    const result = await uploadImage.mutateAsync({ base64, contentType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif" });
    if (target === "main") set("imageUrl", result.url);
    else setForm(current => ({ ...current, imageUrls: [...current.imageUrls, result.url] }));
  };
  const save = async () => {
    if (!form.title.trim()) { toast.error(t("กรุณาใส่ชื่อ Event หรือชื่อนักเรียน", "Please enter a title")); return; }
    const payload = { kind: form.kind, title: form.title.trim(), titleEn: form.titleEn.trim() || null, eventDate: form.eventDate.trim() || null, description: form.description.trim() || null, descriptionEn: form.descriptionEn.trim() || null, imageUrl: form.imageUrl || null, imageUrls: form.imageUrls, sourceUrl: form.sourceUrl.trim() || null, published: form.published, sortOrder: Number(form.sortOrder) || 0 };
    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload }); else await create.mutateAsync(payload);
      await utils.works.listAll.invalidate(); await utils.works.list.invalidate();
      toast.success(t("บันทึกข้อมูลแล้ว", "Work saved")); reset();
    } catch (error) { toast.error(error instanceof Error ? error.message : t("บันทึกไม่สำเร็จ", "Could not save")); }
  };
  const destroy = async (id: number) => {
    if (!window.confirm(t("ลบรายการนี้หรือไม่?", "Delete this item?"))) return;
    try { await remove.mutateAsync({ id }); await utils.works.listAll.invalidate(); await utils.works.list.invalidate(); toast.success(t("ลบข้อมูลแล้ว", "Item deleted")); if (editingId === id) reset(); }
    catch (error) { toast.error(error instanceof Error ? error.message : t("ลบไม่สำเร็จ", "Could not delete")); }
  };
  const fileInput = (target: "main" | "gallery", multiple = false) => <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={multiple} className="hidden" onChange={async event => { try { for (const file of Array.from(event.target.files ?? [])) await uploadFile(file, target); } catch (error) { toast.error(error instanceof Error ? error.message : t("อัปโหลดไม่สำเร็จ", "Upload failed")); } finally { event.target.value = ""; } }} />;

  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5"><div><p className="eyebrow">Works editorial</p><h2 className="mt-2 text-2xl">{t("จัดการ Event และ Student", "Manage events and students")}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("เพิ่มและแก้ไขผลงานกิจกรรมกับข้อมูลนักเรียน พร้อมอัปโหลดภาพจากเครื่อง", "Add and edit events and student stories with image uploads.")}</p></div><Button type="button" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setOpen(true); }} className="press rounded-none bg-brand text-brand-foreground"><Plus className="mr-2 h-4 w-4" />{t("เพิ่มรายการ", "Add item")}</Button></div>
    {open && <div className="border border-brand/40 bg-card p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="eyebrow text-brand">{editingId ? t("แก้ไขรายการ", "Edit item") : t("รายการใหม่", "New item")}</p><h3 className="mt-2 font-display text-2xl">{form.kind === "event" ? t("ข้อมูล Event", "Event details") : t("ข้อมูล Student", "Student details")}</h3></div><button type="button" onClick={reset} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button></div>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <label className="block text-sm"><span className="mb-2 block text-xs tracking-[0.12em] text-muted-foreground uppercase">{t("ประเภท", "Type")}</span><select value={form.kind} onChange={event => set("kind", event.target.value as FormState["kind"])} className="h-11 w-full border border-input bg-background px-3 text-sm"><option value="event">Event / ผลงานกิจกรรม</option><option value="student">Student / นักเรียนคุณเบิร์ด</option></select></label>
        <Field label={t("วันที่หรือปีจัดงาน", "Date or year")} value={form.eventDate} onChange={value => set("eventDate", value)} />
        <Field label={t("ชื่อภาษาไทย", "Thai title")} value={form.title} onChange={value => set("title", value)} required />
        <Field label={t("ชื่อภาษาอังกฤษ", "English title")} value={form.titleEn} onChange={value => set("titleEn", value)} />
        <TextAreaField label={t("คำบรรยาย", "Description")} value={form.description} onChange={value => set("description", value)} />
        <TextAreaField label="Description (English)" value={form.descriptionEn} onChange={value => set("descriptionEn", value)} />
        <Field label={t("ลิงก์ต้นฉบับ", "Source URL")} value={form.sourceUrl} onChange={value => set("sourceUrl", value)} />
        <Field label={t("ลำดับการแสดงผล", "Display order")} value={form.sortOrder} onChange={value => set("sortOrder", value)} type="number" />
        <div className="md:col-span-2"><p className="mb-2 flex items-center gap-2 text-xs tracking-[0.12em] text-muted-foreground uppercase"><ImagePlus className="h-4 w-4 text-brand" />{t("ภาพหลัก", "Main image")}</p><div className="flex items-start gap-4">{form.imageUrl ? <div className="relative h-28 w-40 overflow-hidden bg-secondary"><img src={form.imageUrl} alt="Main preview" className="h-full w-full object-cover" /><button type="button" onClick={() => set("imageUrl", "")} className="absolute right-1 top-1 bg-ink/75 px-1.5 text-xs text-white">×</button></div> : <div className="flex h-28 w-40 items-center justify-center border border-dashed border-border text-xs text-muted-foreground">{t("ยังไม่มีภาพ", "No image")}</div>}<label className="inline-flex cursor-pointer items-center text-xs text-brand hover:underline"><Upload className="mr-1 h-3.5 w-3.5" />{t("เลือกภาพจากเครื่อง", "Upload from computer")}{fileInput("main")}</label></div></div>
        <div className="md:col-span-2"><p className="mb-2 text-xs tracking-[0.12em] text-muted-foreground uppercase">{t("ภาพประกอบ", "Supporting images")}</p><label className="inline-flex cursor-pointer items-center text-xs text-brand hover:underline"><Upload className="mr-1 h-3.5 w-3.5" />{t("เพิ่มภาพประกอบจากเครื่อง", "Add supporting images")}{fileInput("gallery", true)}</label><div className="mt-3 flex gap-2 overflow-x-auto">{form.imageUrls.map((url, index) => <div key={`${url}-${index}`} className="relative h-20 w-28 shrink-0 overflow-hidden bg-secondary"><img src={url} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => setForm(current => ({ ...current, imageUrls: current.imageUrls.filter((_, itemIndex) => itemIndex !== index) }))} className="absolute right-1 top-1 bg-ink/75 px-1.5 text-xs text-white">×</button></div>)}</div></div>
        <label className="flex items-center gap-3 pt-2 text-sm"><input type="checkbox" checked={form.published} onChange={event => set("published", event.target.checked)} className="h-4 w-4 accent-brand" />{t("เผยแพร่บนหน้า Works", "Publish on Works page")}</label>
      </div><div className="mt-6 flex flex-wrap gap-3"><Button type="button" onClick={save} disabled={create.isPending || update.isPending} className="press rounded-none bg-brand text-brand-foreground"><Save className="mr-2 h-4 w-4" />{t("บันทึก", "Save")}</Button><Button type="button" variant="outline" onClick={reset} className="press rounded-none">{t("ยกเลิก", "Cancel")}</Button></div></div>}
    <section className="space-y-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-brand" /><h2 className="font-display text-xl">{t("รายการที่มีอยู่", "Existing items")}</h2></div>{isLoading ? <Loader2 className="h-5 w-5 animate-spin text-brand" /> : items.length === 0 ? <div className="border border-border p-10 text-center text-sm text-muted-foreground">{t("ยังไม่มีรายการ กดเพิ่มรายการเพื่อเริ่มต้น", "No items yet. Add one to get started.")}</div> : <div className="space-y-3">{[...events, ...students].map(item => <div key={item.id} className="flex flex-col gap-5 border border-border bg-card p-5 sm:flex-row sm:items-center"><div className="h-24 w-32 shrink-0 overflow-hidden bg-secondary">{(item.imageUrl || item.imageUrls?.[0]) ? <img src={item.imageUrl || item.imageUrls?.[0]} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h3 className="font-display text-xl">{item.title}</h3><span className={`inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase ${item.published ? "text-green-700" : "text-muted-foreground"}`}>{item.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{item.published ? t("เผยแพร่", "Published") : t("ซ่อน", "Hidden")}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.kind === "event" ? "Event" : "Student"} · {item.eventDate || t("ไม่มีวันที่", "No date")} · {item.imageUrls?.length || 0} {t("ภาพประกอบ", "supporting images")}</p><p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.description ?? t("ยังไม่มีคำบรรยาย", "No description yet")}</p></div><div className="flex shrink-0 gap-2"><Button type="button" variant="outline" onClick={() => fill(item)} className="press rounded-none"><Edit2 className="mr-2 h-3.5 w-3.5" />{t("แก้ไข", "Edit")}</Button><Button type="button" variant="outline" onClick={() => destroy(item.id)} className="press rounded-none text-red-600 hover:border-red-300 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></Button></div></div>)}</div>}</section>
  </div>;
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) { return <label className="block text-sm"><span className="mb-2 block text-xs tracking-[0.12em] text-muted-foreground uppercase">{label}{required ? " *" : ""}</span><Input type={type} value={value} onChange={event => onChange(event.target.value)} className="h-11 rounded-none" required={required} /></label>; }
function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm"><span className="mb-2 block text-xs tracking-[0.12em] text-muted-foreground uppercase">{label}</span><textarea value={value} onChange={event => onChange(event.target.value)} rows={4} className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand" /></label>; }
