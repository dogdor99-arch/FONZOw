import { useState, useEffect, useMemo } from "react";
import { Loader2, Lock, Package, Plus, RefreshCw, Trash2, Database, Save } from "lucide-react";
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

interface Product {
  id?: number | string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  description?: string;
  isCatalogItem?: boolean;
}

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
        description={t("จัดการข้อมูลสินค้า ราคา สต็อก และรายละเอียดทั้งหมดบนเว็บไซต์", "Manage all product data, prices, stock, and details.")}
        crumbs={[{ label: t("จัดการร้าน", "Shop console") }]}
      />
      <section className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 border-b border-border/70 pb-5">
          {[
            { key: "stock", label: t("จัดการสต็อกและสินค้าทั้งหมด", "All Products & Inventory") },
            { key: "newsroom", label: t("คอนเทนต์หน้าแรก", "Newsroom") },
          ].map(item => (
            <button key={item.key} type="button" onClick={() => setTab(item.key as Tab)} className={cn("press border px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase", tab === item.key ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand")}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === "stock" && <StockPanel />}
          {tab === "newsroom" && <NewsroomAdmin />}
        </div>
      </section>
    </>
  );
}

function StockPanel() {
  const { t } = useLocale();
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  
  const [supabaseProducts, setSupabaseProducts] = useState<Product[]>([]);
  const [loadingSupa, setLoadingSupa] = useState(true);
  const [importing, setImporting] = useState(false);

  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    price: 0,
    stock: 10,
    category: "Fonzo Acoustic",
    image_url: "",
    description: ""
  });

  const fetchSupabaseProducts = async () => {
    setLoadingSupa(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) toast.error(t("ดึงข้อมูลไม่สำเร็จ: ", "Fetch failed: ") + error.message);
    else setSupabaseProducts(data || []);
    setLoadingSupa(false);
  };

  useEffect(() => { fetchSupabaseProducts(); }, []);

  // รวมสินค้าจากแคตตาล็อก 114 ตัว และ Supabase เข้าด้วยกันในตาราง Admin
  const allProducts = useMemo(() => {
    const formattedCatalog = catalogGuitars.map((g: any, idx: number) => ({
      id: `catalog-${idx}`,
      name: g.name || g.code,
      price: Number(g.price || 0),
      stock: g.stock ?? 10,
      category: g.series || "Catalog Guitar",
      image_url: g.image || "/fonzo-logo.png",
      description: g.description || "",
      isCatalogItem: true,
    }));

    const supaNames = new Set(supabaseProducts.map(p => p.name.toLowerCase().trim()));
    const uniqueCatalog = formattedCatalog.filter(c => !supaNames.has(c.name.toLowerCase().trim()));

    return [...supabaseProducts, ...uniqueCatalog];
  }, [catalogGuitars, supabaseProducts]);

  const handleImportCatalog = async () => {
    if (!confirm(t("ต้องการซิงค์สินค้าทั้งหมดเข้าสู่ฐานข้อมูลเพื่อให้สามารถแก้ไขข้อมูลได้ทั้งหมดใช่หรือไม่?", "Sync all catalog items to database for editing?"))) return;
    setImporting(true);
    try {
      const itemsToInsert = catalogGuitars.map((g: any) => ({
        name: g.name || g.code,
        price: Number(g.price || 0),
        stock: g.stock ?? 10,
        category: g.series || "Fonzo Custom",
        image_url: g.image || "/fonzo-logo.png",
        description: g.description || "กีตาร์คุณภาพสูงจาก Fonzo Guitar"
      }));

      const { error } = await supabase.from("products").upsert(itemsToInsert, { onConflict: "name" });
      if (error) throw error;

      toast.success(t("ซิงค์ข้อมูลสำเร็จ!", "Catalog imported successfully!"));
      fetchSupabaseProducts();
    } catch (err: any) {
      toast.error(t("ซิงค์ไม่สำเร็จ: ", "Import failed: ") + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleSaveRow = async (product: Product) => {
    if (product.isCatalogItem) {
      toast.error(t("กรุณากดปุ่ม 'ซิงค์สินค้าทั้งหมดเข้าฐานข้อมูล' ด้านบนก่อนแก้ไข", "Please click 'Sync Catalog to DB' above before editing catalog items."));
      return;
    }
    if (!product.id) return;
    
    const { error } = await supabase.from("products").update({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock
    }).eq("id", product.id);

    if (error) {
      toast.error(t("บันทึกไม่สำเร็จ", "Save failed"));
    } else {
      toast.success(t("บันทึกข้อมูลเรียบร้อย", "Saved successfully"));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return toast.error(t("กรุณากรอกชื่อสินค้า", "Please enter product name"));
    
    const { error } = await supabase.from("products").insert([newProduct]);
    if (error) toast.error(t("เพิ่มสินค้าไม่สำเร็จ: ", "Add failed: ") + error.message);
    else {
      toast.success(t("เพิ่มสินค้าสำเร็จ", "Product added successfully"));
      setNewProduct({ name: "", price: 0, stock: 10, category: "Fonzo Acoustic", image_url: "", description: "" });
      fetchSupabaseProducts();
    }
  };

  const handleDelete = async (id: any, isCatalogItem?: boolean) => {
    if (isCatalogItem) {
      toast.error(t("ไม่สามารถลบสินค้าจากแคตตาล็อกหลักได้โดยตรง", "Cannot delete catalog items directly"));
      return;
    }
    if (!confirm(t("คุณต้องการลบสินค้านี้ใช่หรือไม่?", "Are you sure you want to delete this product?"))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(t("ลบไม่สำเร็จ", "Delete failed"));
    else {
      toast.success(t("ลบสินค้าเรียบร้อย", "Product deleted"));
      fetchSupabaseProducts();
    }
  };

  const isLoading = catalogLoading || loadingSupa;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display flex items-center gap-2">
            <Package className="h-5 w-5 text-brand" /> {t("จัดการสต็อกและข้อมูลสินค้าทั้งหมด", "All Products & Inventory")}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t("หากต้องการแก้ไขสินค้าจากแคตตาล็อก 114 รายการ ให้กดปุ่ม 'ซิงค์สินค้าทั้งหมด' ด้านขวา", "To edit catalog items, click 'Sync Catalog to DB' on the right.")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleImportCatalog} disabled={importing} variant="outline" size="sm" className="h-9 rounded-none border-brand text-brand hover:bg-brand/10">
            <Database className="mr-2 h-3.5 w-3.5" /> {importing ? t("กำลังซิงค์...", "Syncing...") : t("ซิงค์สินค้าทั้งหมดเข้าฐานข้อมูล", "Sync Catalog to DB")}
          </Button>
          <Button onClick={fetchSupabaseProducts} variant="outline" size="sm" className="h-9 rounded-none border-border">
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> {t("รีเฟรช", "Refresh")}
          </Button>
        </div>
      </div>

      {/* ฟอร์มเพิ่มสินค้าใหม่ */}
      <form onSubmit={handleAddProduct} className="border border-border bg-card p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.16em] font-semibold text-brand flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("เพิ่มสินค้าใหม่", "Add New Product")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("ชื่อสินค้า / รุ่น", "Name")}</label>
            <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Fonzo F-30 Custom" className="mt-1 h-10 rounded-none border-border" required />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("ราคา (บาท)", "Price (THB)")}</label>
            <Input type="number" value={newProduct.price || ""} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} placeholder="0" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("จำนวนสต็อก", "Stock")}</label>
            <Input type="number" value={newProduct.stock || ""} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} placeholder="10" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("หมวดหมู่", "Category")}</label>
            <Input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Fonzo Acoustic" className="mt-1 h-10 rounded-none border-border" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("ลิงก์รูปภาพ", "Image URL")}</label>
            <Input value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} placeholder="https://..." className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("รายละเอียด", "Description")}</label>
            <Input value={newProduct.description || ""} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="รายละเอียดสเปค..." className="mt-1 h-10 rounded-none border-border" />
          </div>
        </div>
        <Button type="submit" className="press h-10 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
          {t("บันทึกสินค้าใหม่", "Save Product")}
        </Button>
      </form>

      {/* ตารางแสดงสินค้าทั้งหมด */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">{t("รูป", "Image")}</th>
              <th className="p-4">{t("ชื่อสินค้า / รุ่น", "Name")}</th>
              <th className="p-4">{t("สถานะ / แหล่งที่มา", "Source")}</th>
              <th className="p-4">{t("หมวดหมู่", "Category")}</th>
              <th className="p-4">{t("ราคา (บาท)", "Price")}</th>
              <th className="p-4">{t("สต็อก", "Stock")}</th>
              <th className="p-4 text-right">{t("จัดการ / บันทึก", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : allProducts.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{t("ยังไม่มีสินค้าในระบบ", "No products found.")}</td></tr>
            ) : (
              allProducts.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-secondary/20">
                  <td className="p-4">
                    <img src={p.image_url || "/fonzo-logo.png"} alt={p.name} className="h-10 w-10 object-cover border border-border" />
                  </td>
                  <td className="p-4 font-medium text-foreground">
                    <Input 
                      value={p.name} 
                      onChange={(e) => {
                        allProducts[idx].name = e.target.value;
                      }} 
                      className="h-9 border-border rounded-none bg-transparent" 
                    />
                  </td>
                  <td className="p-4">
                    {p.isCatalogItem ? (
                      <span className="text-amber-600 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase font-semibold">
                        {t("แคตตาล็อกหลัก (กดซิงค์เพื่อแก้)", "Catalog (Sync to edit)")}
                      </span>
                    ) : (
                      <span className="text-brand bg-brand/10 px-2 py-0.5 text-[10px] uppercase font-semibold">
                        {t("จัดการร้าน (Supabase)", "Custom Product")}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <Input 
                      value={p.category} 
                      onChange={(e) => {
                        allProducts[idx].category = e.target.value;
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-32" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      type="number" 
                      value={p.price} 
                      onChange={(e) => {
                        allProducts[idx].price = Number(e.target.value);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-24" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      type="number" 
                      value={p.stock} 
                      onChange={(e) => {
                        allProducts[idx].stock = Number(e.target.value);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-16 text-center font-bold" 
                    />
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => handleSaveRow(p)} 
                      className="h-8 rounded-none bg-brand text-brand-foreground px-3 text-[10px] uppercase"
                    >
                      <Save className="h-3 w-3 mr-1" /> {t("บันทึก", "Save")}
                    </Button>
                    {!p.isCatalogItem && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(p.id!)} 
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