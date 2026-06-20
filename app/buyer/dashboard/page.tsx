"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Package, Star, Clock,
  TrendingUp, AlertCircle, Loader2, ArrowRight
} from "lucide-react";

interface Order {
  id: string;
  created_at: string;
  amount_paid: number;
  status: string;
  product: { id: string; name: string; images_urls: string[] | null } | null;
}

interface Stats {
  totalOrders: number;
  totalSpent: number;
  pendingDownloads: number;
  reviewsLeft: number;
}

export default function BuyerDashboard() {
  const router                              = useRouter();
  const [loading, setLoading]               = useState(true);
  const [statsLoading, setStatsLoading]     = useState(true);
  const [profile, setProfile]               = useState<any>(null);
  const [recentOrders, setRecentOrders]     = useState<Order[]>([]);
  const [stats, setStats]                   = useState<Stats>({ totalOrders: 0, totalSpent: 0, pendingDownloads: 0, reviewsLeft: 0 });
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/login"); return; }

        const uid = session.user.id;

        // Fetch profile + orders in parallel
        const [profileRes, ordersRes] = await Promise.all([
          supabase.from("users").select("*").eq("id", uid).single(),
          supabase
            .from("orders")
            .select("id, created_at, amount_paid, status, product:product_id(id, name, images_urls)")
            .eq("buyer_id", uid)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setProfile(profileRes.data);
        setLoading(false);

        const orders = (ordersRes.data as unknown as Order[]) ?? [];
        setRecentOrders(orders);

        // Compute stats
        const totalOrders      = orders.length;
        const totalSpent       = orders.reduce((sum, o) => sum + (o.amount_paid ?? 0), 0);
        const pendingDownloads = orders.filter(o => o.status === "paid").length;

        // Reviews pending: count paid orders without a review
        const orderIds = orders.map(o => o.id);
        let reviewsLeft = 0;
        if (orderIds.length > 0) {
          const { data: reviews } = await supabase
            .from("reviews")
            .select("order_id")
            .eq("buyer_id", uid)
            .in("order_id", orderIds);
          reviewsLeft = totalOrders - (reviews?.length ?? 0);
        }

        setStats({ totalOrders, totalSpent, pendingDownloads, reviewsLeft });
      } catch (e: any) {
        console.error("Buyer dashboard error:", e);
        setError(e?.message || "Failed to load dashboard.");
      } finally {
        setStatsLoading(false);
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const statCards = [
    { icon: ShoppingBag, label: "Total Orders",       value: stats.totalOrders,                       color: "text-violet-400" },
    { icon: TrendingUp,  label: "Total Spent",         value: `$${stats.totalSpent.toFixed(2)}`,       color: "text-emerald-400" },
    { icon: Package,     label: "Available Downloads", value: stats.pendingDownloads,                  color: "text-blue-400" },
    { icon: Star,        label: "Reviews Pending",     value: Math.max(0, stats.reviewsLeft),          color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-4">
        <div className="font-black text-xl mb-8 text-[var(--text)]">Buyer</div>
        <nav className="space-y-2 text-sm font-bold">
          <Link href="/buyer/dashboard"   className="block px-3 py-2 bg-[var(--bg2)] rounded-md text-[var(--text)]">Dashboard</Link>
          <Link href="/marketplace"       className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Marketplace</Link>
          <Link href="/orders"            className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">My Orders</Link>
          <Link href="/messages"          className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Messages</Link>
          <Link href="/buyer/settings"    className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Settings</Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">
              {loading ? "Dashboard" : `Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!`}
            </h1>
            <p className="text-sm text-[var(--text2)] mt-1">Here's what's happening with your purchases.</p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-bold bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-lg hover:opacity-80 transition"
          >
            <ShoppingBag className="w-4 h-4" /> Shop Now
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-8 rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)] animate-pulse">
                <div className="h-5 w-5 rounded bg-[var(--border)] mb-4" />
                <div className="h-7 w-12 rounded bg-[var(--border)] mb-2" />
                <div className="h-4 w-24 rounded bg-[var(--border)]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
                <Icon className={`w-5 h-5 ${color} mb-4`} />
                <div className="text-2xl font-black text-[var(--text)]">{value}</div>
                <div className="text-sm font-bold text-[var(--text2)]">{label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text)]">Recent Orders</h2>
              <Link href="/orders" className="text-xs font-bold text-violet-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-[var(--text2)] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-sm text-[var(--text2)]">
                No orders yet.{" "}
                <Link href="/marketplace" className="text-violet-400 hover:underline">Browse marketplace →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
                      {order.product?.images_urls?.[0]
                        ? <img src={order.product.images_urls[0]} alt="" className="w-full h-full object-cover" />
                        : <ShoppingBag className="w-5 h-5 text-[var(--text2)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--text)] truncate">{order.product?.name ?? "Product"}</p>
                      <p className="text-xs text-[var(--text2)]">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-[var(--text)]">${order.amount_paid?.toFixed(2)}</p>
                      <span className={`text-[10px] font-bold uppercase ${
                        order.status === "paid" ? "text-emerald-400" :
                        order.status === "disputed" ? "text-amber-400" : "text-[var(--text2)]"
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { href: "/marketplace",  icon: ShoppingBag, label: "Browse Marketplace",      desc: "Find startup products & tools" },
                { href: "/orders",       icon: Package,     label: "Manage Orders",            desc: "View all purchases & downloads" },
                { href: "/discover",     icon: TrendingUp,  label: "Discover Startups",        desc: "Explore pitches from founders" },
                { href: "/messages",     icon: Clock,       label: "Messages",                 desc: "Chat with sellers" },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href} className="flex items-center gap-4 p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)] hover:border-violet-500/40 hover:bg-violet-500/5 transition group">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--text)]">{label}</p>
                    <p className="text-xs text-[var(--text2)]">{desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text2)] group-hover:text-violet-400 transition" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
