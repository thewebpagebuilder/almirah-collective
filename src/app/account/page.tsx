"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Package, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/magnetic-button";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { PRODUCTS } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type AccountOrder = {
  id: number | string;
  orderNumber?: string;
  order_number?: string;
  status?: string;
  total?: string | number;
  createdAt?: Date | string;
  created_at?: Date | string;
  items?: {
    productId?: number;
    productName?: string;
    productImage?: string;
    size?: string;
    color?: string;
    quantity?: number;
    unitPrice?: string | number;
  }[];
};

function AccountContent({ user }: { user: User }) {
  const router = useRouter();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", user.email ?? "")
          .order("created_at", { ascending: false });

        if (error) {
          // If Supabase orders table is not created yet, do not crash the account page.
          console.warn("Orders not available yet:", error.message);
          setOrders([]);
        } else {
          setOrders((data ?? []) as AccountOrder[]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user.email]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const inTransit = orders.filter(
    (o) => !["delivered", "cancelled", "returned"].includes(o.status ?? ""),
  ).length;

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <div className="flex flex-col justify-between gap-6 border-b border-obsidian/10 pb-10 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
            Client portal
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">Welcome back</h1>
          <p className="mt-2 text-sm text-obsidian/55">{user.email}</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Package, label: "Total orders", value: String(orders.length) },
          { icon: Heart, label: "Wishlist", value: "0" },
          { icon: Truck, label: "In transit", value: String(inTransit) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 border border-obsidian/10 bg-beige/30 p-5"
          >
            <stat.icon className="h-5 w-5 text-champagne-dark" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-obsidian/45">
                {stat.label}
              </p>
              <p className="font-serif text-2xl">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-2xl md:text-3xl">Your orders</h2>
        {loading ? (
          <p className="mt-4 text-sm text-obsidian/50">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-obsidian/50">No orders yet.</p>
            <MagneticButton href="/shop" className="mt-6">
              Start shopping
            </MagneticButton>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto border border-obsidian/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-beige/50 text-[10px] uppercase tracking-[0.15em] text-obsidian/50">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderNumber = order.orderNumber ?? order.order_number ?? `#${order.id}`;
                  const date = order.createdAt ?? order.created_at ?? new Date();
                  return (
                    <tr key={order.id} className="border-t border-obsidian/8">
                      <td className="px-4 py-4 align-top">
                        <div className="font-medium text-obsidian mb-4">{orderNumber}</div>
                        <div className="space-y-4">
                          {order.items?.map((item, idx) => {
                            const product = PRODUCTS.find((p) => p.name === item.productName);
                            const slug = product?.slug || "#";
                            return (
                              <div key={idx} className="flex items-center gap-3">
                                {item.productImage && (
                                  <div className="h-12 w-10 shrink-0 overflow-hidden bg-beige">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.productImage}
                                      alt={item.productName ?? "Product"}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <Link
                                    href={slug !== "#" ? `/product/${slug}` : "#"}
                                    className="font-medium text-obsidian hover:underline line-clamp-1"
                                  >
                                    {item.productName}
                                  </Link>
                                  <p className="text-[11px] text-obsidian/60 mt-0.5">
                                    {[item.color, item.size, `Qty ${item.quantity ?? 1}`].filter(Boolean).join(" · ")}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-obsidian/60 align-top">{formatDate(date)}</td>
                      <td className="px-4 py-4 capitalize align-top">
                        {(order.status ?? "processed").replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-4 align-top">{formatCurrency(Number(order.total ?? 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        router.replace("/account/login");
      } else {
        setUser(data.session.user);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setUser(null);
        router.replace("/account/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-32">
        <p className="text-sm text-obsidian/50">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 pb-24 pt-32 text-center">
        <h1 className="font-serif text-3xl">Please sign in</h1>
        <p className="mt-3 text-sm text-obsidian/60">
          You need to be logged in to view your account.
        </p>
        <MagneticButton href="/account/login" className="mt-8">
          Sign in
        </MagneticButton>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center pt-32">
          <p className="text-sm text-obsidian/50">Loading...</p>
        </div>
      }
    >
      <AccountContent user={user} />
    </Suspense>
  );
}
