"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
 Users,
 Search,
 Loader2,
 ShieldOff,
 ChevronDown,
 ChevronUp,
 BadgeCheck,
 BadgeMinus,
 RefreshCw,
 Crown,
 Ban,
 Briefcase
} from "lucide-react";

interface UserProfile {
 id: string;
 full_name: string;
 role: string;
 
 investor_premium: boolean;
 is_seller: boolean;
 banned: boolean;
 verified_founder: boolean;
 avatar_url: string;
 created_at: string;
 email?: string;
}

interface UserWithCounts extends UserProfile {
 pitchCount: number;
 productCount: number;
 expanded: boolean;
}

export default function AdminUsers() {
 const [users, setUsers] = useState<UserWithCounts[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
 const [roleFilter, setRoleFilter] = useState<string>("all");

 const fetchUsers = async () => {
 try {
 setLoading(true);
 // Fetch users + auth emails via admin rpc if available, otherwise fetch users table
 const [{ data: usersData }, { data: pitches }, { data: products }] =
 await Promise.all([
 supabase.from("users").select("id, full_name, role, avatar_url, banned, verified_founder, investor_premium, is_seller, created_at").order("created_at", { ascending: false }),
 supabase.from("pitches").select("founder_id"),
 supabase.from("products").select("seller_id"),
 ]);

 const enriched: UserWithCounts[] = (usersData || []).map((u: any) => ({
 ...u,
 pitchCount: pitches?.filter((p) => p.founder_id === u.id).length || 0,
 productCount: products?.filter((p) => p.seller_id === u.id).length || 0,
 expanded: false,
 }));

 setUsers(enriched);
 } catch (err) {
 console.error("Error loading users:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchUsers(); }, []);

 const toggleExpand = (id: string) => {
 setUsers((prev) =>
 prev.map((u) => (u.id === id ? { ...u, expanded: !u.expanded } : u))
 );
 };

 const updateUser = async (userId: string, updates: Partial<UserProfile>) => {
 try {
 setActionLoadingId(userId);
 const { error } = await supabase.from("users").update(updates).eq("id", userId);
 if (error) throw error;
 setUsers((prev) =>
 prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
 );
 } catch (err: any) {
 alert(`Error: ${err.message}`);
 } finally {
 setActionLoadingId(null);
 }
 };

 const filtered = users.filter((u) => {
 const matchesSearch =
 u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 u.id?.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesRole = roleFilter === "all" || u.role === roleFilter;
 return matchesSearch && matchesRole;
 });

 const roleBadge = (role: string) => {
 const styles: Record<string, string> = {
 admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
 founder: "bg-blue-500/15 text-blue-400 border-blue-500/30",
 seller: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
 visitor: "bg-[var(--bg2)]0/15 text-[var(--text2)] border-[0.5px] border-[var(--border)] ",
 };
 return (
 <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[role] || styles.visitor}`}>
 {role}
 </span>
 );
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">User Management Console</h2>
 <p className="text-sm text-[var(--text2)] mt-1">
 Search, inspect, ban, change roles, and verify founder badges for all registered accounts.
 </p>
 </div>
 <button
 onClick={fetchUsers}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg2)] border border-[0.5px] border-[var(--border)] text-xs font-semibold text-[var(--text)] rounded-lg hover:bg-[var(--bg2)] transition-colors"
 >
 <RefreshCw size={13} /> Refresh
 </button>
 </div>

 {/* Filters */}
 <div className="flex flex-col md:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text3)] h-4 w-4" />
 <input
 type="text"
 placeholder="Search by name or user ID..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-sm text-[var(--text)] placeholder-[#888888] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
 />
 </div>
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="px-4 py-2.5 bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-sm text-[var(--text)] focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer"
 >
 <option value="all">All Roles</option>
 <option value="admin">Admin</option>
 <option value="founder">Founder</option>
 <option value="investor">Investor</option>
 <option value="buyer">Buyer</option>
 <option value="explorer">Explorer</option>
 <option value="visitor">Visitor</option>
 </select>
 </div>

 {/* Stats bar */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
 {[
 { label: "Total Users", val: users.length, color: "text-[var(--text)]" },
 { label: "Investors", val: users.filter((u) => u.role === "investor").length, color: "text-amber-400" },
 { label: "Founders", val: users.filter((u) => u.role === "founder").length, color: "text-blue-400" },
 { label: "Buyers", val: users.filter((u) => u.role === "buyer" || u.role === "explorer").length, color: "text-violet-400" },
 { label: "Verified", val: users.filter((u) => u.verified_founder).length, color: "text-emerald-400" },
 { label: "Banned", val: users.filter((u) => u.banned).length, color: "text-red-400" },
 ].map(({ label, val, color }) => (
 <div key={label} className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-4 text-center">
 <p className={`text-2xl font-black font-mono ${color}`}>{val}</p>
 <p className="text-[11px] text-[var(--text3)] mt-1 uppercase tracking-wider font-bold">{label}</p>
 </div>
 ))}
 </div>

 {/* User List */}
 {loading ? (
 <div className="h-64 flex items-center justify-center">
 <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
 </div>
 ) : filtered.length === 0 ? (
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-12 text-center">
 <Users className="h-10 w-10 text-[var(--text3)] mx-auto mb-3" />
 <h3 className="text-sm font-bold text-[var(--text)]">No users found</h3>
 <p className="text-xs text-[var(--text3)] mt-1">Try adjusting your search or filter.</p>
 </div>
 ) : (
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] overflow-hidden divide-y divide-y divide-[#e5e5e5] dark:divide-[#333333]">
 {filtered.map((user) => {
 const isLoading = actionLoadingId === user.id;
 return (
 <div key={user.id} className={`transition-colors ${user.banned ? "bg-red-950/5" : ""}`}>
 {/* Row */}
 <div
 className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:hover:bg-[var(--bg2)] transition-colors"
 onClick={() => toggleExpand(user.id)}
 >
 {/* Avatar */}
 <div className={`h-10 w-10 rounded-full shrink-0 border flex items-center justify-center font-bold text-sm overflow-hidden ${
 user.banned ? "border-red-900 bg-red-950/20 text-red-400" : "border-[0.5px] border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)]"
 }`}>
 {user.avatar_url ? (
 <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
 ) : (
 (user.full_name?.[0] || "?").toUpperCase()
 )}
 </div>

 {/* Name / ID */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-sm font-bold text-[var(--text)]">
 {user.full_name || "Unnamed User"}
 </span>
 {user.verified_founder && (
 <BadgeCheck size={14} className="text-emerald-400" />
 )}
 {user.banned && (
 <span className="text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-900/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
 Banned
 </span>
 )}
 </div>
 <p className="text-[11px] text-[var(--text3)] font-mono truncate mt-0.5">{user.id}</p>
 </div>

 {/* Role + chips */}
 <div className="hidden md:flex items-center gap-3">
 {roleBadge(user.role)}
 
 {user.investor_premium && (
 <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
 <Crown size={9} /> Investor
 </span>
 )}
 </div>

 {/* Expand toggle */}
 <div className="text-[var(--text3)]">
 {user.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
 </div>
 </div>

 {/* Expanded Details */}
 {user.expanded && (
 <div className="px-6 pb-5 bg-[var(--bg2)] border-t border-[0.5px] border-[var(--border)] ">
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4">
 {/* Account Info */}
 <div className="space-y-3">
 <h4 className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest font-mono">Account Details</h4>
 <div className="space-y-2 text-xs">
 <div className="flex justify-between">
 <span className="text-[var(--text3)]">Joined</span>
 <span className="text-[var(--text)] font-mono">{new Date(user.created_at).toLocaleDateString()}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[var(--text3)]">Pitches</span>
 <span className="text-[var(--text)] font-mono">{user.pitchCount}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[var(--text3)]">Products</span>
 <span className="text-[var(--text)] font-mono">{user.productCount}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[var(--text3)]">Investor Account</span>
 <span className={user.role === "investor" ? "text-amber-400 font-bold" : "text-[var(--text3)]"}>
 {user.role === "investor" ? "Yes" : "No"}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-[var(--text3)]">Investor Premium</span>
 <span className={user.investor_premium ? "text-amber-400 font-bold" : "text-[var(--text3)]"}>
 {user.investor_premium ? "Active" : "None"}
 </span>
 </div>
 </div>
 </div>

 {/* Ban / Verify */}
 <div className="space-y-3">
 <h4 className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest font-mono">Moderation Actions</h4>
 <div className="space-y-2">
 <button
 onClick={() => updateUser(user.id, { banned: !user.banned })}
 disabled={isLoading}
 className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-50 ${
 user.banned
 ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/40"
 : "bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-950/40"
 }`}
 >
 {isLoading ? <Loader2 size={12} className="animate-spin" /> : user.banned ? <ShieldOff size={12} /> : <Ban size={12} />}
 {user.banned ? "Unban Account" : "Ban Account"}
 </button>

 <button
 onClick={() => updateUser(user.id, { verified_founder: !user.verified_founder })}
 disabled={isLoading}
 className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-50 ${
 user.verified_founder
 ? "bg-[var(--bg2)] border-[0.5px] border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg2)]"
 : "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/40"
 }`}
 >
 {isLoading ? <Loader2 size={12} className="animate-spin" /> : user.verified_founder ? <BadgeMinus size={12} /> : <BadgeCheck size={12} />}
 {user.verified_founder ? "Remove Verified Badge" : "Verify Founder Badge"}
 </button>
 </div>
 </div>

 {/* Investor Access */}
 <div className="space-y-3">
 <h4 className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest font-mono">Investor Access</h4>
 <div className="space-y-2">
 <button
 onClick={() => updateUser(user.id, { investor_premium: !user.investor_premium })}
 disabled={isLoading}
 className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-50 ${
 user.investor_premium
 ? "bg-[var(--bg2)] border-[0.5px] border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg2)]"
 : "bg-amber-950/20 border-amber-900/40 text-amber-400 hover:bg-amber-950/40"
 }`}
 >
 {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Crown size={12} />}
 {user.investor_premium ? "Revoke Investor Premium" : "Grant Investor Premium"}
 </button>
 <button
 onClick={() => updateUser(user.id, { role: "investor" })}
 disabled={isLoading || user.role === "investor"}
 className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-amber-900/40 bg-amber-950/20 text-amber-400 transition-all hover:bg-amber-950/40 disabled:opacity-50"
 >
 {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Briefcase size={12} />}
 Make Investor
 </button>
 </div>
 </div>

 {/* Role Change */}
 <div className="space-y-3">
 <h4 className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest font-mono">Role Assignment</h4>
 <div className="grid grid-cols-2 gap-2">
 {["visitor", "founder", "investor", "admin"].map((r) => (
 <button
 key={r}
 onClick={() => updateUser(user.id, { role: r })}
 disabled={isLoading || user.role === r}
 className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-40 capitalize ${
 user.role === r
 ? "bg-[var(--text)] border-[var(--text)] text-[var(--bg)]"
 : "bg-[var(--bg2)] border-[0.5px] border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)]"
 }`}
 >
 {isLoading && user.role !== r ? (
 <Loader2 size={12} className="animate-spin mx-auto" />
 ) : (
 r
 )}
 </button>
 ))}
 </div>
 <p className="text-[10px] text-[var(--text3)] leading-relaxed">
 Changing to <strong className="text-[var(--text3)]">admin</strong> grants full platform access. Use carefully.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
