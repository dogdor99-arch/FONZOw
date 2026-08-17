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

interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
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
        description={t("อัปเดตสถานะคำสั่งซื้อ ปรับสต็อกสินค้า ดูแลข้อความติดต่อ และจัดการคอนเทนต์", "Manage store stock, follow up on enquiries, and curate homepage content.")}
        crumbs={[{ label: t("จัดการร้าน", "Shop console") }]}
      />
      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 border-b border-border/70 pb-5">
          {[
            { key: "orders", label: t("คำสั่งซื้อ", "Orders") },
            { key: "stock", label: t("สต็อกสินค้า", "Inventory") },
            { key: "enquiries", label: t("ข้อความติดต่อ", "Enquiries") },
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState<Product>({ name: "", price: 0, stock: 0, category: "Acoustic", image_url: "" });

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
    if (error) toast.error(t("ดึงข้อมูลไม่สำเร็จ: ", "Fetch failed: ") + error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleUpdateStock = async (id: number, newStock: number) => {
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
    if (error) toast.error(t("อัปเดตไม่สำเร็จ", "Update failed"));
    else { toast.success(t("อัปเดตสต็อกเรียบร้อย", "Stock updated")); fetchProducts(); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return toast.error(t("กรุณากรอกชื่อสินค้า", "Please enter product name"));
    const { error } = await supabase.from("products").insert([newProduct]);
    if (error) toast.error(t("เพิ่มสินค้าไม่สำเร็จ: ", "Add product failed: ") + error.message);
    else {
      toast.success(t("เพิ่มสินค้าสำเร็จ", "Product added successfully"));
      setNewProduct({ name: "", price: 0, stock: 0, category: "Acoustic", image_url: "" });
      fetchProducts();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("คุณต้องการลบสินค้านี้ใช่หรือไม่?", "Are you sure you want to delete this product?"))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(t("ลบไม่สำเร็จ", "Delete failed"));
    else { toast.success(t("ลบสินค้าเรียบร้อย", "Product deleted")); fetchProducts(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display flex items-center gap-2">
          <Package className="h-5 w-5 text-brand" /> {t("จัดการสต็อกสินค้าหน้าร้าน", "Manage Store Stock")}
        </h2>
        <Button onClick={fetchProducts} variant="outline" size="sm" className="h-9 rounded-none border-border">
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> {t("รีเฟรช", "Refresh")}
        </Button>
      </div>

      <form onSubmit={handleAddProduct} className="border border-border bg-card p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.16em] font-semibold text-brand flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("เพิ่มกีตาร์ / สินค้าใหม่", "Add New Product")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("ชื่อสินค้า/รุ่น", "Name")}</label>
            <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Fonzo F-30 Custom" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("ราคา (บาท)", "Price (THB)")}</label>
            <Input type="number" value={newProduct.price || ""} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} placeholder="0" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("จำนวนสต็อกเริ่มต้น", "Stock")}</label>
            <Input type="number" value={newProduct.stock || ""} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} placeholder="0" className="mt-1 h-10 rounded-none border-border" />
          </div>
        </div>
        <Button type="submit" className="press h-10 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
          {t("บันทึกสินค้าใหม่", "Save Product")}
        </Button>
      </form>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">{t("ชื่อสินค้า", "Product Name")}</th>
              <th className="p-4">{t("ราคา", "Price")}</th>
              <th className="p-4">{t("จำนวนสต็อก (พิมพ์เปลี่ยนแล้วกดออกจากช่อง)", "Stock (Blur to save)")}</th>
              <th className="p-4 text-right">{t("จัดการ", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">{t("ยังไม่มีสินค้าในฐานข้อมูล", "No products in database")}</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/20">
                  <td className="p-4 font-medium text-foreground">{p.name}</td>
                  <td className="p-4">฿{p.price.toLocaleString()}</td>
                  <td className="p-4">
                    <Input type="number" defaultValue={p.stock} onBlur={(e) => handleUpdateStock(p.id!, Number(e.target.value))} className="w-24 h-9 text-center font-bold border-border rounded-none" />
                  </td>
                  <td className="p-4 text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(p.id!)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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