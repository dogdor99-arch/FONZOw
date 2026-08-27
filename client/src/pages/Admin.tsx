import { useState, useEffect } from "react";
import { Loader2, Lock, Package, RefreshCw, Trash2 } from "lucide-react";
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
  
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingSupa, setLoadingSupa] = useState(true);

  const fetchSupabaseProducts = async () => {
    setLoadingSupa(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (!error) setSupabaseProducts(data || []);
    setLoadingSupa(false);
  };

  useEffect(() => { fetchSupabaseProducts(); }, []);

  useEffect(() => {
    const formattedCatalog = catalogGuitars.map((g: any, idx: number) => ({
      id: `catalog-${idx}`,
      name: g.name || g.code,
      price: Number(g.price || 0),
      stock: g.stock ?? 10,
      category: g.series || "Catalog Guitar",
      image_url: g.image || "/fonzo-logo.png",
      isCatalogItem: true,
    }));

    const supaNames = new Set(supabaseProducts.map(p => (p.name || "").toLowerCase().trim()));
    const uniqueCatalog = formattedCatalog.filter(c => !supaNames.has((c.name || "").toLowerCase().trim()));
    
    setTableData([...supabaseProducts, ...uniqueCatalog]);
  }, [catalogGuitars, supabaseProducts]);

  const handleSaveRow = async (idx: number, product: any) => {
    try {
      const { error } = await supabase.from("products").upsert({
        id: product.isCatalogItem ? undefined : product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url
      }, { onConflict: "name" });

      if (error) throw error;
      toast.success(t("บันทึกข้อมูลเรียบร้อย", "Saved successfully"));
      fetchSupabaseProducts();
    } catch (err: any) {
      toast.error(t("บันทึกไม่สำเร็จ", "Save failed"));
    }
  };

  const handleDelete = async (id: any, isCatalogItem?: boolean) => {
    if (isCatalogItem) {
      toast.error(t("ไม่สามารถลบสินค้าจากแคตตาล็อกหลักได้", "Cannot delete catalog items directly"));
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
        <h2 className="text-lg font-display flex items-center gap-2">
          <Package className="h-5 w-5 text-brand" /> {t("จัดการสต็อกและข้อมูลสินค้าทั้งหมด", "All Products & Inventory")}
        </h2>
        <Button onClick={fetchSupabaseProducts} variant="outline" size="sm" className="h-9 rounded-none border-border">
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> {t("รีเฟรช", "Refresh")}
        </Button>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">{t("ชื่อสินค้า / รุ่น", "Name")}</th>
              <th className="p-4">{t("หมวดหมู่", "Category")}</th>
              <th className="p-4">{t("ราคา (บาท)", "Price")}</th>
              <th className="p-4">{t("สต็อก", "Stock")}</th>
              <th className="p-4 text-right">{t("จัดการ / บันทึก", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : tableData.map((p, idx) => (
                <tr key={idx} className="hover:bg-secondary/20">
                  <td className="p-4">
                    <Input 
                      value={p.name} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].name = e.target.value;
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent min-w-[200px]" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      value={p.category} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].category = e.target.value;
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-32" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      type="number" 
                      value={p.price} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].price = Number(e.target.value);
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-24" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      type="number" 
                      value={p.stock} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].stock = Number(e.target.value);
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-16 text-center font-bold" 
                    />
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => handleSaveRow(idx, p)} 
                      className="h-8 rounded-none bg-brand text-brand-foreground px-3 text-[10px] uppercase"
                    >
                      {t("บันทึก", "Save")}
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
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}