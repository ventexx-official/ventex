"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Compass, Bookmark, Activity, MessageSquare,
  TrendingUp, AlertCircle, Loader2
} from "lucide-react";
import InvestorGuard from "@/components/InvestorGuard";

interface Stats {
  discovered: number;
  saved: number;
  interests: number;
  deals: number;
}

interface RecentInterest {
  id: string;
  created_at: string;
  pitches: { title: string; company_stage: string } | null;
}

export default function InvestorDashboard() {
  const [profile, setProfile]     = useState<any>(null);
  const [stats, setStats]         = useState<Stats>({ discovered: 0, saved: 0, interests: 0, deals: 0 });
  const [recent, setRecent]       = useState<RecentInterest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const uid = session.user.id;

        // Fetch profile
        const { data: prof } = await supabase
          .from("users")
          .select("*")
          .eq("id", uid)
          .single();
        setProfile(prof);

        // Fetch all stats in parallel
        const [savedRes, interestsRes, dealsRes, recentRes] = await Promise.all([
          supabase.from("saved_pitches").select("id", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("investor_interests").select("id", { count: "exact", head: true }).eq("investor_id", uid),
          supabase.from("deals").select("id", { count: "exact", head: true }).eq("investor_id", uid),
          supabase
            .from("investor_interests")
            .select("id, created_at, pitches:pitch_id(title, company_stage)")
            .eq("investor_id", uid)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          discovered: (interestsRes.count ?? 0) + (savedRes.count ?? 0),
          saved: savedRes.count ?? 0,
          interests: interestsRes.count ?? 0,
          deals: dealsRes.count ?? 0,
        });
        setRecent((recentRes.data as unknown as RecentInterest[]) ?? []);
      } catch (e) {
        console.error("Investor portal load error:", e);
        setStatsError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isMentor = profile?.investor_type === "mentor" || profile?.investor_type === "investor_mentor";

  const statCards = [
    { icon: Compass,      label: "Startups Discovered", value: stats.discovered, show: true },
    { icon: Bookmark,     label: "Saved",               value: stats.saved,      show: !isMentor },
    { icon: MessageSquare,label: "Interests Expressed", value: stats.interests,  show: true },
    { icon: Activity,     label: "Active Deals",        value: stats.deals,      show: !isMentor },
  ].filter((c) => c.show);

  return (
    <InvestorGuard>
      <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-4">
          <div className="font-black text-xl mb-8 text-[var(--text)]">Investor</div>
          <nav className="space-y-2 text-sm font-bold">
            <Link href="/investor/portal"  className="block px-3 py-2 bg-[var(--bg2)] rounded-md text-[var(--text)]">Dashboard</Link>
            <Link href="/discover"         className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Discover</Link>
            {!isMentor && (
              <>
                <Link href="/watchlist"  className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Watchlist</Link>
                <Link href="/deal-flow"  className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Deal Flow</Link>
              </>
            )}
            {isMentor && (
              <Link href="#" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Mentor Hub</Link>
            )}
            <Link href="/messages"          className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Messages</Link>
            <Link href="/investor/settings" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Settings</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Verification banner */}
          {profile && !profile.investor_verified && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl mb-8 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              Account pending verification. You have limited access to founder contact details and data rooms.
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)]">Investor Overview</h1>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm font-bold bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-lg hover:opacity-80 transition"
            >
              <TrendingUp className="w-4 h-4" /> Discover Startups
            </Link>
          </div>

          {/* Stats grid */}
          {statsError ? (
            <div className="p-6 rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 text-sm mb-8">
              Could not load stats. Check your connection and refresh.
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[...Array(isMentor ? 2 : 4)].map((_, i) => (
                <div key={i} className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)] animate-pulse">
                  <div className="h-5 w-5 rounded bg-[var(--border)] mb-4" />
                  <div className="h-7 w-10 rounded bg-[var(--border)] mb-2" />
                  <div className="h-4 w-24 rounded bg-[var(--border)]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {statCards.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
                  <Icon className="w-5 h-5 text-[var(--text2)] mb-4" />
                  <div className="text-2xl font-black text-[var(--text)]">{value}</div>
                  <div className="text-sm font-bold text-[var(--text2)]">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Recent interests */}
          <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4">Recent Interests</h2>
            {loading ? (
              <div className="flex items-center gap-2 text-[var(--text2)]">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : recent.length === 0 ? (
              <div className="text-sm text-[var(--text2)]">
                No interests yet.{" "}
                <Link href="/discover" className="text-violet-400 hover:underline">
                  Discover startups →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                    <div>
                      <p className="text-sm font-bold text-[var(--text)]">
                        {item.pitches?.title ?? "Untitled Pitch"}
                      </p>
                      <p className="text-xs text-[var(--text2)]">
                        {item.pitches?.company_stage ?? ""} ·{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      Interested
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </InvestorGuard>
  );
}
