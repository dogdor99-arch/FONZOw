import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Inbox, Loader2, Lock, Package, PackageSearch, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageHeading } from "@/components/site/SiteLayout";
import { NewsroomAdmin } from "@/components/site/NewsroomAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Tab = "orders" | "enquiries" | "newsroom" | "stock";

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
        description={t("จัดการสต็อกสินค้าและแคตตาล็อกทั้งหมดบนเว็บไซต์ในที่เดียว", "Manage all store inventory and catalog items in one place.")}
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
  
  // 1. ดึงข้อมูล 114 ตัวจากแคตตาล็อกหลัก (tRPC)
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();

  // 2. ดึงข้อมูลสินค้าจาก Supabase
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [supaLoading, setSupaLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    stock: 1,
    category: "Fonzo Acoustic",
    image_url: "",
  });

  const fetchSupabaseProducts = async () => {
    setSupaLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) toast.error(t("ดึงข้อมูลไม่สำเร็จ: ", "Fetch failed: ") + error.message);
    else setSupabaseProducts(data || []);
    setSupaLoading(false);
  };

  useEffect(() => { fetchSupabaseProducts(); }, []);

  // 3. รวมรายการสินค้าทั้งหมดเข้าด้วยกันเพื่อให้แสดงในตาราง
  const allProducts = useMemo(() => {
    // แปลงแคตตาล็อก 114 ตัวให้อยู่ในรูปแบบเดียวกับ Supabase
    const formattedCatalog = catalogGuitars.map((g: any, index: number) => ({
      id: `catalog-${index}`,
      name: g.name || g.code,
      price: g.price || 0,
      stock: g.inStock !== false ? 10 : 0,
      category: g.series || "Catalog Guitar",
      image_url: g.image || "/fonzo-logo.png",
      isCatalogItem: true, // ระบุว่าเป็นสินค้าจากไฟล์หลัก
    }));

    return [...supabaseProducts, ...formattedCatalog];
  }, [supabaseProducts, catalogGuitars]);

  const handleUpdateStock = async (id: any, newStock: number, isCatalogItem: boolean) => {
    if (isCatalogItem) {
      toast.error(t("สินค้าจากแคตตาล็อกหลักไม่สามารถแก้ไขผ่านหน้าเว็บได้โดยตรง", "Catalog items cannot be edited directly here"));
      return;
    }
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
    if (error) toast.error(t("อัปเดตไม่สำเร็จ", "Update failed"));
    else {
      toast.success(t("อัปเดตสต็อกเรียบร้อย", "Stock updated"));
      fetchSupabaseProducts();
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return toast.error(t("กรุณากรอกชื่อสินค้า", "Please enter product name"));
    const { error } = await supabase.from("products").insert([newProduct]);
    if (error) toast.error(t("เพิ่มสินค้าไม่สำเร็จ: ", "Add failed: ") + error.message);
    else {
      toast.success(t("เพิ่มสินค้าสำเร็จ", "Product added successfully"));
      setNewProduct({ name: "", price: 0, stock: 1, category: "Fonzo Acoustic", image_url: "" });
      fetchSupabaseProducts();
    }
  };

  const handleDelete = async (id: any, isCatalogItem: boolean) => {
    if (isCatalogItem) {
      toast.error(t("ไม่สามารถลบสินค้าจากแคตตาล็อกหลักได้", "Cannot delete catalog items"));
      return;
    }
    if (!confirm(t("คุณต้องการลบสินค้านี้ใช่หรือไม่?", "Are you sure?"))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(t("ลบไม่สำเร็จ", "Delete failed"));
    else {
      toast.success(t("ลบสินค้าเรียบร้อย", "Product deleted"));
      fetchSupabaseProducts();
    }
  };

  const isLoading = catalogLoading || supaLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display flex items-center gap-2">
          <Package className="h-5 w-5 text-brand" /> {t("รายการสินค้าและสต็อกทั้งหมด", "All Products & Inventory")}
        </h2>
        <Button onClick={fetchSupabaseProducts} variant="outline" size="sm" className="h-9 rounded-none border-border">
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> {t("รีเฟรช", "Refresh")}
        </Button>
      </div>

      {/* ฟอร์มเพิ่มสินค้าใหม่ */}
      <form onSubmit={handleAddProduct} className="border border-border bg-card p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.16em] font-semibold text-brand flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("เพิ่มสินค้าหรืออุปกรณ์เสริมใหม่", "Add New Product")}
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
            <Input type="number" value={newProduct.stock || ""} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} placeholder="1" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("หมวดหมู่", "Category")}</label>
            <Input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Acoustic / Accessories" className="mt-1 h-10 rounded-none border-border" />
          </div>
        </div>
        <Button type="submit" className="press h-10 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
          {t("บันทึกสินค้าใหม่", "Save Product")}
        </Button>
      </form>

      {/* ตารางแสดงสินค้าทั้งหมด (รวมแคตตาล็อกและ Supabase) */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">{t("รูป", "Image")}</th>
              <th className="p-4">{t("ชื่อสินค้า", "Product Name")}</th>
              <th className="p-4">{t("หมวดหมู่ / แหล่งที่มา", "Category / Source")}</th>
              <th className="p-4">{t("ราคา", "Price")}</th>
              <th className="p-4">{t("สต็อก", "Stock")}</th>
              <th className="p-4 text-right">{t("จัดการ", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : allProducts.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{t("ยังไม่มีสินค้าในระบบ", "No products found")}</td></tr>
            ) : (
              allProducts.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/20">
                  <td className="p-4">
                    <img src={p.image_url || "/fonzo-logo.png"} alt={p.name} className="h-10 w-10 object-cover border border-border" />
                  </td>
                  <td className="p-4 font-medium text-foreground">{p.name}</td>
                  <td className="p-4 text-muted-foreground">
                    {p.isCatalogItem ? (
                      <span className="text-amber-600 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase">แคตตาล็อกหลัก (114 รุ่น)</span>
                    ) : (
                      <span className="text-brand bg-brand/10 px-2 py-0.5 text-[10px] uppercase">สินค้าจัดการร้าน (Supabase)</span>
                    )}
                  </td>
                  <td className="p-4">{p.price > 0 ? `฿${p.price.toLocaleString()}` : "สอบถามราคา"}</td>
                  <td className="p-4">
                    {p.isCatalogItem ? (
                      <span className="font-bold">{p.stock}</span>
                    ) : (
                      <Input
                        type="number"
                        defaultValue={p.stock}
                        onBlur={(e) => handleUpdateStock(p.id, Number(e.target.value), false)}
                        className="w-20 h-8 text-center font-bold border-border rounded-none"
                      />
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!p.isCatalogItem && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p.id, false)}
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