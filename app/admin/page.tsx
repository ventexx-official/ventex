"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
 Users,
 FileText,
 ShoppingBag,
 DollarSign,
 TrendingUp,
 ShieldAlert,
 Loader2,
 Calendar
} from "lucide-react";

const FEATURE_FLAGS = [
 ["ventex_live_enabled", "Ventex Live page"],
 ["live_founder_applications", "Ventex Live founder applications"],
 ["live_investor_applications", "Ventex Live investor applications"],
 ["homepage_featured_this_week", "Homepage Featured This Week"],
 ["investor_leaderboard", "Investor Leaderboard"],
 ["xp_system", "XP System"],
 ["winners_archive", "Winners Archive"],
 ["referral_system", "Referral System"],
 ["email_digests", "Email Digests"],
 ["embeddable_badges", "Embeddable Badges"],
 ["cold_pitch_challenge", "Cold Pitch Challenge"],
] as const;

export default function AdminOverview() {
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState<any>(null);
 const [flags, setFlags] = useState<Record<string, boolean>>({});

 const fetchStats = async () => {
 try {
 setLoading(true);
 // Fetch datasets
 const [
 { data: users },
 { data: pitches },
 { data: products },
 { data: orders }
 ] = await Promise.all([
 supabase.from("users").select("role, banned"),
 supabase.from("pitches").select("status"),
 supabase.from("products").select("status"),
 supabase.from("orders").select("amount_paid, ventex_fee, created_at")
 ]);

 // Calculate aggregates
 const userBreakdown = {
 total: users?.length || 0,
 admins: users?.filter((u) => u.role === "admin").length || 0,
 founders: users?.filter((u) => u.role === "founder").length || 0,
 investors: users?.filter((u) => u.role === "investor").length || 0,
 buyers: users?.filter((u) => u.role === "buyer" || u.role === "explorer").length || 0,
 visitors: users?.filter((u) => u.role === "visitor" || (!u.role)).length || 0,
 banned: users?.filter((u) => u.banned).length || 0
 };

 const pitchBreakdown = {
 total: pitches?.length || 0,
 pending: pitches?.filter((p) => p.status === "pending").length || 0,
 live: pitches?.filter((p) => p.status === "live").length || 0,
 draft: pitches?.filter((p) => p.status === "draft").length || 0,
 rejected: pitches?.filter((p) => p.status === "rejected").length || 0
 };

 const productBreakdown = {
 total: products?.length || 0,
 pending: products?.filter((p) => p.status === "pending").length || 0,
 live: products?.filter((p) => p.status === "live").length || 0,
 banned: products?.filter((p) => p.status === "banned").length || 0
 };

 const orderCount = orders?.length || 0;
 const gmv = (orders?.reduce((acc, o) => acc + Number(o.amount_paid || 0), 0) || 0) / 100;
 const totalFees = (orders?.reduce((acc, o) => acc + Number(o.ventex_fee || 0), 0) || 0) / 100;

 // Revenue this month (current month/year)
 const now = new Date();
 const currentYear = now.getFullYear();
 const currentMonth = now.getMonth();
 const thisMonthOrders = orders?.filter((o) => {
 const date = new Date(o.created_at);
 return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
 }) || [];
 const thisMonthRevenue = (thisMonthOrders.reduce((acc, o) => acc + Number(o.ventex_fee || 0), 0) || 0) / 100;

 setStats({
 userBreakdown,
 pitchBreakdown,
 productBreakdown,
 orderCount,
 gmv,
 totalFees,
 thisMonthRevenue
 });

 const { data: flagRows } = await supabase.from("feature_flags").select("key, enabled");
 const nextFlags = Object.fromEntries(FEATURE_FLAGS.map(([key]) => [key, key.includes('live')]));
 (flagRows || []).forEach((row: any) => {
 nextFlags[row.key] = !!row.enabled;
 });
 setFlags(nextFlags);
 } catch (err) {
 console.error("Error loading admin stats:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchStats();
 }, []);

 const updateFlag = async (key: string, enabled: boolean) => {
 setFlags((prev) => ({ ...prev, [key]: enabled }));
 const { error } = await supabase.from("feature_flags").upsert({
 key,
 enabled,
 updated_at: new Date().toISOString(),
 }, { onConflict: "key" });
 if (error) {
 alert(`Could not update feature flag: ${error.message}`);
 setFlags((prev) => ({ ...prev, [key]: !enabled }));
 }
 };

 if (loading) {
 return (
 <div className="h-96 flex items-center justify-center">
 <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
 </div>
 );
 }

 if (!stats) return null;

 return (
 <div className="space-y-8">
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6">
 <div className="mb-5">
 <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Feature Flags</h2>
 <p className="text-sm text-[var(--text2)] mt-1">Admin-controlled launches. Every new feature defaults to OFF until explicitly enabled.</p>
 </div>
 <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
 {FEATURE_FLAGS.map(([key, label]) => (
 <label key={key} className="flex cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-[0.5px] border-[var(--border)] bg-black/20 p-4">
 <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
 <input type="checkbox" checked={!!flags[key]} onChange={(e) => updateFlag(key, e.target.checked)} className="h-4 w-4 accent-violet-500" />
 </label>
 ))}
 </div>
 </div>

 {/* Top Welcome Panel */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">System Summary</h2>
 <p className="text-sm text-[var(--text2)] mt-1">
 Real-time metric updates and status queue audits.
 </p>
 </div>
 <button
 onClick={fetchStats}
 className="px-4 py-2 bg-[var(--bg2)] border border-[0.5px] border-[var(--border)] text-xs font-semibold text-[var(--text)] rounded-lg hover:bg-[var(--bg2)] transition-colors"
 >
 Refresh Overview
 </button>
 </div>

 {/* Main Metric Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {/* GMV */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-5 relative overflow-hidden group">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs font-bold text-[var(--text2)] tracking-wider uppercase">Gross Merchandise Value</p>
 <h3 className="text-2xl font-black text-[var(--text)] mt-2 font-mono">${stats.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
 </div>
 <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
 <TrendingUp size={20} />
 </div>
 </div>
 <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1 font-semibold">
 {stats.orderCount} Orders Executed
 </p>
 </div>



 {/* Critical Flags/Bans */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-5 relative overflow-hidden group">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs font-bold text-[var(--text2)] tracking-wider uppercase">Banned Accounts</p>
 <h3 className="text-2xl font-black text-red-500 mt-2 font-mono">{stats.userBreakdown.banned}</h3>
 </div>
 <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
 <ShieldAlert size={20} />
 </div>
 </div>
 <p className="text-xs text-red-400/80 mt-4 font-semibold">
 Banned/suspended user records
 </p>
 </div>
 </div>

 {/* Breakdowns Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* User Breakdown */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6">
 <div className="flex items-center gap-3 border-b border-[0.5px] border-[var(--border)] pb-4 mb-4">
 <Users className="text-violet-400 h-5 w-5" />
 <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">User Directory Accounts</h4>
 </div>
 <div className="space-y-4">
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Total Registered Users</span>
 <span className="font-bold text-[var(--text)] font-mono">{stats.userBreakdown.total}</span>
 </div>
 <div className="h-px bg-[var(--bg2)]" />
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Administrators</span>
 <span className="font-bold text-[var(--text)] font-mono">{stats.userBreakdown.admins}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Founders</span>
 <span className="font-bold text-[var(--text)] font-mono">{stats.userBreakdown.founders}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Investors</span>
 <span className="font-bold text-amber-400 font-mono">{stats.userBreakdown.investors}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Buyers / Explorers</span>
 <span className="font-bold text-violet-400 font-mono">{stats.userBreakdown.buyers}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Standard Visitors</span>
 <span className="font-bold text-[var(--text)] font-mono">{stats.userBreakdown.visitors}</span>
 </div>
 </div>
 </div>

 {/* Pitch Breakdown */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6">
 <div className="flex items-center gap-3 border-b border-[0.5px] border-[var(--border)] pb-4 mb-4">
 <FileText className="text-violet-400 h-5 w-5" />
 <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">Pitch Deck Queue</h4>
 </div>
 <div className="space-y-4">
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Total Pitches Created</span>
 <span className="font-bold text-[var(--text)] font-mono">{stats.pitchBreakdown.total}</span>
 </div>
 <div className="h-px bg-[var(--bg2)]" />
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)] flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-amber-500" />
 Pending Review
 </span>
 <span className="font-bold text-amber-500 font-mono">{stats.pitchBreakdown.pending}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)] flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-emerald-500" />
 Live on Platform
 </span>
 <span className="font-bold text-emerald-500 font-mono">{stats.pitchBreakdown.live}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)] flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-[var(--bg2)]0" />
 Drafts
 </span>
 <span className="font-bold text-[var(--text2)] font-mono">{stats.pitchBreakdown.draft}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)] flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-red-500" />
 Rejected / Flagged
 </span>
 <span className="font-bold text-red-500 font-mono">{stats.pitchBreakdown.rejected}</span>
 </div>
 </div>
 </div>

 {/* Product Breakdown */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6">
 <div className="flex items-center gap-3 border-b border-[0.5px] border-[var(--border)] pb-4 mb-4">
 <ShoppingBag className="text-violet-400 h-5 w-5" />
 <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">Product Inventory</h4>
 </div>
 <div className="space-y-4">
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)]">Total Listings</span>
 <span className="font-bold text-[var(--text)] font-mono">{stats.productBreakdown.total}</span>
 </div>
 <div className="h-px bg-[var(--bg2)]" />
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)] flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-amber-500" />
 Pending Review
 </span>
 <span className="font-bold text-amber-500 font-mono">{stats.productBreakdown.pending}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)] flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-emerald-500" />
 Live on Marketplace
 </span>
 <span className="font-bold text-emerald-500 font-mono">{stats.productBreakdown.live}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-[var(--text2)] flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-red-500" />
 Banned / Disallowed
 </span>
 <span className="font-bold text-red-500 font-mono">{stats.productBreakdown.banned}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}