"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, Users, ShoppingBag, DollarSign,
  Plus, Loader2, AlertCircle, TrendingUp, Zap
} from "lucide-react";
import FounderGuard from "@/components/FounderGuard";

interface Stats {
  views: number;
  interests: number;
  sales: number;
  earnings: number;
}

interface RecentInterest {
  id: string;
  created_at: string;
  message: string | null;
  users: { full_name: string; email: string } | null;
  pitches: { title: string } | null;
}

export default function FounderDashboard() {
  const router = useRouter();
  const [pitches, setPitches]       = useState<any[]>([]);
  const [stats, setStats]           = useState<Stats>({ views: 0, interests: 0, sales: 0, earnings: 0 });
  const [recent, setRecent]         = useState<RecentInterest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/login"); return; }

        const uid = session.user.id;

        // 1. Fetch founder pitches
        const { data: pitchData } = await supabase
          .from("pitches")
          .select("id, title, status, created_at")
          .eq("founder_id", uid)
          .order("created_at", { ascending: false });

        const myPitches = pitchData ?? [];
        setPitches(myPitches);
        setLoading(false);

        if (myPitches.length === 0) {
          router.push("/founder/create-pitch");
          return;
        }

        const pitchIds = myPitches.map((p) => p.id);

        // 2. Fetch all stats in parallel
        const [interestsRes, ordersRes, recentRes] = await Promise.all([
          supabase
            .from("investor_interests")
            .select("id", { count: "exact", head: true })
            .in("pitch_id", pitchIds),
          supabase
            .from("orders")
            .select("amount_paid, seller_payout")
            .eq("seller_id", uid)
            .eq("status", "paid"),
          supabase
            .from("investor_interests")
            .select("id, created_at, message, users:investor_id(full_name, email), pitches:pitch_id(title)")
            .in("pitch_id", pitchIds)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const totalSales    = ordersRes.data?.length ?? 0;
        const totalEarnings = ordersRes.data?.reduce((sum, o) => sum + (o.seller_payout ?? 0), 0) ?? 0;

        setStats({
          views:     0,   // pitch view tracking not yet implemented
          interests: interestsRes.count ?? 0,
          sales:     totalSales,
          earnings:  totalEarnings,
        });
        setRecent((recentRes.data as unknown as RecentInterest[]) ?? []);
      } catch (e) {
        console.error("Founder dashboard load error:", e);
        setStatsError(true);
      } finally {
        setStatsLoading(false);
      }
    }
    load();
  }, [router]);

  const statCards = [
    { icon: Eye,          label: "Pitch Views",        value: stats.views,     color: "text-blue-400" },
    { icon: Users,        label: "Investor Interests",  value: stats.interests, color: "text-violet-400" },
    { icon: ShoppingBag,  label: "Products Sold",       value: stats.sales,     color: "text-emerald-400" },
    { icon: DollarSign,   label: "Earnings (USD)",      value: `$${stats.earnings.toFixed(2)}`, color: "text-amber-400" },
  ];

  return (
    <FounderGuard>
      <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-4">
          <div className="font-black text-xl mb-8 text-[var(--text)]">Founder</div>
          <nav className="space-y-2 text-sm font-bold">
            <Link href="/founder/dashboard"     className="block px-3 py-2 bg-[var(--bg2)] rounded-md text-[var(--text)]">Dashboard</Link>
            <Link href="/founder/pitches"       className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">My Pitches</Link>
            <Link href="/founder/create-pitch"  className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Create Pitch</Link>
            <Link href="/founder/store"         className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">My Store</Link>
            <Link href="/messages"              className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Messages</Link>
            <Link href="/founder/settings"      className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Settings</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)]">Overview</h1>
            <Link
              href="/founder/create-pitch"
              className="bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-80 transition"
            >
              <Plus className="w-4 h-4" /> New Pitch
            </Link>
          </div>

          {/* Stats */}
          {statsError ? (
            <div className="flex items-start gap-3 p-4 mb-8 rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              Could not load stats. Please refresh.
            </div>
          ) : statsLoading ? (
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
            {/* My Pitches */}
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <h2 className="text-xl font-bold mb-4 text-[var(--text)]">My Pitches</h2>
              {loading ? (
                <div className="flex items-center gap-2 text-[var(--text2)] text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : pitches.length === 0 ? (
                <div className="text-[var(--text2)] text-sm">
                  No pitches yet.{" "}
                  <Link href="/founder/create-pitch" className="text-violet-400 hover:underline">Create your first →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pitches.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                      <div>
                        <div className="font-bold text-[var(--text)] text-sm">{p.title || "Untitled"}</div>
                        <div className="text-xs text-[var(--text2)] mt-0.5 flex items-center gap-1.5">
                          <span className={`font-bold ${
                            p.status === "live"     ? "text-emerald-400" :
                            p.status === "rejected" ? "text-red-400" :
                            p.status === "draft"    ? "text-amber-400" :
                            "text-[var(--text2)]"
                          }`}>{p.status?.toUpperCase()}</span>
                          <span>·</span>
                          <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link href={`/founder/create-pitch?id=${p.id}`} className="text-xs font-bold px-3 py-1.5 bg-[var(--bg2)] rounded-lg text-[var(--text)] border border-[var(--border)] hover:opacity-80">
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Investor Interests */}
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <h2 className="text-xl font-bold mb-4 text-[var(--text)]">Investor Interests</h2>
              {statsLoading ? (
                <div className="flex items-center gap-2 text-[var(--text2)] text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : recent.length === 0 ? (
                <div className="text-sm text-[var(--text2)]">
                  No interests yet. Once your pitch is live, investors will appear here.
                  <div className="mt-3 flex items-center gap-2 text-violet-400">
                    <Zap className="w-4 h-4" />
                    <Link href="/founder/create-pitch" className="hover:underline font-bold text-xs">
                      Complete your pitch to attract investors →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((item) => (
                    <div key={item.id} className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[var(--text)]">
                            {item.users?.full_name ?? "An investor"}
                          </p>
                          <p className="text-xs text-[var(--text2)]">
                            interested in <span className="text-[var(--text)]">{item.pitches?.title ?? "your pitch"}</span>
                          </p>
                        </div>
                        <span className="text-xs text-[var(--text2)] shrink-0">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {item.message && (
                        <p className="text-xs text-[var(--text2)] mt-2 italic border-l-2 border-violet-500/30 pl-2">
                          "{item.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </FounderGuard>
  );
}
