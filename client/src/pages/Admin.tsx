/**
 * Shop console — orders, enquiries, newsroom feed, and Supabase stock management.
 */

import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { Inbox, Loader2, Lock, Package, PackageSearch, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PageHeading } from "@/components/site/SiteLayout";
import { NewsroomAdmin } from "@/components/site/NewsroomAdmin";
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
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type OrderStatus = "pending" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
];

const ENQUIRY_STATUSES = ["new", "in_progress", "closed"] as const;

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
  const [tab, setTab] = useState<Tab>("orders");

  const handleLoginClick = () => {
    try {
      if (typeof startLogin === "function") {
        startLogin();
      } else {
        window.location.href = "/api/auth/login";
      }
    } catch {
      window.location.href = "/api/auth/login";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageHeading
          eyebrow={t("สำหรับทีมงาน", "Staff only")}
          title={t("จัดการร้าน", "Shop console")}
          crumbs={[{ label: t("จัดการร้าน", "Shop console") }]}
        />
        <section className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <Lock className="mx-auto h-7 w-7 text-brand" strokeWidth={1.4} />
          <p className="mt-5 text-sm text-muted-foreground">
            {t("กรุณาเข้าสู่ระบบด้วยบัญชีทีมงาน", "Please sign in with a staff account.")}
          </p>
          <Button
            type="button"
            onClick={handleLoginClick}
            className="press mt-6 h-11 rounded-none bg-brand px-8 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
            {t("เข้าสู่ระบบ", "Sign in")}
          </Button>
        </section>
      </>
    );
  }

  if (user?.role !== "admin") {
    return (
      <>
        <PageHeading
          eyebrow={t("สำหรับทีมงาน", "Staff only")}
          title={t("จัดการร้าน", "Shop console")}
          crumbs={[{ label: t("จัดการร้าน", "Shop console") }]}
        />
        <section className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <Lock className="mx-auto h-7 w-7 text-brand" strokeWidth={1.4} />
          <p className="mt-5 text-sm text-muted-foreground">
            {t(
              "บัญชีนี้ไม่มีสิทธิ์เข้าถึงหน้าจัดการร้าน",
              "This account does not have access to the shop console.",
            )}
          </p>
          <Button
            asChild
            variant="outline"
            className="press mt-6 h-11 rounded-none border-foreground/25 px-8 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand">
            <Link href="/">{t("กลับหน้าแรก", "Back to home")}</Link>
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
        description={t(
          "อัปเดตสถานะและเลขพัสดุของคำสั่งซื้อ ปรับสต็อกสินค้า ดูแลข้อความติดต่อจากลูกค้า และจัดการคอนเทนต์",
          "Update order status, manage guitar stock, follow up on enquiries, and curate the homepage feed.",
        )}
        crumbs={[{ label: t("จัดการร้าน", "Shop console") }]}
      />

      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 border-b border-border/70 pb-5">
          {(
            [
              { key: "orders", label: t("คำสั่งซื้อ", "Orders") },
              { key: "stock", label: t("สต็อกสินค้า", "Inventory") },
              { key: "enquiries", label: t("ข้อความติดต่อ", "Enquiries") },
              { key: "newsroom", label: t("คอนเทนต์หน้าแรก", "Newsroom") },
            ] as const
          ).map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "press border px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase",
                tab === item.key
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand",
              )}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "orders" && <OrdersPanel />}
          {tab === "stock" && <StockPanel />}
          {tab === "enquiries" && <EnquiriesPanel />}
          {tab === "newsroom" && <NewsroomAdmin />}
        </div>
      </section>
    </>
  );
}

/* ==================== แผงจัดการสต็อกสินค้า (Supabase) ==================== */
function StockPanel() {
  const { t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    price: 0,
    stock: 0,
    category: "Acoustic",
    image_url: ""
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
    if (error) toast.error(t("ดึงข้อมูลไม่สำเร็จ: ", "Fetch failed: ") + error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (id: number, newStock: number) => {
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
    if (error) toast.error(t("อัปเดตสต็อกไม่สำเร็จ", "Stock update failed"));
    else {
      toast.success(t("อัปเดตสต็อกเรียบร้อย", "Stock updated successfully"));
      fetchProducts();
    }
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
    else {
      toast.success(t("ลบสินค้าเรียบร้อย", "Product deleted"));
      fetchProducts();
    }
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
            <Input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="e.g. Fonzo F-30 Custom"
              className="mt-1 h-10 rounded-none border-border"
            />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("ราคา (บาท)", "Price (THB)")}</label>
            <Input
              type="number"
              value={newProduct.price || ""}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              placeholder="0"
              className="mt-1 h-10 rounded-none border-border"
            />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{t("จำนวนสต็อกเริ่มต้น", "Stock")}</label>
            <Input
              type="number"
              value={newProduct.stock || ""}
              onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              placeholder="0"
              className="mt-1 h-10 rounded-none border-border"
            />
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
                    <Input
                      type="number"
                      defaultValue={p.stock}
                      onBlur={(e) => handleUpdateStock(p.id!, Number(e.target.value))}
                      className="w-24 h-9 text-center font-bold border-border rounded-none"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(p.id!)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 p-0"
                    >
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

function OrdersPanel() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const { data: orders = [], isLoading } = trpc.orders.listAll.useQuery();

  const setStatus = trpc.orders.setStatus.useMutation({
    onSuccess: () => {
      utils.orders.listAll.invalidate();
      toast.success(t("อัปเดตคำสั่งซื้อแล้ว", "Order updated"));
    },
    onError: error => toast.error(error.message || t("อัปเดตไม่สำเร็จ", "Update failed")),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-secondary" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        <PackageSearch className="mx-auto mb-3 h-6 w-6" strokeWidth={1.3} />
        {t("ยังไม่มีคำสั่งซื้อที่ลงทะเบียน", "No registered orders yet.")}
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map(order => (
        <OrderRow
          key={order.id}
          order={order}
          pending={setStatus.isPending}
          onSave={patch => setStatus.mutate({ id: order.id, ...patch })}
        />
      ))}
    </ul>
  );
}

type OrderRowProps = {
  order: {
    id: number;
    orderNumber: string;
    email: string;
    status: string;
    trackingNumber: string | null;
    carrier: string | null;
    note: string | null;
    totalAmount: string | null;
    currencyCode: string | null;
    createdAt: Date;
  };
  pending: boolean;
  onSave: (patch: {
    status?: OrderStatus;
    trackingNumber?: string | null;
    carrier?: string | null;
    note?: string | null;
  }) => void;
};

function OrderRow({ order, pending, onSave }: OrderRowProps) {
  const { t } = useLocale();
  const [status, setStatus] = useState<OrderStatus>(order.status as OrderStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [note, setNote] = useState(order.note ?? "");

  const dirty =
    status !== order.status ||
    trackingNumber !== (order.trackingNumber ?? "") ||
    carrier !== (order.carrier ?? "") ||
    note !== (order.note ?? "");

  const statusLabels: Record<OrderStatus, string> = {
    pending: t("รอชำระเงิน", "Pending"),
    paid: t("ชำระเงินแล้ว", "Paid"),
    in_production: t("กำลังเตรียมสินค้า", "In production"),
    shipped: t("จัดส่งแล้ว", "Shipped"),
    delivered: t("ส่งถึงแล้ว", "Delivered"),
    cancelled: t("ยกเลิก", "Cancelled"),
  };

  return (
    <li className="border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-display text-lg">#{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {order.email} · {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        {order.totalAmount && (
          <p className="text-sm">
            {order.currencyCode ?? "THB"} {order.totalAmount}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {t("สถานะ", "Status")}
          </label>
          <Select value={status} onValueChange={value => setStatus(value as OrderStatus)}>
            <SelectTrigger className="mt-2 h-11 rounded-none border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map(value => (
                <SelectItem key={value} value={value}>
                  {statusLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {t("เลขพัสดุ", "Tracking number")}
          </label>
          <Input
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            className="mt-2 h-11 rounded-none border-border"
          />
        </div>
        <div>
          <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {t("ผู้ให้บริการขนส่ง", "Carrier")}
          </label>
          <Input
            value={carrier}
            onChange={e => setCarrier(e.target.value)}
            className="mt-2 h-11 rounded-none border-border"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {t("บันทึกถึงลูกค้า", "Note to customer")}
        </label>
        <Textarea
          rows={2}
          value={note}
          onChange={e => setNote(e.target.value)}
          className="mt-2 rounded-none border-border"
        />
      </div>

      <Button
        type="button"
        disabled={!dirty || pending}
        onClick={() =>
          onSave({
            status,
            trackingNumber: trackingNumber.trim() || null,
            carrier: carrier.trim() || null,
            note: note.trim() || null,
          })
        }
        className="press mt-5 h-11 rounded-none bg-brand px-7 text-[11px] tracking-[0.18em] text-brand-foreground uppercase hover:bg-brand/90">
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" strokeWidth={1.6} />
        )}
        {t("บันทึก", "Save")}
      </Button>
    </li>
  );
}

function EnquiriesPanel() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const { data: enquiries = [], isLoading } = trpc.enquiry.list.useQuery();
  const [filter, setFilter] = useState<"all" | "new" | "in_progress" | "closed">("all");

  const setStatus = trpc.enquiry.setStatus.useMutation({
    onSuccess: () => {
      utils.enquiry.list.invalidate();
      toast.success(t("อัปเดตสถานะแล้ว", "Status updated"));
    },
    onError: error => toast.error(error.message || t("อัปเดตไม่สำเร็จ", "Update failed")),
  });

  const statusLabels: Record<string, string> = {
    new: t("ใหม่", "New"),
    in_progress: t("กำลังดูแล", "In progress"),
    closed: t("ปิดเรื่อง", "Closed"),
  };

  const visible = useMemo(
    () => (filter === "all" ? enquiries : enquiries.filter(item => item.status === filter)),
    [enquiries, filter],
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-secondary" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(["all", ...ENQUIRY_STATUSES] as const).map(value => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "press border px-4 py-2 text-[11px] tracking-[0.16em] uppercase",
              filter === value
                ? "border-brand text-brand"
                : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand",
            )}>
            {value === "all" ? t("ทั้งหมด", "All") : statusLabels[value]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          <Inbox className="mx-auto mb-3 h-6 w-6" strokeWidth={1.3} />
          {t("ยังไม่มีข้อความในหมวดนี้", "No enquiries in this view.")}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map(enquiry => (
            <li key={enquiry.id} className="border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-display text-lg">{enquiry.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {enquiry.email}
                    {enquiry.phone ? ` · ${enquiry.phone}` : ""} ·{" "}
                    {new Date(enquiry.createdAt).toLocaleString()}
                  </p>
                </div>
                <Select
                  value={enquiry.status}
                  onValueChange={value =>
                    setStatus.mutate({
                      id: enquiry.id,
                      status: value as (typeof ENQUIRY_STATUSES)[number],
                    })
                  }>
                  <SelectTrigger className="h-10 w-40 rounded-none border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENQUIRY_STATUSES.map(value => (
                      <SelectItem key={value} value={value}>
                        {statusLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {enquiry.subject && <p className="mt-4 text-sm font-medium">{enquiry.subject}</p>}
              {enquiry.productCode && (
                <Link
                  href={`/guitar/${enquiry.productCode}`}
                  className="mt-1 inline-block text-xs text-brand hover:underline">
                  {t("สินค้าที่สอบถาม", "Enquired product")}: {enquiry.productCode}
                </Link>
              )}
              <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                {enquiry.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}