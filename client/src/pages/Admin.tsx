import { useState, useEffect } from "react";
import { Bell, Loader2, Lock, Package, Plus, RefreshCw, Trash2, Edit2, ArrowLeft, Save, Image as ImageIcon, Upload, Guitar, Headphones, BookOpen, Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { ArtistsAdmin } from "@/components/site/ArtistsAdmin";
import { WorksAdmin } from "@/components/site/WorksAdmin";
import { ChatAdmin } from "@/components/site/ChatAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { inferCustomFamily, inferPurchaseMode } from "@shared/fonzo/customizer";

type Tab = "stock" | "founder" | "artists" | "works" | "chat";
type SubView = "list" | "add" | "edit";

export default function Admin() {
  const { t } = useLocale();
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("stock");
  const unreadChat = trpc.chat.unreadCount.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin", refetchInterval: 5000 });

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
        <CompactPageHeading eyebrow={t("สำหรับทีมงาน", "Staff only")} title={t("จัดการร้าน", "Shop console")} crumbs={[{ label: t("จัดการร้าน", "Shop console") }]} />
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
      <section className="border-b border-border/70 bg-cream/40 px-4 py-4 sm:px-6 lg:px-10"><div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-5 lg:pl-12"><div><nav aria-label="breadcrumb" className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase"><a href="/" className="transition-colors hover:text-brand">{t("หน้าแรก", "Home")}</a><span className="mx-1.5 text-brand">›</span>{t("จัดการร้าน", "Shop console")}</nav><h1 className="mt-2 font-display text-3xl leading-none sm:text-4xl">{t("จัดการร้าน", "Shop console")}</h1></div><div className="flex flex-wrap gap-2">
          {[
            { key: "stock", label: t("จัดการสต็อกและสินค้า", "Products & Inventory"), unread: 0 },
            { key: "founder", label: t("หน้า Founder", "Founder page"), unread: 0 },
            { key: "artists", label: t("ศิลปิน", "Artists"), unread: 0 },
            { key: "works", label: t("ผลงาน / Events", "Works / Events"), unread: 0 },
            { key: "chat", label: t("แชทลูกค้า", "Customer chat"), unread: unreadChat.data ?? 0 },
          ].map(item => (
            <button key={item.key} type="button" onClick={() => setTab(item.key as Tab)} className={cn("press border px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase", tab === item.key ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand")}>
              {item.key === "chat" && <Bell className="mr-2 inline-block h-3.5 w-3.5" />}
              {item.label}
              {item.key === "chat" && item.unread ? <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-cream px-1.5 py-0.5 text-[9px] text-brand">{item.unread > 99 ? "99+" : item.unread}</span> : null}
            </button>
          ))}</div></div></section>
      <section className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10"><div>
          {tab === "stock" && <StockManager />}
          {tab === "founder" && <FounderAdmin />}
          {tab === "artists" && <ArtistsAdmin />}
          {tab === "works" && <WorksAdmin />}
          {tab === "chat" && <ChatAdmin />}
        </div>
      </section>
    </>
  );
}

function StockManager() {
  const { t } = useLocale();
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  const { data: catalogAccessories = [], isLoading: accessoriesLoading } = trpc.fonzo.accessories.list.useQuery();

  const [view, setView] = useState<SubView>("list");
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingSupa, setLoadingSupa] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [categoryTab, setCategoryTab] = useState<"shop" | "custom" | "accessories" | "courses">("shop");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"price" | "stock" | "date">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [accessoryType, setAccessoryType] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);

  const isAccessoryProduct = (product: any) => {
    if (product.itemKind === "accessory") return true;
    const sourceCode = String(product.specs?.sourceCode ?? product.code ?? "").toUpperCase();
    if (sourceCode.startsWith("A")) return true;
    const haystack = [product.category, product.typeName, product.type, product.name, product.nameEn].filter(Boolean).join(" ");
    return /accessor|อุปกรณ์|อะไหล่|string|สายกีตาร์|strings|bag|case|pick|pickup|capo|tuner|เครื่องตั้งสาย/i.test(haystack);
  };
  const getAccessoryType = (product: any) => {
    const text = [product.category, product.typeName, product.type, product.name, product.nameEn, product.specs?.type, product.specs?.ประเภท].filter(Boolean).join(" ").toLowerCase();
    if (/capo|คาโป้|คาโป/.test(text)) return "คาโป้ / Capo";
    if (/string|สาย|เบอร์สาย/.test(text)) return "สาย / Strings";
    if (/bag|case|กระเป๋า|เคส/.test(text)) return "กระเป๋า / Case";
    if (/pick|ปิ๊ก|ปิ๊ค/.test(text)) return "ปิ๊ก / Picks";
    if (/pickup|preamp|piezo|อุปกรณ์ไฟฟ้า/.test(text)) return "Pickup / Electronics";
    if (/tuner|เครื่องตั้งสาย/.test(text)) return "เครื่องตั้งสาย / Tuner";
    return product.category || "อื่น ๆ / Other";
  };

  const fetchSupabaseProducts = async () => {
    setLoadingSupa(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (!error) setSupabaseProducts(data || []);
    setLoadingSupa(false);
  };

  useEffect(() => { fetchSupabaseProducts(); }, []);

  // ระบบผสานข้อมูลกีตาร์และอุปกรณ์เสริมจากหลังบ้านและ Supabase
  useEffect(() => {
    const supaMap = new Map();
    supabaseProducts.forEach(p => {
      if (p.name) supaMap.set(p.name.toLowerCase().trim(), p);
    });

    const getVal = (obj: any, ...keys: string[]) => {
      if (!obj) return "";
      for (const k of keys) {
        if (obj[k]) return obj[k];
      }
      return "";
    };

    const combinedCatalog = [
      ...catalogGuitars.map((g: any) => ({ ...g, itemKind: "guitar" })),
      ...catalogAccessories.map((a: any) => ({ ...a, itemKind: "accessory" }))
    ];

    const mergedList = combinedCatalog.map((g: any, idx: number) => {
      const name = (g.name || g.code || "").toLowerCase().trim();
      const supaMatch = supaMap.get(name);

      if (supaMatch) {
        supaMap.delete(name);
        return {
          ...g,
          ...supaMatch,
          itemKind: g.itemKind,
          id: supaMatch.id,
          image_urls: supaMatch.image_urls && supaMatch.image_urls.length > 0
            ? supaMatch.image_urls
            : (g.images || [g.image || "/fonzo-logo.png"]),
          shopee_url: getVal(supaMatch, "shopee_url", "shopeeUrl", "shopee") || getVal(g, "shopee_url", "shopeeUrl", "shopee"),
          lazada_url: getVal(supaMatch, "lazada_url", "lazadaUrl", "lazada") || getVal(g, "lazada_url", "lazadaUrl", "lazada"),
          isCatalogItem: false,
          specs: { ...(supaMatch.specs || {}), sourceCode: supaMatch.specs?.sourceCode || g.code }
        };
      }

      const imgList = g.images || (g.image ? [g.image] : (g.imageUrl ? [g.imageUrl] : ["/fonzo-logo.png"]));
      return {
        id: `catalog-${idx}`,
        name: g.name || g.code,
        price: Number(g.price || 0),
        stock: g.stock ?? 10,
        category: g.series || (g.itemKind === "accessory" ? "Accessories & Strings" : "Catalog Guitar"),
        image_url: imgList[0],
        image_urls: imgList,
        description: g.description || "",
        specs: g.specs || {},
        features: g.features || [],
        shopee_url: getVal(g, "shopee_url", "shopeeUrl", "shopee"),
        lazada_url: getVal(g, "lazada_url", "lazadaUrl", "lazada"),
        isCatalogItem: true,
      };
    });

    const remainingCustomProducts = Array.from(supaMap.values()).map(p => ({
      ...p,
      image_urls: p.image_urls && p.image_urls.length > 0 ? p.image_urls : [p.image_url || "/fonzo-logo.png"],
      shopee_url: getVal(p, "shopee_url", "shopeeUrl", "shopee"),
      lazada_url: getVal(p, "lazada_url", "lazadaUrl", "lazada"),
      isCatalogItem: false
    }));

    setAllProducts([...remainingCustomProducts, ...mergedList].filter(product => product.name !== "__founder_page__"));
  }, [catalogGuitars, catalogAccessories, supabaseProducts]);

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
    return <ProductForm mode="add" defaultCategory={categoryTab === "courses" ? "Bird Course" : undefined} defaultProductType={categoryTab === "courses" ? "course" : undefined} onBack={() => { setView("list"); fetchSupabaseProducts(); }} />;
  }

  if (view === "edit" && editingItem) {
    return <ProductForm mode="edit" initialData={editingItem} onBack={() => { setView("list"); fetchSupabaseProducts(); }} />;
  }

  const isLoading = catalogLoading || accessoriesLoading || loadingSupa;

  const accessoryTypes = Array.from(new Set(allProducts.filter(isAccessoryProduct).map(getAccessoryType))).filter(Boolean);
  const displayProducts = allProducts.filter((p) => {
    const cat = (p.category || "").toLowerCase();
    const isAcc = isAccessoryProduct(p);
    if (categoryTab === "courses") return cat.includes("course") || cat.includes("คอร์ส") || cat.includes("เรียน");
    if (categoryTab === "accessories") return isAcc;
    const isCustom = inferPurchaseMode(p) === "custom";
    return categoryTab === "custom" ? !isAcc && isCustom : !isAcc && !isCustom && !(cat.includes("course") || cat.includes("คอร์ส") || cat.includes("เรียน"));
  }).filter(p => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [p.name, p.nameEn, p.code, p.category, p.series, p.specs?.sourceCode]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(needle));
  }).filter(p => categoryTab !== "accessories" || accessoryType === "all" || getAccessoryType(p) === accessoryType).sort((a, b) => {
    const av = sortKey === "price" ? Number(a.price || 0) : sortKey === "stock" ? Number(a.stock || 0) : new Date(a.created_at || a.createdAt || 0).getTime();
    const bv = sortKey === "price" ? Number(b.price || 0) : sortKey === "stock" ? Number(b.stock || 0) : new Date(b.created_at || b.createdAt || 0).getTime();
    return (av - bv) * (sortDirection === "asc" ? 1 : -1);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display flex items-center gap-2">
            <Package className="h-5 w-5 text-brand" /> {t("รายการสินค้าทั้งหมด", "All Products")}
          </h2>

        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      <div className="relative flex flex-col gap-3 border-b border-border sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-5 overflow-x-auto px-1 sm:flex-wrap sm:gap-6">
        <button
          type="button"
          onClick={() => setCategoryTab("shop")}
          className={cn("pb-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 transition-all", categoryTab === "shop" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground")}
        >
          <Guitar className="h-4 w-4" /> Guitar Shop
        </button>
          <button type="button" onClick={() => setCategoryTab("custom")} className={cn("shrink-0 pb-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 transition-all", categoryTab === "custom" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground")}><Guitar className="h-4 w-4" /> Guitar Custom</button>
        <button
          type="button"
          onClick={() => setCategoryTab("accessories")}
          className={cn("shrink-0 pb-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 transition-all", categoryTab === "accessories" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground")}
        >
            <Headphones className="h-4 w-4" /> อุปกรณ์เสริม (Accessories & Strings)
          </button>
          <button type="button" onClick={() => setCategoryTab("courses")} className={cn("shrink-0 pb-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 transition-all", categoryTab === "courses" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-brand")}>
            <BookOpen className="h-4 w-4" /> คอร์สเรียนพี่เบิร์ด (Courses)
          </button>
        </div>
        <div className="relative flex shrink-0 items-center gap-2 pb-2"><select value={sortKey} onChange={event => setSortKey(event.target.value as typeof sortKey)} className="h-9 min-w-[120px] border border-border bg-card px-2 text-xs"><option value="date">วันที่</option><option value="price">ราคา</option><option value="stock">สต็อก</option></select><Button type="button" variant="outline" onClick={() => setSortDirection(value => value === "asc" ? "desc" : "asc")} className="h-9 rounded-none px-2 text-xs" aria-label={sortDirection === "asc" ? "เรียงน้อยไปมาก" : "เรียงมากไปน้อย"}><ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />{sortDirection === "asc" ? "น้อยไปมาก" : "มากไปน้อย"}</Button><button type="button" onClick={() => setSearchOpen(value => !value)} className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition hover:border-brand hover:text-brand" aria-label="ค้นหาสินค้า" aria-expanded={searchOpen}><Search className="h-4 w-4" /></button>{searchOpen && <div className="absolute bottom-full right-0 z-20 mb-2 w-[min(320px,calc(100vw-2rem))] border border-border bg-card p-2 shadow-lg"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="ค้นหาชื่อสินค้า / รุ่น / รหัส" className="h-10 rounded-none pl-9" /></div></div>}<Button type="button" onClick={() => setView("add")} className="h-9 w-9 rounded-none bg-brand p-0 text-brand-foreground" aria-label="เพิ่มสินค้า"><Plus className="h-4 w-4" /></Button><Button type="button" onClick={fetchSupabaseProducts} variant="outline" className="h-9 w-9 rounded-none p-0" aria-label="รีเฟรช"><RefreshCw className="h-3.5 w-3.5" /></Button></div>
      </div>

      {categoryTab === "accessories" && <div className="flex flex-wrap gap-2 border-b border-border pb-4">{[{ key: "all", label: "ทั้งหมด" }, ...accessoryTypes.map(type => ({ key: type, label: type }))].map(type => <button key={type.key} type="button" onClick={() => setAccessoryType(type.key)} className={cn("border px-4 py-2 text-xs transition-colors", accessoryType === type.key ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand")}>{type.label}</button>)}</div>}

      {categoryTab !== "courses" ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{isLoading ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[3/4] animate-pulse bg-secondary" />) : displayProducts.map((p, idx) => <article key={p.id || idx} className="group overflow-hidden border border-border bg-card transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg"><div className="aspect-[3/4] overflow-hidden bg-secondary"><img src={p.image_urls?.[0] || p.image_url || p.image || "/fonzo-logo.png"} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" onError={event => { event.currentTarget.src = "/fonzo-logo.png"; }} /></div><div className="p-4"><p className="text-[10px] tracking-[0.14em] text-brand uppercase">{categoryTab === "accessories" ? getAccessoryType(p) : p.category || "Guitar"}</p><h3 className="mt-1 line-clamp-2 font-display text-lg">{p.name}</h3><div className="mt-3 flex items-center justify-between text-sm"><span>฿{Number(p.price || 0).toLocaleString()}</span><span className="text-xs text-muted-foreground">{p.stock ?? 0} ชิ้น</span></div><div className="mt-4 flex gap-2"><Button type="button" onClick={() => { setEditingItem(p); setView("edit"); }} className="h-8 flex-1 rounded-none bg-brand px-2 text-[10px] text-brand-foreground"><Edit2 className="mr-1 h-3 w-3" />แก้ไข</Button>{!p.isCatalogItem && <Button type="button" variant="outline" onClick={() => handleDelete(p.id, p.isCatalogItem)} className="h-8 w-8 rounded-none p-0 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>}</div></div></article>)}</div> : <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4 w-20">รูปภาพ</th>
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
            ) : displayProducts.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">ยังไม่มีสินค้าในหมวดหมู่นี้</td></tr>
            ) : (
              displayProducts.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-secondary/20">
                  <td className="p-4">
                    <img src={p.image_urls?.[0] || p.image_url || p.image || "/fonzo-logo.png"} alt={p.name} className="h-10 w-10 object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).src = "/fonzo-logo.png"; }} />
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
      </div>}
    </div>
  );
}

function FounderAdmin() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rowId, setRowId] = useState<string | number | null>(null);
  const [form, setForm] = useState({ title: "Founder", html: "", imageUrl: "", galleryUrls: [] as string[] });

  useEffect(() => {
    supabase.from("products").select("id,name,image_url,image_urls,specs").eq("name", "__founder_page__").order("id", { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      const rawPage = data?.specs?.founderPage;
      const page = typeof rawPage === "string" ? (() => { try { return JSON.parse(rawPage); } catch { return {}; } })() : (rawPage || {});
      setRowId(data?.id ?? null);
      const storedImages = Array.isArray(data?.image_urls) ? data.image_urls.filter(Boolean) : [];
      setForm({ title: page.title || "Founder", html: page.html || "", imageUrl: page.imageUrl || storedImages[0] || "", galleryUrls: Array.isArray(page.galleryUrls) && page.galleryUrls.length ? page.galleryUrls : storedImages.slice(1) });
      setLoading(false);
    });
  }, []);

  const readImage = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = event => resolve(String(event.target?.result || "")); reader.onerror = () => reject(new Error("อ่านไฟล์รูปไม่สำเร็จ")); reader.readAsDataURL(file); });
  const handleMainImage = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; setUploading(true); try { const url = await readImage(file); setForm(current => ({ ...current, imageUrl: url })); } catch (error) { toast.error(error instanceof Error ? error.message : "อ่านไฟล์รูปไม่สำเร็จ"); } finally { setUploading(false); } };
  const handleGalleryImages = async (event: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (!files.length) return; setUploading(true); try { const urls = await Promise.all(files.map(readImage)); setForm(current => ({ ...current, galleryUrls: [...current.galleryUrls, ...urls.filter(Boolean)] })); toast.success(t(`เพิ่มรูป ${urls.length} รูปแล้ว กดบันทึกเพื่อเผยแพร่`, `${urls.length} images added. Save to publish.`)); } catch (error) { toast.error(error instanceof Error ? error.message : "อ่านไฟล์รูปไม่สำเร็จ"); } finally { setUploading(false); } };
  const save = async () => {
    if (uploading) return;
    setSaving(true);
    const payload = { name: "__founder_page__", category: "__site_content__", price: 0, stock: 0, image_url: form.imageUrl || "/founder-main.jpg", image_urls: [form.imageUrl, ...form.galleryUrls].filter(Boolean), description: "", specs: { founderPage: { ...form, galleryUrls: form.galleryUrls.filter(Boolean) } } };
    const result = rowId ? await supabase.from("products").update(payload).eq("id", rowId) : await supabase.from("products").insert([payload]);
    if (result.error) toast.error(t("บันทึกหน้า Founder ไม่สำเร็จ", "Could not save Founder page")); else toast.success(t("บันทึกหน้า Founder สำเร็จ", "Founder page saved"));
    setSaving(false);
  };

  if (loading) return <div className="flex min-h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-brand" /></div>;
  return <div className="mx-auto max-w-4xl space-y-6 border border-border bg-card p-6 sm:p-8">
    <div><h2 className="font-display text-xl">{t("แก้ไขหน้า Founder", "Edit Founder page")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("แก้ไขชื่อ เนื้อหา รูปหลัก และเพิ่มรูปแถบเลื่อนด้านขวาล่างได้จากส่วนนี้", "Edit the title, content, main image, and bottom-right image strip here.")}</p></div>
    <div><label className="text-[11px] tracking-widest text-muted-foreground uppercase">{t("ชื่อหน้า", "Page title")}</label><Input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 rounded-none" /></div>
    <div><label className="text-[11px] tracking-widest text-muted-foreground uppercase">{t("เนื้อหา HTML", "HTML content")}</label><textarea value={form.html} onChange={event => setForm({ ...form, html: event.target.value })} rows={16} className="mt-1 w-full border border-border bg-background p-3 text-sm leading-relaxed outline-none focus:border-brand" placeholder="ใส่เนื้อหา HTML ของหน้า Founder" /></div>
    <div><label className="text-[11px] tracking-widest text-muted-foreground uppercase">{t("รูปหลัก", "Main image")}</label><div className="mt-2 flex items-center gap-4"><label className="inline-flex cursor-pointer items-center gap-2 text-xs text-brand hover:underline"><Upload className="h-4 w-4" />{t("เลือกรูปจากเครื่อง", "Choose image")}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImage} /></label>{form.imageUrl && <img src={form.imageUrl} alt="" className="h-20 w-28 object-cover" />}</div><Input value={form.imageUrl} onChange={event => setForm({ ...form, imageUrl: event.target.value })} placeholder="หรือวาง URL รูปภาพ" className="mt-3 rounded-none" /></div>
    <div><label className="text-[11px] tracking-widest text-muted-foreground uppercase">{t("แถบรูปเลื่อนด้านขวาล่าง", "Bottom-right image strip")}</label><label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-brand hover:underline"><Upload className="h-4 w-4" />{t("เพิ่มรูปหลายรูป", "Add multiple images")}<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleGalleryImages} /></label><div className="mt-3 flex gap-3 overflow-x-auto pb-2">{form.galleryUrls.map((url, index) => <div key={`${url}-${index}`} className="relative h-24 w-36 shrink-0"><img src={url} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => setForm(current => ({ ...current, galleryUrls: current.galleryUrls.filter((_, itemIndex) => itemIndex !== index) }))} className="absolute right-1 top-1 bg-ink/80 px-2 py-0.5 text-xs text-white">×</button></div>)}</div></div>
    <Button type="button" onClick={save} disabled={saving || uploading} className="h-11 rounded-none bg-brand px-8 text-xs uppercase tracking-widest text-brand-foreground">{saving || uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{uploading ? t("กำลังอ่านรูป...", "Reading images...") : t("บันทึกหน้า Founder", "Save Founder page")}</Button>
  </div>;
}

// ฟอร์มเพิ่ม/แก้ไขสินค้า
function ProductForm({ mode, initialData, onBack, defaultCategory, defaultProductType }: { mode: "add" | "edit", initialData?: any, onBack: () => void, defaultCategory?: string, defaultProductType?: "guitar" | "accessory" | "course" }) {
  const initialCategory = String(initialData?.category ?? "").toLowerCase();
  const sourceCodeInitial = String(initialData?.specs?.sourceCode ?? initialData?.code ?? "").toUpperCase();
  const isCourseInitial = initialData?.itemKind === "course" || initialCategory.includes("course") || initialCategory.includes("คอร์ส") || initialCategory.includes("เรียน");
  const isAccInitial = initialData?.itemKind === "accessory" || sourceCodeInitial.startsWith("A") || initialCategory.includes("string") || initialCategory.includes("accessor") || initialCategory.includes("สาย");
  const [productType, setProductType] = useState<"guitar" | "accessory" | "course">(defaultProductType ?? (isCourseInitial ? "course" : isAccInitial ? "accessory" : "guitar"));
  const [purchaseMode, setPurchaseMode] = useState<"shop" | "custom">(inferPurchaseMode(initialData));
  const [customFamily, setCustomFamily] = useState<"custom" | "selection">(inferCustomFamily(initialData) || "custom");

  const getInitialImages = () => {
    if (initialData?.image_urls && Array.isArray(initialData.image_urls) && initialData.image_urls.length > 0) {
      return initialData.image_urls;
    }
    if (initialData?.images && Array.isArray(initialData.images) && initialData.images.length > 0) {
      return initialData.images;
    }
    const single = initialData?.image_url || initialData?.imageUrl || initialData?.image;
    if (single) {
      return [single];
    }
    return [];
  };

  const getInitVal = (...keys: string[]) => {
    if (!initialData) return "";
    for (const k of keys) {
      if (initialData[k]) return initialData[k];
    }
    return "";
  };

  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    stock: number;
    category: string;
    description: string;
    shopee_url: string;
    lazada_url: string;
    video_url: string;
    image_urls: string[];
  }>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    stock: initialData?.stock ?? 0,
    category: initialData?.category || defaultCategory || (isAccInitial ? "Accessories & Strings" : "Fonzo Acoustic"),
    description: initialData?.description || "",
    shopee_url: getInitVal("shopee_url", "shopeeUrl", "shopee"),
    lazada_url: getInitVal("lazada_url", "lazadaUrl", "lazada"),
    video_url: getInitVal("video_url", "videoUrl", "video", "guitar_vdo") || initialData?.specs?.videoUrl || initialData?.specs?.video_url || "",
    image_urls: getInitialImages()
  });

  const cleanMm = (val: string) => {
    if (!val) return "";
    return val.toString().replace(/mm/gi, "").trim();
  };

  const [guitarSpecs, setGuitarSpecs] = useState({
    top_wood: initialData?.specs?.["TOP WOOD"] || initialData?.specs?.["Top Wood"] || initialData?.specs?.topWood || "",
    back_sides: initialData?.specs?.["BACK & SIDES"] || initialData?.specs?.["Back & Sides"] || initialData?.specs?.backSides || "",
    neck: initialData?.specs?.["NECK"] || initialData?.specs?.["Neck"] || initialData?.specs?.neck || "",
    fingerboard: initialData?.specs?.["FINGERBOARD"] || initialData?.specs?.["Fingerboard"] || initialData?.specs?.fingerboard || "",
    scale_length: cleanMm(initialData?.specs?.["SCALE LENGTH"] || initialData?.specs?.["Scale Length"] || initialData?.specs?.scaleLength || ""),
    nut_width: cleanMm(initialData?.specs?.["NUT WIDTH"] || initialData?.specs?.["Nut Width"] || initialData?.specs?.nutWidth || ""),
    bridge: initialData?.specs?.["BRIDGE"] || initialData?.specs?.["Bridge"] || initialData?.specs?.bridge || "",
    finish: initialData?.specs?.["FINISH"] || initialData?.specs?.["Finish"] || initialData?.specs?.finish || "",
  });

  const standardGuitarSpecKeys = new Set(["TOP WOOD", "Top Wood", "topWood", "top_wood", "BACK & SIDES", "Back & Sides", "backSides", "back_sides", "NECK", "Neck", "neck", "FINGERBOARD", "Fingerboard", "fingerboard", "SCALE LENGTH", "Scale Length", "scaleLength", "scale_length", "NUT WIDTH", "Nut Width", "nutWidth", "nut_width", "BRIDGE", "Bridge", "bridge", "FINISH", "Finish", "finish"]);
  const initialExtraGuitarSpecs = Object.entries(initialData?.specs && typeof initialData.specs === "object" && !Array.isArray(initialData.specs) ? initialData.specs : {})
    .filter(([key, value]) => !standardGuitarSpecKeys.has(key) && !/^(sourceurl|source_url|sourcecode|source_code|purchaseMode|purchase_mode|customFamily|custom_family|customizer)$/i.test(key) && (typeof value === "string" || typeof value === "number"))
    .map(([key, value]) => ({ key, value: String(value) }));
  const [extraGuitarSpecs, setExtraGuitarSpecs] = useState<Array<{ key: string; value: string }>>(initialExtraGuitarSpecs);

  const [accessorySpecs, setAccessorySpecs] = useState({
    string_gauge: initialData?.specs?.["String Gauge"] || initialData?.specs?.["เบอร์สาย"] || "",
    material: initialData?.specs?.["Material"] || initialData?.specs?.["ชนิดสาย"] || "",
    brand: initialData?.specs?.["Brand"] || initialData?.specs?.["ยี่ห้อ"] || "",
    type: initialData?.specs?.["Type"] || initialData?.specs?.["ประเภท"] || "",
  });

  const [saving, setSaving] = useState(false);
  const isStringAccessory = /string|สาย|เบอร์สาย|savarez|d['’]?addario|elixir|cantiga|phosphor bronze|nylon/i.test(`${formData.name} ${formData.category} ${accessorySpecs.type} ${accessorySpecs.material}`);

  const handleLocalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setFormData(prev => ({
            ...prev,
            image_urls: [...prev.image_urls, result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = formData.image_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, image_urls: updatedImages });
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
          "SCALE LENGTH": guitarSpecs.scale_length ? `${guitarSpecs.scale_length} mm` : "",
          "NUT WIDTH": guitarSpecs.nut_width ? `${guitarSpecs.nut_width} mm` : "",
          "BRIDGE": guitarSpecs.bridge,
          "FINISH": guitarSpecs.finish,
          ...Object.fromEntries(extraGuitarSpecs.filter(item => item.key.trim()).map(item => [item.key.trim(), item.value]))
        };
      } else if (productType === "accessory") {
        specs = {
          "String Gauge": accessorySpecs.string_gauge,
          "Material": accessorySpecs.material,
          "Brand": accessorySpecs.brand,
          "Type": accessorySpecs.type
        };
      } else {
        specs = { "Content Type": "Bird Guitar Course" };
      }

      const customizer = initialData?.specs?.customizer || initialData?.customizer || null;
      const specsWithMetadata = {
        ...(initialData?.specs || {}),
        ...specs,
        videoUrl: formData.video_url.trim(),
        purchaseMode: productType === "guitar" ? purchaseMode : "shop",
        customFamily: productType === "guitar" && purchaseMode === "custom" ? customFamily : null,
        ...(customizer ? { customizer } : {}),
      };

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        description: formData.description,
        shopee_url: formData.shopee_url,
        lazada_url: formData.lazada_url,
        image_url: primaryImage,
        image_urls: validImages,
        specs: specsWithMetadata
      };

      const targetId = initialData && !initialData.isCatalogItem && !initialData.id?.toString().startsWith("catalog-") ? initialData.id : null;
      const targetName = initialData?.name || formData.name;

      let existingId = targetId;
      if (!existingId) {
        const { data: found } = await supabase
          .from("products")
          .select("id")
          .ilike("name", targetName)
          .maybeSingle();
        existingId = found?.id;
      }

      let error = null;
      if (existingId) {
        const res = await supabase.from("products").update(payload).eq("id", existingId);
        error = res.error;
      } else {
        const res = await supabase.from("products").insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      toast.success("บันทึกข้อมูลสำเร็จ!");
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
            <label className="flex items-center gap-2 text-xs cursor-pointer font-medium">
              <input type="radio" name="pType" checked={productType === "course"} onChange={() => { setProductType("course"); setFormData({...formData, category: "Bird Course"}); }} />
              คอร์สเรียนของพี่เบิร์ด (Bird Courses)
            </label>
          </div>
        </div>

        {productType === "guitar" && <div className="border border-brand/20 bg-brand/5 p-4">
          <label className="flex cursor-pointer items-center gap-3 text-xs font-semibold text-brand">
            <input type="checkbox" checked={purchaseMode === "custom"} onChange={event => setPurchaseMode(event.target.checked ? "custom" : "shop")} className="h-4 w-4 accent-[var(--brand)]" />
            กีตาร์ Custom
          </label>
          {purchaseMode === "custom" && <div className="mt-3 max-w-sm">
            <label className="text-[11px] tracking-[0.16em] text-brand uppercase font-semibold">กลุ่ม Custom</label>
            <select value={customFamily} onChange={event => setCustomFamily(event.target.value as "custom" | "selection")} className="mt-1 h-10 w-full rounded-none border border-border bg-background px-3 text-sm">
              <option value="custom">Fonzo Custom</option>
              <option value="selection">Fonzo Selection</option>
            </select>
          </div>}
        </div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">ชื่อสินค้า / รุ่น</label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 h-10 rounded-none border-border" required />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">หมวดหมู่ย่อย</label>
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 h-10 w-full rounded-none border border-border bg-background px-3 text-sm">
              {(productType === "guitar" ? ["Fonzo Acoustic", "Fonzo Classic", "Fonzo Custom", "Fonzo Selection"] : productType === "accessory" ? ["คาโป้ / Capo", "สาย / Strings", "กระเป๋า / Case", "ปิ๊ก / Picks", "Pickup / Electronics", "เครื่องตั้งสาย / Tuner", "อื่น ๆ / Other"] : ["Bird Course"]).map(option => <option key={option} value={option}>{option}</option>)}
              {formData.category && !(productType === "guitar" ? ["Fonzo Acoustic", "Fonzo Classic", "Fonzo Custom", "Fonzo Selection"] : productType === "accessory" ? ["คาโป้ / Capo", "สาย / Strings", "กระเป๋า / Case", "ปิ๊ก / Picks", "Pickup / Electronics", "เครื่องตั้งสาย / Tuner", "อื่น ๆ / Other"] : ["Bird Course"]).includes(formData.category) && <option value={formData.category}>{formData.category}</option>}
            </select>
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">ราคา (บาท)</label>
            <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value.replace(/^0+/, ''))})} placeholder="0" className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">จำนวนสต็อก</label>
            <Input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Math.max(0, Number(e.target.value))})} placeholder="0" className="mt-1 h-10 rounded-none border-border" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
          {productType === "guitar" && <div className="sm:col-span-2 border border-brand/20 bg-brand/5 p-4">
            <label className="text-[11px] tracking-[0.16em] text-brand uppercase font-semibold">วิดีโอสาธิตเสียง (YouTube)</label>
            <Input value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} placeholder="กรุณากรอกลิงก์ YouTube ของกีตาร์รุ่นนี้" className="mt-1 h-10 rounded-none border-border" />
            <p className="mt-1 text-[11px] text-muted-foreground">ใช้ได้กับ Guitar Custom และ Guitar Selection รองรับลิงก์ youtube.com/watch และ youtu.be</p>
          </div>}
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase font-bold text-[#ee4d2d]">ลิงก์ร้านค้า Shopee</label>
            <Input value={formData.shopee_url} onChange={(e) => setFormData({...formData, shopee_url: e.target.value})} placeholder="https://shopee.co.th/..." className="mt-1 h-10 rounded-none border-border" />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase font-bold text-[#0f146d]">ลิงก์ร้านค้า Lazada</label>
            <Input value={formData.lazada_url} onChange={(e) => setFormData({...formData, lazada_url: e.target.value})} placeholder="https://www.lazada.co.th/..." className="mt-1 h-10 rounded-none border-border" />
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="bg-secondary/40 border border-border p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="text-xs tracking-[0.16em] text-foreground uppercase font-bold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-brand" /> รูปภาพสินค้าจากหลายมุม (อัปโหลดจากเครื่อง)
              </label>
              <p className="text-xs text-muted-foreground mt-1">คลิกปุ่มด้านขวาเพื่อเลือกไฟล์รูปภาพจากคอมพิวเตอร์ (เลือกหลายรูปพร้อมกันได้ทันที)</p>
            </div>
            <div>
              <input
                type="file"
                id="local-images-upload-btn"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleLocalFilesUpload}
              />
              <Button
                type="button"
                onClick={() => document.getElementById("local-images-upload-btn")?.click()}
                className="h-11 rounded-none bg-brand text-brand-foreground text-xs uppercase tracking-wider px-6 font-bold shadow-sm hover:opacity-90"
              >
                <Upload className="mr-2 h-4 w-4" /> เลือกรูปจากเครื่อง (หลายรูป)
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">รายการรูปภาพที่อัปโหลด ({formData.image_urls.length} รูป)</p>
            {formData.image_urls.length === 0 ? (
              <div className="p-6 border border-dashed border-border text-center text-xs text-muted-foreground">
                ยังไม่มีรูปภาพ กรุณากดปุ่ม "เลือกรูปจากเครื่อง (หลายรูป)" ด้านบน
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 bg-secondary/20 p-2.5 border border-border">
                    <div className="h-16 w-16 bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={url && url.trim() !== "" ? url : "/fonzo-logo.png"}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/fonzo-logo.png"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-brand uppercase tracking-widest font-bold truncate">
                        {index === 0 ? "รูปหลักหน้าปก (Primary)" : `มุมมองที่ ${index + 1}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">อัปโหลดเรียบร้อย</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveImage(index)} className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">รายละเอียด / ประวัติความเป็นมา</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} placeholder="รายละเอียดสเปครวม..." className="w-full mt-1 p-3 text-xs bg-transparent border border-border rounded-none focus:outline-none focus:border-brand" />
        </div>

          {productType === "guitar" ? (
          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest font-semibold text-brand">สเปคชิ้นส่วนและชนิดไม้ (Guitar Specifications)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Top Wood (ไม้หน้า)</label>
                <Input value={guitarSpecs.top_wood} onChange={(e) => setGuitarSpecs({...guitarSpecs, top_wood: e.target.value})} placeholder="กรุณากรอก Top Wood" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Back & Sides (ไม้ข้างและหลัง)</label>
                <Input value={guitarSpecs.back_sides} onChange={(e) => setGuitarSpecs({...guitarSpecs, back_sides: e.target.value})} placeholder="กรุณากรอก Back & Sides" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Neck (คอกีตาร์)</label>
                <Input value={guitarSpecs.neck} onChange={(e) => setGuitarSpecs({...guitarSpecs, neck: e.target.value})} placeholder="กรุณากรอก Neck" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Fingerboard (ฟิงเกอร์บอร์ด)</label>
                <Input value={guitarSpecs.fingerboard} onChange={(e) => setGuitarSpecs({...guitarSpecs, fingerboard: e.target.value})} placeholder="กรุณากรอก Fingerboard" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Scale Length (สเกล - หน่วย mm)</label>
                <div className="relative mt-1">
                  <Input value={guitarSpecs.scale_length} onChange={(e) => setGuitarSpecs({...guitarSpecs, scale_length: e.target.value})} placeholder="กรุณากรอก Scale Length" className="h-9 rounded-none border-border pr-12" />
                  <span className="absolute right-3 top-2 text-xs text-muted-foreground font-semibold">mm</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Nut Width (ความกว้างนัท - หน่วย mm)</label>
                <div className="relative mt-1">
                  <Input value={guitarSpecs.nut_width} onChange={(e) => setGuitarSpecs({...guitarSpecs, nut_width: e.target.value})} placeholder="กรุณากรอก Nut Width" className="h-9 rounded-none border-border pr-12" />
                  <span className="absolute right-3 top-2 text-xs text-muted-foreground font-semibold">mm</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Bridge (สะพานสาย)</label>
                <Input value={guitarSpecs.bridge} onChange={(e) => setGuitarSpecs({...guitarSpecs, bridge: e.target.value})} placeholder="กรุณากรอก Bridge" className="mt-1 h-9 rounded-none border-border" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase">Finish (เคลือบผิว)</label>
                <Input value={guitarSpecs.finish} onChange={(e) => setGuitarSpecs({...guitarSpecs, finish: e.target.value})} placeholder="กรุณากรอก Finish" className="mt-1 h-9 rounded-none border-border" />
              </div>
              {purchaseMode === "custom" && extraGuitarSpecs.map((item, index) => <div key={`${item.key}-${index}`} className="space-y-1">
                <label className="text-[11px] text-muted-foreground uppercase">หัวข้อสเปกเพิ่มเติม</label>
                <div className="flex gap-2">
                  <Input value={item.key} onChange={event => setExtraGuitarSpecs(current => current.map((entry, row) => row === index ? { ...entry, key: event.target.value } : entry))} placeholder="ชื่อหัวข้อ เช่น ปิ๊กการ์ด" className="h-9 rounded-none border-border" />
                  <Input value={item.value} onChange={event => setExtraGuitarSpecs(current => current.map((entry, row) => row === index ? { ...entry, value: event.target.value } : entry))} placeholder={`กรุณากรอก ${item.key || "รายละเอียด"}`} className="h-9 rounded-none border-border" />
                  <Button type="button" variant="outline" onClick={() => setExtraGuitarSpecs(current => current.filter((_, row) => row !== index))} className="h-9 w-9 shrink-0 rounded-none p-0 text-red-500" aria-label="ลบหัวข้อสเปก"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>)}
              {purchaseMode === "custom" && <Button type="button" variant="outline" onClick={() => setExtraGuitarSpecs(current => [...current, { key: "", value: "" }])} className="h-9 rounded-none text-xs"><Plus className="mr-2 h-3.5 w-3.5" />เพิ่มหัวข้อสเปก</Button>}
            </div>
          </div>
        ) : productType === "accessory" ? (
          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest font-semibold text-brand">สเปคสายกีตาร์และอุปกรณ์เสริม (Strings & Accessories Specs)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isStringAccessory && <div>
                <label className="text-[11px] text-muted-foreground uppercase">String Gauge (เบอร์สาย)</label>
                <Input value={accessorySpecs.string_gauge} onChange={(e) => setAccessorySpecs({...accessorySpecs, string_gauge: e.target.value})} placeholder="12-53 (Light)" className="mt-1 h-9 rounded-none border-border" />
              </div>}
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
        ) : (
          <div className="border-t border-border pt-6"><div className="border border-brand/20 bg-brand/5 p-5 text-sm leading-relaxed text-muted-foreground">คอร์สเรียนของพี่เบิร์ดใช้ชื่อ ราคา รายละเอียด รูปภาพ และลิงก์ร้านค้าจากช่องด้านบนเป็นข้อมูลหลัก สามารถทยอยเพิ่มหรือแก้ไขรายการได้จากแท็บนี้ใน Admin</div></div>
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
