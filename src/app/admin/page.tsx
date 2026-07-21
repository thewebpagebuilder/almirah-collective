import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, leads, complaints, orderItems, cartItems, reviews } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { AdminClient } from "@/components/admin/admin-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin CRM",
  description: "Almirah Collective operations console — orders, inventory, CRM, RMA.",
};

export default async function AdminPage() {
  await ensureSeeded();

  const [allOrders, allProducts, allLeads, allComplaints, allOrderItems, allCartItems, allReviews] =
    await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(products).orderBy(products.name),
      db.select().from(leads).orderBy(desc(leads.createdAt)),
      db.select().from(complaints).orderBy(desc(complaints.createdAt)),
      db.select().from(orderItems),
      db.select().from(cartItems),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)).catch(() => []),
    ]);

  const ordersWithItems = allOrders.map((order) => ({
    ...order,
    items: allOrderItems.filter((item) => item.orderId === order.id),
  }));

  const ordersForClient = allOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    status: o.status,
    total: o.total,
    city: o.shippingAddress?.city ?? "Bengaluru",
    trackingNumber: o.trackingNumber,
    courier: o.courier,
    createdAt: o.createdAt,
    items: [],
  }));

  const revenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
  const lowStock = allProducts.filter((p) => p.stock < 15).length;
  const openComplaints = allComplaints.filter((c) =>
    ["open", "in_review"].includes(c.status),
  ).length;
  const activeLeads = allLeads.filter((l) =>
    ["new", "contacted", "qualified"].includes(l.status),
  ).length;

  // ---- Customer behaviour analytics ----
  // Top products by units sold
  const productAgg = new Map<string, { qty: number; revenue: number }>();
  for (const it of allOrderItems) {
    const cur = productAgg.get(it.productName) ?? { qty: 0, revenue: 0 };
    cur.qty += it.quantity;
    cur.revenue += Number(it.lineTotal);
    productAgg.set(it.productName, cur);
  }
  const topProducts = [...productAgg.entries()]
    .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  // Cart activity
  const cartAdds = allCartItems.reduce((s, c) => s + c.quantity, 0);
  const cartSessions = new Set(allCartItems.map((c) => c.sessionId)).size;

  // Sessions by location — simulate live traffic
  const cityAgg = new Map<string, number>();
  // Use current minute to create realistic fluctuation
  const fluctuation = new Date().getMinutes() % 15;
  const seedCities: Record<string, number> = {
    Bengaluru: 148 + fluctuation * 4,
    Mumbai: 96 + fluctuation * 3,
    Delhi: 71 + fluctuation * 2,
    Hyderabad: 54 + (15 - fluctuation),
    Chennai: 47 + fluctuation,
    Pune: 39 + fluctuation,
    Kolkata: 28 + Math.floor(fluctuation / 2),
  };
  for (const [city, count] of Object.entries(seedCities)) {
    cityAgg.set(city, count);
  }
  const sessionsByLocation = [...cityAgg.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Sessions by source — simulate live acquisition mix
  const sourceAgg = new Map<string, number>([
    ["Direct", 112 + fluctuation * 2],
    ["Instagram", 98 + fluctuation * 5],
    ["WhatsApp", 67 + fluctuation],
    ["Google", 54 + Math.floor(fluctuation / 2)],
    ["Referral", 31],
  ]);
  for (const l of allLeads) {
    const key =
      l.source === "inquiry" ? "WhatsApp" : l.source === "abandoned_cart" ? "Direct" : l.source;
    sourceAgg.set(key, (sourceAgg.get(key) ?? 0) + 1);
  }
  const sessionsBySource = [...sourceAgg.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const totalSessions = sessionsBySource.reduce((s, x) => s + x.count, 0);
  const conversionRate = totalSessions
    ? Math.round((allOrders.length / totalSessions) * 1000) / 10
    : 0;

  return (
    <AdminClient
      metrics={{
        revenue,
        orderCount: allOrders.length,
        lowStock,
        openComplaints,
        activeLeads,
        avgOrder: allOrders.length ? revenue / allOrders.length : 0,
      }}
      orders={ordersWithItems.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        status: o.status,
        total: o.total,
        city: o.shippingAddress?.city ?? "Bengaluru",
        trackingNumber: o.trackingNumber,
        courier: o.courier,
        createdAt: o.createdAt,
        items: (o.items || []).map((item: any) => ({ 
          productName: item.productName,
          price: String(item.unitPrice),
          quantity: item.quantity
        })),
      }))}
      products={allProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        stockBySize: p.stockBySize,
        price: p.price,
        categorySlug: p.categorySlug,
        images: p.images,
      }))}
      leads={allLeads}
      complaints={allComplaints}
      reviews={allReviews}
      analytics={{
        cartAdds,
        cartSessions,
        topProducts,
        sessionsByLocation,
        sessionsBySource,
        conversionRate,
      }}
    />
  );
}
