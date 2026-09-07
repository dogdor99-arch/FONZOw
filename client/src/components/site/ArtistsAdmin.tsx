import { useEffect, useState } from "react";
import { Edit2, Eye, EyeOff, Plus, Save, Trash2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY_FORM = {
  name: "",
  nameEn: "",
  role: "",
  roleEn: "",
  bio: "",
  bioEn: "",
  imageUrl: "",
  collaborationImageUrl: "",
  sourceUrl: "",
  guitar: "",
  sortOrder: "0",
  published: true,
};

type FormState = typeof EMPTY_FORM;

export function ArtistsAdmin() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const { data: artists = [], isLoading } = trpc.artists.listAll.useQuery();
  const create = trpc.artists.create.useMutation();
  const update = trpc.artists.update.useMutation();
  const remove = trpc.artists.remove.useMutation();
  const uploadImage = trpc.artists.uploadImage.useMutation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open && artists.length === 0) setOpen(true);
  }, [artists.length, open]);

  const reset = () => { setForm(EMPTY_FORM); setEditingId(null); setOpen(false); };
  const fill = (artist: (typeof artists)[number]) => {
    setEditingId(artist.id);
    setForm({
      name: artist.name,
      nameEn: artist.nameEn ?? "",
      role: artist.role ?? "",
      roleEn: artist.roleEn ?? "",
      bio: artist.bio ?? "",
      bioEn: artist.bioEn ?? "",
      imageUrl: artist.imageUrl ?? "",
      collaborationImageUrl: artist.collaborationImageUrl ?? "",
      sourceUrl: artist.sourceUrl ?? "",
      guitar: artist.guitar ?? "",
      sortOrder: String(artist.sortOrder),
      published: artist.published,
    });
    setOpen(true);
  };
  const set = (key: keyof FormState, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));
  const uploadLocalImage = async (file: File, key: "imageUrl" | "collaborationImageUrl") => {
    if (file.size > 8 * 1024 * 1024) throw new Error("Image must be smaller than 8MB");
    const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    const result = await uploadImage.mutateAsync({ base64, contentType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif" });
    set(key, result.url);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error(t("กรุณาใส่ชื่อศิลปิน", "Please enter an artist name")); return; }
    const payload = {
      name: form.name.trim(), nameEn: form.nameEn.trim() || null, role: form.role.trim() || null, roleEn: form.roleEn.trim() || null,
      bio: form.bio.trim() || null, bioEn: form.bioEn.trim() || null, imageUrl: form.imageUrl.trim() || null,
      collaborationImageUrl: form.collaborationImageUrl.trim() || null, sourceUrl: form.sourceUrl.trim() || null,
      guitar: form.guitar.trim() || null, sortOrder: Number(form.sortOrder) || 0, published: form.published,
    };
    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      await utils.artists.listAll.invalidate();
      await utils.artists.list.invalidate();
      toast.success(t("บันทึกโปรไฟล์แล้ว", "Artist profile saved"));
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("บันทึกไม่สำเร็จ", "Could not save profile"));
    }
  };

  const destroy = async (id: number) => {
    if (!window.confirm(t("ลบโปรไฟล์ศิลปินนี้หรือไม่", "Delete this artist profile?"))) return;
    try { await remove.mutateAsync({ id }); await utils.artists.listAll.invalidate(); await utils.artists.list.invalidate(); toast.success(t("ลบโปรไฟล์แล้ว", "Artist profile deleted")); }
    catch (error) { toast.error(error instanceof Error ? error.message : t("ลบไม่สำเร็จ", "Could not delete profile")); }
  };

  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5"><div><p className="eyebrow">{t("Artists editorial", "Artists editorial")}</p><h2 className="mt-2 text-2xl">{t("จัดการโปรไฟล์ศิลปิน", "Manage artist profiles")}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("เพิ่มชื่อ ประวัติ รูปศิลปิน รูปร่วมงานกับแบรนด์ และลิงก์ต้นฉบับได้หลายคน หน้าเว็บจะแสดงทีละคนแบบสไลด์", "Add multiple artist profiles, portraits, collaboration images and source links. The public page presents one profile at a time.")}</p></div><Button type="button" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setOpen(true); }} className="press rounded-none bg-brand text-brand-foreground"><Plus className="mr-2 h-4 w-4" />{t("เพิ่มศิลปิน", "Add artist")}</Button></div>

    {open && <div className="border border-brand/40 bg-card p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="eyebrow text-brand">{editingId ? t("แก้ไขโปรไฟล์", "Edit profile") : t("โปรไฟล์ใหม่", "New profile")}</p><h3 className="mt-2 font-display text-2xl">{t("ข้อมูลศิลปินและภาพร่วมงาน", "Artist and collaboration details")}</h3></div><button type="button" onClick={reset} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button></div><div className="mt-7 grid gap-4 md:grid-cols-2">
      <Field label={t("ชื่อศิลปิน", "Artist name")} value={form.name} onChange={value => set("name", value)} required />
      <Field label={t("ชื่อภาษาอังกฤษ", "English name")} value={form.nameEn} onChange={value => set("nameEn", value)} />
      <Field label={t("บทบาท", "Role")} value={form.role} onChange={value => set("role", value)} />
      <Field label={t("บทบาทภาษาอังกฤษ", "English role")} value={form.roleEn} onChange={value => set("roleEn", value)} />
      <div><Field label={t("URL รูปโปรไฟล์", "Portrait image URL")} value={form.imageUrl} onChange={value => set("imageUrl", value)} /><label className="mt-2 inline-flex cursor-pointer items-center text-xs text-brand hover:underline"><Upload className="mr-1 h-3.5 w-3.5" />{t("เลือกภาพจากเครื่อง", "Upload from computer")}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={async event => { try { const file = event.target.files?.[0]; if (file) await uploadLocalImage(file, "imageUrl"); } catch (error) { toast.error(error instanceof Error ? error.message : t("อัปโหลดไม่สำเร็จ", "Upload failed")); } finally { event.target.value = ""; } }} /></label></div>
      <div><Field label={t("URL รูปร่วมงานกับแบรนด์", "Collaboration image URL")} value={form.collaborationImageUrl} onChange={value => set("collaborationImageUrl", value)} /><label className="mt-2 inline-flex cursor-pointer items-center text-xs text-brand hover:underline"><Upload className="mr-1 h-3.5 w-3.5" />{t("เลือกภาพจากเครื่อง", "Upload from computer")}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={async event => { try { const file = event.target.files?.[0]; if (file) await uploadLocalImage(file, "collaborationImageUrl"); } catch (error) { toast.error(error instanceof Error ? error.message : t("อัปโหลดไม่สำเร็จ", "Upload failed")); } finally { event.target.value = ""; } }} /></label></div>
      <Field label={t("ลิงก์โพสต์ต้นฉบับ", "Original source URL")} value={form.sourceUrl} onChange={value => set("sourceUrl", value)} />
      <Field label={t("รุ่นกีต้าที่ร่วมงาน", "Associated guitar")} value={form.guitar} onChange={value => set("guitar", value)} />
      <Field label={t("ลำดับการแสดงผล", "Display order")} value={form.sortOrder} onChange={value => set("sortOrder", value)} type="number" />
      <label className="flex items-center gap-3 pt-7 text-sm"><input type="checkbox" checked={form.published} onChange={event => set("published", event.target.checked)} className="h-4 w-4 accent-brand" />{t("เผยแพร่บนหน้า Artists", "Publish on Artists page")}</label>
      <TextAreaField label={t("ประวัติภาษาไทย", "Thai biography")} value={form.bio} onChange={value => set("bio", value)} />
      <TextAreaField label={t("ประวัติภาษาอังกฤษ", "English biography")} value={form.bioEn} onChange={value => set("bioEn", value)} />
    </div><div className="mt-6 flex flex-wrap gap-3"><Button type="button" onClick={save} disabled={create.isPending || update.isPending} className="press rounded-none bg-brand text-brand-foreground"><Save className="mr-2 h-4 w-4" />{t("บันทึก", "Save")}</Button><Button type="button" variant="outline" onClick={reset} className="press rounded-none">{t("ยกเลิก", "Cancel")}</Button></div></div>}

    <div className="space-y-3">{isLoading ? <div className="h-24 animate-pulse bg-secondary" /> : artists.length === 0 ? <div className="border border-border p-10 text-center text-sm text-muted-foreground">{t("ยังไม่มีข้อมูลจาก Admin ระบบจะแสดงข้อมูลตัวอย่างบนหน้าเว็บจนกว่าจะเพิ่มโปรไฟล์", "No admin profiles yet. The public page will use its fallback examples until you add one.")}</div> : artists.map(artist => <div key={artist.id} className="flex flex-col gap-5 border border-border bg-card p-5 sm:flex-row sm:items-center"><div className="h-24 w-32 shrink-0 overflow-hidden bg-secondary">{artist.imageUrl ? <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h3 className="font-display text-xl">{artist.name}</h3><span className={`inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase ${artist.published ? "text-green-700" : "text-muted-foreground"}`}>{artist.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{artist.published ? t("เผยแพร่", "Published") : t("ซ่อน", "Hidden")}</span></div><p className="mt-1 text-xs text-muted-foreground">{artist.role ?? "Fonzo Artist"} · {t("ลำดับ", "Order")} {artist.sortOrder}</p><p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{artist.bio ?? t("ยังไม่มีประวัติ", "No biography yet")}</p></div><div className="flex shrink-0 gap-2"><Button type="button" variant="outline" onClick={() => fill(artist)} className="press rounded-none"><Edit2 className="mr-2 h-3.5 w-3.5" />{t("แก้ไข", "Edit")}</Button><Button type="button" variant="outline" onClick={() => destroy(artist.id)} className="press rounded-none text-red-600 hover:border-red-300 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></Button></div></div>)}</div>
  </div>;
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <label className="block text-sm"><span className="mb-2 block text-xs tracking-[0.12em] text-muted-foreground uppercase">{label}{required ? " *" : ""}</span><Input type={type} value={value} onChange={event => onChange(event.target.value)} className="h-11 rounded-none" /></label>;
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm"><span className="mb-2 block text-xs tracking-[0.12em] text-muted-foreground uppercase">{label}</span><textarea value={value} onChange={event => onChange(event.target.value)} rows={5} className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand" /></label>;
}
