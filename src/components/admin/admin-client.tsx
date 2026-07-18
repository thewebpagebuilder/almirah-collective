"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  DollarSign,
  LayoutDashboard,
  MapPin,
  Package,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: string;
  city?: string;
  trackingNumber: string | null;
  courier: string | null;
  createdAt: Date | string;
  customerPhone?: string | null;
  items?: { productName: string; price?: string; quantity?: number }[];
};

type Product = {
  id: number;
  name: string;
  slug: string;
  stock: number;
  stockBySize: Record<string, number>;
  price: string;
  compareAtPrice?: string | null;
  categorySlug: string;
  images: string[];
};

type Lead = {
  id: number;
  email: string;
  name: string | null;
  source: string;
  status: string;
  cartValue: string | null;
  notes: string | null;
  createdAt: Date | string;
};

type Complaint = {
  id: number;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  type: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  createdAt: Date | string;
};

type TopProduct = { name: string; qty: number; revenue: number };

type Analytics = {
  cartAdds: number;
  cartSessions: number;
  topProducts: TopProduct[];
  sessionsByLocation: { label: string; count: number }[];
  sessionsBySource: { label: string; count: number }[];
  conversionRate: number;
};

type Props = {
  metrics: {
    revenue: number;
    orderCount: number;
    lowStock: number;
    openComplaints: number;
    activeLeads: number;
    avgOrder: number;
  };
  orders: Order[];
  products: Product[];
  leads: Lead[];
  complaints: Complaint[];
  analytics: Analytics;
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "crm", label: "Leads CRM", icon: Users },
  { id: "financials", label: "Financials", icon: DollarSign },
  { id: "analytics", label: "Customer Behaviour", icon: BarChart3 },
  { id: "rma", label: "Complaints & RMA", icon: Ticket },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ORDER_STATUSES = [
  "placed",
  "confirming",
  "packed",
  "dispatched",
  "on_the_way",
  "delivered",
  "cancelled",
  "returned",
] as const;

const COMPLAINT_STATUSES = [
  "open",
  "in_review",
  "approved",
  "rejected",
  "resolved",
] as const;

type RangeId = "7d" | "30d" | "90d" | "custom";

const RANGES: { id: RangeId; label: string }[] = [
  { id: "7d", label: "Week" },
  { id: "30d", label: "Month" },
  { id: "90d", label: "Quarter" },
  { id: "custom", label: "Custom" },
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function AdminClient({
  metrics,
  orders,
  products,
  leads,
  complaints,
  analytics,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const [range, setRange] = useState<RangeId>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({ name: "", description: "", price: "", categorySlug: "womens-wear", imageFile: null as File | null, stockBySize: { S: 0, L: 0, XL: 0, XXL: 0, "Free Size": 0 } });

  // ---- Financials: date-range filtering ----
  const { from, to } = useMemo(() => {
    const end = startOfDay(new Date());
    if (range === "custom") {
      const f = customFrom ? startOfDay(new Date(customFrom)) : null;
      const t = customTo ? startOfDay(new Date(customTo)) : end;
      return { from: f, to: t };
    }
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - (days - 1));
    return { from: start, to: end };
  }, [range, customFrom, customTo]);

  const rangedOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = startOfDay(new Date(o.createdAt));
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [orders, from, to]);

  const finStats = useMemo(() => {
    const value = rangedOrders.reduce((s, o) => s + Number(o.total), 0);
    const volume = rangedOrders.length;
    const aov = volume ? value / volume : 0;
    // daily buckets across the selected window
    const buckets: { label: string; value: number; volume: number }[] = [];
    if (!from || !to) return { value, volume, aov, buckets };
    const totalDays = Math.max(1, daysBetween(from, to) + 1);
    const cursor = new Date(from);
    for (let i = 0; i < totalDays; i++) {
      const key = cursor.toISOString().slice(0, 10);
      const dayOrders = rangedOrders.filter(
        (o) => new Date(o.createdAt).toISOString().slice(0, 10) === key,
      );
      buckets.push({
        label: cursor.toLocaleDateString("en-IN", {
          day: "numeric",
          month: i === 0 || i === totalDays - 1 ? "short" : undefined,
        }),
        value: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        volume: dayOrders.length,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return { value, volume, aov, buckets };
  }, [rangedOrders, from, to]);

  async function updateOrder(id: number, status: string) {
    setMessage("");
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        trackingNumber:
          status === "dispatched" ? `BD${Date.now().toString().slice(-8)}` : undefined,
        courier: status === "dispatched" ? "BlueDart" : undefined,
      }),
    });
    if (!res.ok) return setMessage("Failed to update order");
    setMessage("Order updated");
    startTransition(() => router.refresh());
  }

  async function updateProductPricing(id: number, price: string, compareAtPrice: string) {
    setMessage("");
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, price, compareAtPrice }),
    });
    if (!res.ok) return setMessage("Failed to update pricing");
    setMessage("Pricing updated");
    startTransition(() => router.refresh());
  }

  async function updateStockBySize(id: number, currentStock: Record<string, number>, size: string, change: number) {
    setMessage("");
    const newStock = { ...currentStock, [size]: Math.max(0, (currentStock[size] || 0) + change) };
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stockBySize: newStock }),
    });
    if (!res.ok) return setMessage("Failed to update stock");
    setMessage("Inventory updated");
    startTransition(() => router.refresh());
  }

  async function uploadProductImage(id: number, currentImages: string[], e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage("Uploading image...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) return setMessage("Failed to upload image");
      const { url } = await uploadRes.json();
      
      const newImages = [url, ...currentImages];
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, images: newImages }),
      });
      if (!res.ok) return setMessage("Failed to update product images");
      
      setMessage("Image updated successfully");
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage("An error occurred during upload");
    }
  }
  
  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProductForm.imageFile) return setMessage("Please select an image");
    
    setMessage("Uploading image...");
    const formData = new FormData();
    formData.append("file", newProductForm.imageFile);

    try {
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) return setMessage("Failed to upload image");
      const { url } = await uploadRes.json();

      setMessage("Creating product...");
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProductForm, image: url }),
      });
      if (!res.ok) return setMessage("Failed to create product");
      
      setMessage("Product added");
      setShowNewProduct(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage("An error occurred");
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setMessage("Deleting...");
    const res = await fetch(`/api/admin/inventory?id=${id}`, { method: "DELETE" });
    if (!res.ok) return setMessage("Failed to delete");
    setMessage("Product deleted");
    startTransition(() => router.refresh());
  }

  async function updateComplaint(id: number, status: string) {
    setMessage("");
    const res = await fetch("/api/admin/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNotes: `Status set to ${status}` }),
    });
    if (!res.ok) return setMessage("Failed to update complaint");
    setMessage("Ticket updated");
    startTransition(() => router.refresh());
  }

  const maxBucketValue = Math.max(1, ...finStats.buckets.map((b) => b.value));
  const maxBucketVolume = Math.max(1, ...finStats.buckets.map((b) => b.volume));

  return (
    <div className="min-h-screen bg-[#0f0f10] text-pearl">
      <div className="border-b border-pearl/10 bg-obsidian">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">
              Almirah Collective · Admin CRM
            </p>
            <h1 className="font-serif text-2xl md:text-3xl">Operations Console</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-pearl/50">
            {pending && <span className="animate-pulse">Refreshing…</span>}
            {message && <span className="text-champagne">{message}</span>}
            <a href="/" className="border border-pearl/20 px-3 py-2 hover:border-champagne">
              View storefront
            </a>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-5 md:px-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition",
                tab === t.id
                  ? "border-champagne text-champagne"
                  : "border-transparent text-pearl/45 hover:text-pearl",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8">
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                { label: "Total revenue", value: formatCurrency(metrics.revenue), icon: TrendingUp },
                { label: "Orders", value: String(metrics.orderCount), icon: Package },
                { label: "Avg order", value: formatCurrency(metrics.avgOrder), icon: DollarSign },
                { label: "Active leads", value: String(metrics.activeLeads), icon: Users },
                { label: "Low stock", value: String(metrics.lowStock), icon: AlertTriangle },
                { label: "Open tickets", value: String(metrics.openComplaints), icon: Ticket },
              ].map((m) => (
                <div key={m.label} className="border border-pearl/10 bg-pearl/5 p-5 backdrop-blur">
                  <m.icon className="h-4 w-4 text-champagne" />
                  <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-pearl/40">
                    {m.label}
                  </p>
                  <p className="mt-1 font-serif text-2xl">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border border-pearl/10 p-6">
                <h2 className="font-serif text-xl">Recent orders</h2>
                <ul className="mt-4 space-y-3">
                  {orders.slice(0, 5).map((o) => (
                    <li key={o.id} className="flex items-center justify-between border-b border-pearl/8 pb-3 text-sm">
                      <div>
                        <p className="font-medium">{o.orderNumber}</p>
                        <p className="text-xs text-pearl/40">{o.customerName}</p>
                        {o.items && o.items.length > 0 && (
                          <p className="text-[10px] text-pearl/60 line-clamp-1">
                            {o.items.map((item: any) => item.productName).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(o.total)}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-champagne">
                          {o.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-pearl/10 p-6">
                <h2 className="font-serif text-xl">Low stock alerts</h2>
                <ul className="mt-4 space-y-3">
                  {products.filter((p) => p.stock < 15).slice(0, 6).map((p) => (
                    <li key={p.id} className="flex items-center justify-between border-b border-pearl/8 pb-3 text-sm">
                      <span>{p.name}</span>
                      <span className={cn("text-[11px] uppercase tracking-[0.12em]", p.stock < 10 ? "text-red-400" : "text-champagne")}>
                        {p.stock} left
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h2 className="font-serif text-3xl">Order &amp; delivery management</h2>
            <p className="mt-2 text-sm text-pearl/45">
              Kanban-style status pipeline — update to print-ready tracking numbers.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {["placed", "confirming", "packed", "dispatched", "on_the_way", "delivered"].map((status) => (
                <div key={status} className="border border-pearl/10 bg-pearl/[0.03]">
                  <div className="border-b border-pearl/10 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-champagne">
                      {status.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-pearl/40">
                      {orders.filter((o) => o.status === status).length} orders
                    </p>
                  </div>
                  <div className="max-h-[480px] space-y-3 overflow-y-auto p-3">
                    {orders.filter((o) => o.status === status).map((o) => (
                      <div key={o.id} className="border border-pearl/10 bg-obsidian p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-widest text-pearl/50">{o.orderNumber}</p>
                          <p className="text-sm font-serif">{formatCurrency(o.total)}</p>
                        </div>
                        <p className="text-sm font-medium mt-2">{o.customerName}</p>
                        <p className="text-xs text-champagne">{o.customerEmail}</p>
                        {o.items && o.items.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-pearl/10 pt-3">
                            {o.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-start text-xs">
                                <span className="text-pearl/70 pr-2 leading-tight">{item.quantity}x {item.productName}</span>
                                <span className="text-pearl/40">{item.price ? formatCurrency(item.price) : ""}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {o.trackingNumber && (
                          <p className="mt-3 text-[10px] text-pearl/35 border-t border-pearl/10 pt-2">
                            {o.courier} · {o.trackingNumber}
                          </p>
                        )}
                        <select
                          className="mt-3 w-full border border-pearl/15 bg-transparent px-2 py-1.5 text-xs"
                          value={o.status}
                          onChange={(e) => updateOrder(o.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-obsidian">
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "inventory" && (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl">Inventory management</h2>
              <button onClick={() => setShowNewProduct(true)} className="bg-champagne px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-obsidian font-bold">
                + Add New Product
              </button>
            </div>
            
            {showNewProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 p-4">
                <form onSubmit={createProduct} className="w-full max-w-lg bg-obsidian p-6 border border-pearl/20 overflow-y-auto max-h-[90vh]">
                  <h3 className="font-serif text-2xl mb-4 text-champagne">Add New Product</h3>
                  <div className="space-y-4 text-sm">
                    <input required placeholder="Product Name" className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} />
                    <textarea required placeholder="Description (Supports HTML for bullet points)" rows={4} className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.description} onChange={e => setNewProductForm({...newProductForm, description: e.target.value})} />
                    <input required type="number" placeholder="Price (INR)" className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.price} onChange={e => setNewProductForm({...newProductForm, price: e.target.value})} />
                    <input required type="file" accept="image/*" className="w-full bg-transparent border border-pearl/20 px-3 py-2 text-pearl/50 file:mr-4 file:bg-champagne file:text-obsidian file:px-3 file:py-1 file:border-0 file:text-xs file:uppercase file:font-bold file:tracking-widest" onChange={e => setNewProductForm({...newProductForm, imageFile: e.target.files?.[0] || null})} />
                    
                    <select className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.categorySlug} onChange={e => setNewProductForm({...newProductForm, categorySlug: e.target.value})}>
                      <option className="bg-obsidian" value="womens-wear">Women's Wear</option>
                      <option className="bg-obsidian" value="mens-wear">Men's Wear</option>
                      <option className="bg-obsidian" value="indian-casuals">Indian Casuals</option>
                      <option className="bg-obsidian" value="dresses">Dresses</option>
                      <option className="bg-obsidian" value="co-ord-sets">Co-ord Sets</option>
                      <option className="bg-obsidian" value="blouses-tops">Blouses & Tops</option>
                      <option className="bg-obsidian" value="active-wear">Active-Wear</option>
                    </select>

                    <div className="pt-2 border-t border-pearl/10">
                      <p className="text-[10px] uppercase tracking-widest text-champagne mb-2">Initial Stock</p>
                      <div className="grid grid-cols-2 gap-3">
                        {["S", "L", "XL", "XXL", "Free Size"].map(s => (
                          <label key={s} className="flex items-center justify-between border border-pearl/10 px-2 py-1">
                            <span className="text-xs">{s}</span>
                            <input type="number" min="0" className="w-16 bg-transparent text-right outline-none" value={(newProductForm.stockBySize as any)[s]} onChange={e => setNewProductForm({...newProductForm, stockBySize: {...newProductForm.stockBySize, [s]: parseInt(e.target.value) || 0}})} />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowNewProduct(false)} className="px-4 py-2 text-xs uppercase tracking-widest text-pearl/50 hover:text-pearl">Cancel</button>
                    <button type="submit" className="bg-champagne px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-obsidian font-bold">Save Product</button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-6 overflow-x-auto border border-pearl/10">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-pearl/5 text-[10px] uppercase tracking-[0.15em] text-pearl/45">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category / Price</th>
                    <th className="px-4 py-3 min-w-[320px]">Stock by Size (+ / -)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-pearl/8">
                      <td className="px-4 py-3 align-top max-w-[200px]">
                        <p className="line-clamp-2">{p.name}</p>
                        <p className="text-[10px] text-champagne mt-1">Total Stock: {p.stock}</p>
                        <div className="mt-3">
                          <label className="cursor-pointer border border-pearl/20 px-2 py-1 text-[9px] uppercase tracking-widest text-pearl/50 hover:bg-pearl/5">
                            Upload Image
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadProductImage(p.id, p.images || [], e)} />
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top capitalize text-pearl/60">
                        {p.categorySlug.replace(/-/g, " ")}
                        <div className="mt-3 space-y-1.5 w-32">
                          <label className="flex items-center justify-between gap-2">
                            <span className="text-[9px] uppercase tracking-widest text-champagne">Sell</span>
                            <input type="number" defaultValue={p.price} onBlur={(e) => updateProductPricing(p.id, e.target.value, p.compareAtPrice || "")} className="w-16 bg-transparent border border-pearl/20 px-1 py-0.5 text-pearl text-right text-xs" />
                          </label>
                          <label className="flex items-center justify-between gap-2">
                            <span className="text-[9px] uppercase tracking-widest text-pearl/40">MRP</span>
                            <input type="number" defaultValue={p.compareAtPrice || ""} placeholder="-" onBlur={(e) => updateProductPricing(p.id, p.price, e.target.value)} className="w-16 bg-transparent border border-pearl/20 px-1 py-0.5 text-pearl/50 text-right text-xs line-through" />
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {["S", "L", "XL", "XXL", "Free Size"].map(size => {
                            const val = p.stockBySize?.[size] || 0;
                            return (
                              <div key={size} className="flex items-center justify-between border border-pearl/15 p-1 bg-pearl/[0.02]">
                                <span className="text-pearl/60 w-12 truncate">{size}</span>
                                <span className={cn("font-mono w-6 text-center", val === 0 ? "text-red-400" : "text-champagne")}>{val}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => updateStockBySize(p.id, p.stockBySize, size, -1)} className="px-1.5 bg-pearl/10 hover:bg-pearl/20">−</button>
                                  <button onClick={() => updateStockBySize(p.id, p.stockBySize, size, 1)} className="px-1.5 bg-pearl/10 hover:bg-pearl/20">+</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button onClick={() => deleteProduct(p.id)} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-900/30 px-2 py-1">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "crm" && (
          <div>
            <h2 className="font-serif text-3xl">Lead &amp; customer CRM</h2>
            <p className="mt-2 text-sm text-pearl/45">
              Abandoned carts, inquiries, and conversion pipeline.
            </p>
            <div className="mt-6 overflow-x-auto border border-pearl/10">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-pearl/5 text-[10px] uppercase tracking-[0.15em] text-pearl/45">
                  <tr>
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Cart value</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-t border-pearl/8">
                      <td className="px-4 py-3">
                        <p>{l.name || "—"}</p>
                        <p className="text-xs text-pearl/40">{l.email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{l.source.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">
                        <span className="border border-champagne/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-champagne">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{l.cartValue ? formatCurrency(l.cartValue) : "—"}</td>
                      <td className="max-w-xs px-4 py-3 text-pearl/55">{l.notes}</td>
                      <td className="px-4 py-3 text-pearl/45">{formatDate(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "financials" && (
          <div>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="font-serif text-3xl">Financial reporting</h2>
                <p className="mt-2 text-sm text-pearl/45">
                  Volume (orders) &amp; value (revenue) together for the selected period.
                </p>
              </div>
              {/* Range toggle: Week / Month / Quarter / Custom */}
              <div className="flex flex-wrap items-center gap-2">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRange(r.id)}
                    className={cn(
                      "border px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition",
                      range === r.id
                        ? "border-champagne bg-champagne text-obsidian"
                        : "border-pearl/20 text-pearl/60 hover:border-pearl/50",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {range === "custom" && (
              <div className="mt-4 flex flex-wrap items-center gap-3 border border-pearl/10 p-4">
                <label className="flex items-center gap-2 text-xs text-pearl/60">
                  From
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="border border-pearl/20 bg-transparent px-2 py-1.5 text-pearl [color-scheme:dark]"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-pearl/60">
                  To
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="border border-pearl/20 bg-transparent px-2 py-1.5 text-pearl [color-scheme:dark]"
                  />
                </label>
              </div>
            )}

            {/* Headline volume + value */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-champagne/30 bg-champagne/10 p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-champagne">Value · revenue</p>
                <p className="mt-2 font-serif text-4xl">{formatCurrency(finStats.value)}</p>
              </div>
              <div className="border border-pearl/10 p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-pearl/40">Volume · orders</p>
                <p className="mt-2 font-serif text-4xl">{finStats.volume}</p>
              </div>
              <div className="border border-pearl/10 p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-pearl/40">Avg order value</p>
                <p className="mt-2 font-serif text-4xl">{formatCurrency(finStats.aov)}</p>
              </div>
              <div className="border border-pearl/10 p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-pearl/40">Est. refunds (4%)</p>
                <p className="mt-2 font-serif text-4xl">{formatCurrency(finStats.value * 0.04)}</p>
              </div>
            </div>

            {/* Combined volume + value chart */}
            <div className="mt-6 border border-pearl/10 p-6 h-[400px]">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-pearl/40">
                  Daily revenue &amp; orders
                </p>
                <div className="flex items-center gap-4 text-[11px] text-pearl/60">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-champagne" /> Revenue
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finStats.buckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f2e3c6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f2e3c6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(242, 227, 198, 0.2)' }}
                    itemStyle={{ color: '#f2e3c6' }}
                    labelStyle={{ color: '#888888', marginBottom: '4px' }}
                    formatter={(value: any) => [formatCurrency(value || 0), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#f2e3c6" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="border border-pearl/10 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-pearl/40">Gross revenue</p>
                <p className="mt-2 font-serif text-2xl">{formatCurrency(finStats.value)}</p>
              </div>
              <div className="border border-pearl/10 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-pearl/40">Net payout (est. 93%)</p>
                <p className="mt-2 font-serif text-2xl">{formatCurrency(finStats.value * 0.93)}</p>
              </div>
              <div className="border border-pearl/10 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-pearl/40">Units sold</p>
                <p className="mt-2 font-serif text-2xl">
                  {rangedOrders.length} orders
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="font-serif text-3xl">Customer behaviour</h2>
                <p className="mt-2 text-sm text-pearl/45">
                  Where shoppers come from, what they engage with, and how they convert.
                </p>
              </div>
              <span className="border border-pearl/20 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-pearl/50">
                All-time · demo + live data
              </span>
            </div>

            {/* KPIs */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Sessions", value: analytics.sessionsBySource.reduce((s, x) => s + x.count, 0), icon: Users },
                { label: "Items added to cart", value: analytics.cartAdds, icon: ShoppingBag },
                { label: "Cart sessions", value: analytics.cartSessions, icon: Package },
                { label: "Conversion rate", value: `${analytics.conversionRate}%`, icon: TrendingUp },
              ].map((m) => (
                <div key={m.label} className="border border-pearl/10 bg-pearl/5 p-5">
                  <m.icon className="h-4 w-4 text-champagne" />
                  <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-pearl/40">{m.label}</p>
                  <p className="mt-1 font-serif text-2xl">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Acquisition funnel */}
            <div className="mt-6 border border-pearl/10 p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-pearl/40">Acquisition funnel</p>
              {(() => {
                const sessions = Math.max(
                  1,
                  analytics.sessionsBySource.reduce((s, x) => s + x.count, 0),
                );
                const cart = Math.max(analytics.cartSessions, 1);
                const ordersCount = orders.length || 1;
                const steps = [
                  { label: "Sessions", value: sessions, color: "bg-champagne/80" },
                  { label: "Added to cart", value: cart, color: "bg-champagne/60" },
                  { label: "Orders", value: ordersCount, color: "bg-champagne/40" },
                ];
                const max = sessions;
                return (
                  <div className="mt-5 space-y-3">
                    {steps.map((s) => (
                      <div key={s.label}>
                        <div className="mb-1 flex justify-between text-xs text-pearl/60">
                          <span>{s.label}</span>
                          <span>{s.value}</span>
                        </div>
                        <div className="h-3 w-full bg-pearl/10">
                          <div
                            className={cn("h-full", s.color)}
                            style={{ width: `${Math.max(6, (s.value / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Sessions by location */}
              <div className="border border-pearl/10 p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-champagne" />
                  <h3 className="font-serif text-xl">Sessions by location</h3>
                </div>
                <div className="mt-5 space-y-3">
                  {analytics.sessionsByLocation.map((l) => {
                    const max = Math.max(...analytics.sessionsByLocation.map((x) => x.count), 1);
                    return (
                      <div key={l.label}>
                        <div className="mb-1 flex justify-between text-xs text-pearl/60">
                          <span>{l.label}</span>
                          <span>{l.count}</span>
                        </div>
                        <div className="h-2.5 w-full bg-pearl/10">
                          <div
                            className="h-full bg-gradient-to-r from-champagne/40 to-champagne"
                            style={{ width: `${(l.count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sessions by source */}
              <div className="border border-pearl/10 p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-champagne" />
                  <h3 className="font-serif text-xl">Sessions by source</h3>
                </div>
                <div className="mt-5 space-y-3">
                  {analytics.sessionsBySource.map((l) => {
                    const max = Math.max(...analytics.sessionsBySource.map((x) => x.count), 1);
                    return (
                      <div key={l.label}>
                        <div className="mb-1 flex justify-between text-xs text-pearl/60">
                          <span className="capitalize">{l.label.replace(/_/g, " ")}</span>
                          <span>{l.count}</span>
                        </div>
                        <div className="h-2.5 w-full bg-pearl/10">
                          <div
                            className="h-full bg-gradient-to-r from-champagne/40 to-champagne"
                            style={{ width: `${(l.count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top products */}
            <div className="mt-6 border border-pearl/10">
              <div className="border-b border-pearl/10 px-6 py-4">
                <h3 className="font-serif text-xl">Top products by units</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-pearl/5 text-[10px] uppercase tracking-[0.15em] text-pearl/45">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Units sold</th>
                    <th className="px-6 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((p) => (
                    <tr key={p.name} className="border-t border-pearl/8">
                      <td className="px-6 py-3">{p.name}</td>
                      <td className="px-6 py-3">{p.qty}</td>
                      <td className="px-6 py-3">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                  {analytics.topProducts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-pearl/40">
                        No sales data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "rma" && (
          <div>
            <h2 className="font-serif text-3xl">Complaints &amp; RMA</h2>
            <p className="mt-2 text-sm text-pearl/45">
              Ticketing for returns, replacements, and service recovery.
            </p>
            <div className="mt-6 space-y-4">
              {complaints.map((c) => (
                <article key={c.id} className="grid gap-4 border border-pearl/10 p-5 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-medium">{c.ticketNumber}</p>
                      <span className="border border-pearl/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                        {c.type}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-champagne">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{c.customerName} · {c.customerEmail}</p>
                    <p className="mt-2 text-sm text-pearl/60">{c.reason}</p>
                    {c.adminNotes && (
                      <p className="mt-2 text-xs text-pearl/35">Admin: {c.adminNotes}</p>
                    )}
                    <p className="mt-2 text-xs text-pearl/30">Opened {formatDate(c.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <select
                      className="border border-pearl/15 bg-transparent px-3 py-2 text-xs"
                      value={c.status}
                      onChange={(e) => updateComplaint(c.id, e.target.value)}
                    >
                      {COMPLAINT_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-obsidian">
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
              {complaints.length === 0 && (
                <p className="text-sm text-pearl/45">No open tickets.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
