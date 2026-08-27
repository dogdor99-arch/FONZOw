import { useState, useEffect } from "react";
import { Loader2, Lock, Package, Plus, RefreshCw, Trash2, Edit2, ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageHeading } from "@/components/site/SiteLayout";
import { NewsroomAdmin } from "@/components/site/NewsroomAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Tab = "stock" | "newsroom";
type SubView = "list" | "add" | "edit";

export default function Admin() {
  const { t } = useLocale();
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("stock");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <>
        <PageHeading eyebrow={t("สำหรับทีมงาน", "Staff only")} title={t("จัดการร้าน", "Shop console")} crumbs={[{ label: t("จัดการร้าน", "Shop console") }]} />
        <section className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <Lock className="mx-auto h-7 w-7 text-brand" strokeWidth={1.4} />
          <p className="mt-5 text-sm text-muted-foreground">{t("กรุณาเข้าสู่ระบบด้วยบัญชีทีมงาน", "Please sign in with a staff account.")}</p>
          <Button type="button" onClick={() => { window.location.href = "/api/oauth/login"; }} className="press mt-6 h-11 rounded-none bg-brand px-8 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
            {t("เข้าสู่ระบบ", "Sign in")}
          </Button>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow={t("สำหรับทีมงาน", "Staff only")}
        title={t("จัดการร้าน", "Shop console")}
        description={t("ระบบจัดการสินค้า สเปคเฉพาะประเภท และคอนเทนต์เว็บไซต์", "Manage products, category-specific specs, and content.")}
        crumbs={[{ label: t("จัดการร้าน", "Shop console") }]}
      />
      <section className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 border-b border-border/70 pb-5">
          {[
            { key: "stock", label: t("จัดการสต็อกและสินค้า", "Products & Inventory") },
            { key: "newsroom", label: t("คอนเทนต์หน้าแรก", "Newsroom") },
          ].map(item => (
            <button key={item.key} type="button" onClick={() => setTab(item.key as Tab)} className={cn("press border px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase", tab === item.key ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand")}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === "stock" && <StockManager />}
          {tab === "newsroom" && <NewsroomAdmin />}
        </div>
      </section>
    </>
  );
}

function StockManager() {
  const { t } = useLocale();
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  
  const [view, setView] = useState<SubView>("list");
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingSupa, setLoadingSupa] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchSupabaseProducts = async () => {
    setLoadingSupa(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (!error) setSupabaseProducts(data || []);
    setLoadingSupa(false);
  };

  useEffect(() => { fetchSupabaseProducts(); }, []);

  // รวมรายการจากแคตตาล็อกหลัก (114 ตัว) และ Supabase เข้าด้วยกัน
  useEffect(() => {
    const formattedCatalog = catalogGuitars.map((g: any, idx: number) => ({
      id: `catalog-${idx}`,
      name: g.name || g.code,
      price: Number(g.price || 0),
      stock: g.stock ?? 10,
      category: g.series || "Catalog Guitar",
      image_url: g.image || "/fonzo-logo.png",
      image_urls: g.images || [g.image || "/fonzo-logo.png"],
      description: g.description || "",
      specs: g.specs || {},
      features: g.features || [],
      isCatalogItem: true,
    }));

    const supaNames = new Set(supabaseProducts.map(p => (p.name || "").toLowerCase().trim()));
    const uniqueCatalog = formattedCatalog.filter(c => !supaNames.has((c.name || "").toLowerCase().trim()));
    
    setAllProducts([...supabaseProducts, ...uniqueCatalog]);
  }, [catalogGuitars, supabaseProducts]);

  const handleDelete = async (id: any, isCatalogItem?: boolean) => {
    if (isCatalogItem) {
      toast.error("ไม่สามารถลบสินค้าจากแคตตาล็อกหลักได้โดยตรง");
      return;
    }
    if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("ลบสินค้าไม่สำเร็จ");
    else {
      toast.success("ลบสินค้าเรียบร้อย");
      fetchSupabaseProducts();
    }
  };

  if (view === "add") {
    return <ProductForm mode="add" onBack={() => { setView("list"); fetchSupabaseProducts(); }} />;
  }

  if (view === "edit" && editingItem) {
    return <ProductForm mode="edit" initialData={editingItem} onBack={() => { setView("list"); fetchSupabaseProducts(); }} />;
  }

  const isLoading = catalogLoading || loadingSupa;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display flex items-center gap-2">
            <Package className="h-5 w-5 text-brand" /> {t("รายการสินค้าทั้งหมด", "All Products")}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">จัดการสต็อก ราคา และเลือกแก้ไขสเปครายตัวได้ครบทุกรุ่น</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setView("add")} className="h-9 rounded-none bg-brand text-brand-foreground text-[11px] tracking-widest uppercase">
            <Plus className="mr-2 h-4 w-4" /> {t("เพิ่มสินค้าใหม่", "Add New Product")}
          </Button>
          <Button onClick={fetchSupabaseProducts} variant="outline" size="sm" className="h-9 rounded-none border-border">
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> {t("รีเฟรช", "Refresh")}
          </Button>
        </div>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">รูปภาพ</th>
              <th className="p-4">ชื่อสินค้า / รุ่น</th>
              <th className="p-4">หมวดหมู่</th>
              <th className="p-4">ราคา (บาท)</th>
              <th className="p-4">สต็อก</th>
              <th className="p-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : allProducts.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">ยังไม่มีสินค้าในระบบ</td></tr>
            ) : (
              allProducts.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-secondary/20">
                  <td className="p-4">
                    <img src={p.image_url || p.image || "/fonzo-logo.png"} alt={p.name} className="h-10 w-10 object-cover border border-border" />
                  </td>
                  <td className="p-4 font-medium text-foreground">{p.name}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 text-[10px] uppercase font-semibold", p.isCatalogItem ? "bg-amber-500/10 text-amber-600" : "bg-brand/10 text-brand")}>
                      {p.category || "Acoustic Guitar"}
                    </span>
                  </td>
                  <td className="p-4 font-bold">฿{Number(p.price || 0).toLocaleString()}</td>
                  <td className="p-4">{p.stock} ตัว</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => { setEditingItem(p); setView("edit"); }} 
                      className="h-8 rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 text-[10px] uppercase"
                    >
                      <Edit2 className="h-3 w-3 mr-1" /> แก้ไขรายละเอียด
                    </Button>
                    {!p.isCatalogItem && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(p.id, p.isCatalogItem)} 
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ฟอร์มกรอกข้อมูลจำเพาะ (รองรับหลายรูปภาพและแยกหมวดหมู่)
function ProductForm({ mode, initialData, onBack }: { mode: "add" | "edit", initialData?: any, onBack: () => void }) {
  const [productType, setProductType] = useState<string>(
    initialData?.category?.toLowerCase().includes("string") || initialData?.category?.toLowerCase().includes("accessory") ? "accessory" : "guitar"
  );
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 10,
    category: initialData?.category || "Fonzo Acoustic",
    description: initialData?.description || "",
    // รองรับหลายรูปภาพ (Array ของ URL)
    image_urls: initialData?.image_urls && initialData.image_urls.length > 0 
      ? initialData.image_urls 
      : [initialData?.image_url || initialData?.image || ""]
  });

  // สเปคกีตาร์
  const [guitarSpecs, setGuitarSpecs] = useState({
    top_wood: initialData?.specs?.["TOP WOOD"] || initialData?.specs?.["Top Wood"] || "",
    back_sides: initialData?.specs?.["BACK & SIDES"] || initialData?.specs?.["Back & Sides"] || "",
    neck: initialData?.specs?.["NECK"] || initialData?.specs?.["Neck"] || "",
    fingerboard: initialData?.specs?.["FINGERBOARD"] || initialData?.specs?.["Fingerboard"] || "",
    scale_length: initialData?.specs?.["SCALE LENGTH"] || initialData?.specs?.["Scale Length"] || "",
    nut_width: initialData?.specs?.["NUT WIDTH"] || initialData?.specs?.["Nut Width"] || "",
    bridge: initialData?.specs?.["BRIDGE"] || initialData?.specs?.["Bridge"] || "",
    finish: initialData?.specs?.["FINISH"] || initialData?.specs?.["Finish"] || "",
  });

  // สเปคอุปกรณ์เสริม / สายกีตาร์
  const [accessorySpecs, setAccessorySpecs] = useState({
    string_gauge: initialData?.specs?.["String Gauge"] || initialData?.specs?.["เบอร์สาย"] || "",
    material: initialData?.specs?.["Material"] || initialData?.specs?.["ชนิดสาย"] || "",
    brand: initialData?.specs?.["Brand"] || initialData?.specs?.["ยี่ห้อ"] || "",
    type: initialData?.specs?.["Type"] || initialData?.specs?.["ประเภท"] || "",
  });

  const [saving, setSaving] = useState(false);

  const handleAddImageUrl = () => {
    setFormData({ ...formData, image_urls: [...formData.image_urls, ""] });
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.image_urls];
    updatedImages[index] = value;
    setFormData({ ...formData, image_urls: updatedImages });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = formData.image_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, image_urls: updatedImages.length > 0 ? updatedImages : [""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("กรุณากรอกชื่อสินค้า");

    setSaving(true);
    try {
      const validImages = formData.image_urls.filter(url => url.trim() !== "");
      const primaryImage = validImages.length > 0 ? validImages[0] : "/fonzo-logo.png";

      let specs = {};
      if (productType === "guitar") {
        specs = {
          "TOP WOOD": guitarSpecs.top_wood,
          "BACK & SIDES": guitarSpecs.back_sides,
          "NECK": guitarSpecs.neck,
          "FINGERBOARD": guitarSpecs.fingerboard,
          "SCALE LENGTH": guitarSpecs.scale_length,
          "NUT WIDTH": guitarSpecs.nut_width,
          "BRIDGE": guitarSpecs.bridge,
          "FINISH": guitarSpecs.finish
        };
      } else {
        specs = {
          "String Gauge": accessorySpecs.string_gauge,
          "Material": accessorySpecs.material,
          "Brand": accessorySpecs.brand,
          "Type": accessorySpecs.type
        };
      }

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        description: formData.description,
        image_url: primaryImage,
        image_urls: validImages,
        specs: specs
      };

      let error = null;
      // ถ้าเป็นการแก้ไขสินค้าจากแคตตาล็อกหลัก ให้บันทึกเป็นสินค้าใหม่ใน Supabase (Upsert โดยอิงจากชื่อ)
      const { error: upsertError } = await supabase.from("products").upsert({
        id: initialData && !initialData.isCatalogItem ? initialData.id : undefined,
        ...payload
      }, { onConflict: "name" });

      error = upsertError;

      if (error) throw error;
      toast.success(mode === "edit" ? "บันทึกข้อมูลสำเร็จ!" : "เพิ่มสินค้าสำเร็จ!");
      onBack();
    } catch (err: any) {
      toast.error("บันทึกไม่สำเร็จ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-card border border-border p-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button type="button" onClick={onBack} className="inline-flex items-center text-xs tracking-widest uppercase text-muted-foreground hover:text-brand">
          <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปหน้าตารางสินค้า
        </button>
        <h2 className="text-lg font-display">{mode === "edit" ? `แก้ไขข้อมูล: ${initialData.name}` : "เพิ่มสินค้าใหม่ลงในระบบ"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* เลือกประเภทสินค้า */}
        <div className="p-4 bg-secondary/30 border border-border space-y-2">
          <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase font-semibold">ประเภทสินค้า (กำหนดฟอร์มสเปคเฉพาะด้าน)</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-xs cursor-pointer font-medium">
              <input type="radio" name="pType" checked={productType === "guitar"} onChange={() => { setProductType("guitar"); setFormData({...formData, category: "Fonzo Acoustic"}); }} />
              กีตาร์ (Guitars)
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer font-medium">
              <input type="radio" name="pType" checked={productType === "accessory"} onChange={() => { setProductType("accessory"); setFormData({...formData, category: "Accessories & Strings"}); }} />
              สายกีตาร์และอุปกรณ์เสริม (Strings & Accessories)
            </label>
          </div>
        </div>

        {/* ข้อมูลพื้นฐาน */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">ชื่อสินค้า / รุ่น</label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Fonzo F-30 Custom" className="mt-1 h-10 rounded-none border-border" required />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">หมวดหมู่ย่อย</label>
            <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Master Series" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">ราคา (บาท)</label>
            <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} placeholder="0" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">จำนวนสต็อก</label>
            <Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} placeholder="10" className="mt-1 h-10 rounded-none border-border" />
          </div>
        </div>

        {/* จัดการรูปภาพหลายมุม (Multiple Images) */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand" /> รูปภาพสินค้าจากหลายมุม (Image URLs)
            </label>
            <Button type="button" onClick={handleAddImageUrl} variant="outline" size="sm" className="h-8 rounded-none text-xs border-brand text-brand">
              + เพิ่มช่องใส่รูป
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">รูปแรกจะเป็นรูปหลักหน้าปกสินค้า รูปถัดไปจะเป็นมุมมองเสริม</p>
          
          <div className="space-y-2">
            {formData.image_urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  value={url} 
                  onChange={(e) => handleImageChange(index, e.target.value)} 
                  placeholder={`https://... (รูปที่ ${index + 1})`} 
                  className="h-9 rounded-none border-border flex-1" 
                />
                {formData.image_urls.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveImage(index)} className="text-red-500 h-9 px-3">
                    ลบ
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">รายละเอียด / ประวัติความเป็นมา</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} placeholder="รายละเอียดสเปครวม..." className="w-full mt-1 p-3 text-xs bg-transparent border border-border rounded-none focus:outline-none focus:border-brand" />
        </div>

        {/* ฟอร์มสเปคแยกตามประเภท */}
        {productType === "guitar" ? (
          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest font-semibold text-brand">สเปคชิ้นส่วนและชนิดไม้ (Guitar Specifications)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Top Wood (ไม้หน้า)</label>
                <Input value={guitarSpecs.top_wood} onChange={(e) => setGuitarSpecs({...guitarSpecs, top_wood: e.target.value})} placeholder="Solid Engelmann Spruce" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Back & Sides (ไม้ข้างและหลัง)</label>
                <Input value={guitarSpecs.back_sides} onChange={(e) => setGuitarSpecs({...guitarSpecs, back_sides: e.target.value})} placeholder="Solid Indian Rosewood" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Neck (คอกีตาร์)</label>
                <Input value={guitarSpecs.neck} onChange={(e) => setGuitarSpecs({...guitarSpecs, neck: e.target.value})} placeholder="Mahogany" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Fingerboard (ฟิงเกอร์บอร์ด)</label>
                <Input value={guitarSpecs.fingerboard} onChange={(e) => setGuitarSpecs({...guitarSpecs, fingerboard: e.target.value})} placeholder="Ebony" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Scale Length (สเกล)</label>
                <Input value={guitarSpecs.scale_length} onChange={(e) => setGuitarSpecs({...guitarSpecs, scale_length: e.target.value})} placeholder="650 mm" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Nut Width (ความกว้างนัท)</label>
                <Input value={guitarSpecs.nut_width} onChange={(e) => setGuitarSpecs({...guitarSpecs, nut_width: e.target.value})} placeholder="52 mm" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Bridge (สะพานสาย)</label>
                <Input value={guitarSpecs.bridge} onChange={(e) => setGuitarSpecs({...guitarSpecs, bridge: e.target.value})} placeholder="Ebony" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Finish (เคลือบผิว)</label>
                <Input value={guitarSpecs.finish} onChange={(e) => setGuitarSpecs({...guitarSpecs, finish: e.target.value})} placeholder="High Gloss Nitrocellulose" className="mt-1 h-9 rounded-none border-border" />
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest font-semibold text-brand">สเปคสายกีตาร์และอุปกรณ์เสริม (Strings & Accessories Specs)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">String Gauge (เบอร์สาย)</label>
                <Input value={accessorySpecs.string_gauge} onChange={(e) => setAccessorySpecs({...accessorySpecs, string_gauge: e.target.value})} placeholder="12-53 (Light)" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Material (วัสดุ / ชนิดสาย)</label>
                <Input value={accessorySpecs.material} onChange={(e) => setAccessorySpecs({...accessorySpecs, material: e.target.value})} placeholder="Phosphor Bronze / Nylon" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Brand (ยี่ห้อ)</label>
                <Input value={accessorySpecs.brand} onChange={(e) => setAccessorySpecs({...accessorySpecs, brand: e.target.value})} placeholder="Fonzo / D'Addario" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Type (ประเภทอุปกรณ์)</label>
                <Input value={accessorySpecs.type} onChange={(e) => setAccessorySpecs({...accessorySpecs, type: e.target.value})} placeholder="Acoustic Guitar Strings" className="mt-1 h-9 rounded-none border-border" />
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-border flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="rounded-none h-11 px-6">
            ยกเลิก
          </Button>
          <Button type="submit" disabled={saving} className="press h-11 rounded-none bg-brand px-8 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            บันทึกข้อมูลสินค้า
          </Button>
        </div>
      </form>
    </div>
  );
}