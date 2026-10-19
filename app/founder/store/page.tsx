"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
 Plus,
 LayoutDashboard,
 FileText,
 Store,
 Settings,
 ShoppingBag,
 DollarSign,
 Star,
 MoreVertical,
 Edit,
 Trash2,
 CheckCircle,
 Clock,
 User,
 PanelLeftClose,
 PanelLeftOpen,
 Pause,
 Play,
 TrendingUp,
 FileCode,
 Package,
 Tag,
} from "lucide-react";
import Link from "next/link";

export default function FounderStorePage() {
 const router = useRouter();
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 const [userProfile, setUserProfile] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 // Store data states
 const [products, setProducts] = useState<any[]>([]);
 const [stats, setStats] = useState({
 totalSales: 0,
 activeListings: 0,
 averageRating: 0,
 });

 // Action states
 const [openMenuId, setOpenMenuId] = useState<string | null>(null);
 const [updatingId, setUpdatingId] = useState<string | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const menuRef = useRef<any>(null);

 // Close popup menu on clicking outside
 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
 setOpenMenuId(null);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 // Fetch store data
 useEffect(() => {
 const fetchStoreData = async () => {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) {
 router.push("/login");
 return;
 }

 // 1. Fetch user profile
 const { data: profile } = await supabase
 .from("users")
 .select("*")
 .eq("id", session.user.id)
 .single();

 setUserProfile(profile || { id: session.user.id, full_name: session.user.email, role: 'founder' });

 // 2. Fetch products
 const { data: productsData, error: productsErr } = await supabase
 .from("products")
 .select("*")
 .eq("seller_id", session.user.id)
 .order("created_at", { ascending: false });

 if (productsErr) throw productsErr;

 // Set state
 const fetchedProducts = productsData || [];
 setProducts(fetchedProducts);

 // Compute Stats
 const totalSales = fetchedProducts.reduce((acc, p) => acc + (p.sales_count || 0), 0);
 const activeListings = fetchedProducts.filter(p => p.status === "live").length;
 
 // Average rating calculation
 const ratedProducts = fetchedProducts.filter(p => (p.review_count || 0) > 0);
 const averageRating = ratedProducts.length > 0
 ? Number((ratedProducts.reduce((acc, p) => acc + Number(p.average_rating || 0), 0) / ratedProducts.length).toFixed(1))
 : 0;

 setStats({
 totalSales,
 activeListings,
 averageRating,
 });

 } catch (err: any) {
 console.error("Error fetching store data:", err);
 } finally {
 setLoading(false);
 }
 };

 fetchStoreData();
 }, [router]);

 // Pause / Unpause Product toggle
 const handleTogglePause = async (id: string, currentStatus: string) => {
 setOpenMenuId(null);
 setUpdatingId(id);
 const newStatus = currentStatus === "live" ? "paused" : "live";
 try {
 const { error } = await supabase
 .from("products")
 .update({ status: newStatus })
 .eq("id", id);

 if (error) throw error;
 setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
 } catch (err: any) {
 alert("Failed to update status: " + err.message);
 } finally {
 setUpdatingId(null);
 }
 };

 // Delete Product
 const handleDeleteProduct = async (id: string) => {
 setOpenMenuId(null);
 if (!confirm("Are you sure you want to permanently delete this product?")) return;
 setDeletingId(id);
 try {
 const { error } = await supabase
 .from("products")
 .delete()
 .eq("id", id);

 if (error) throw error;
 setProducts(prev => prev.filter(p => p.id !== id));
 } catch (err: any) {
 alert("Failed to delete product: " + err.message);
 } finally {
 setDeletingId(null);
 }
 };

 if (loading) {
 return (
 <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)]">
 {/* Sidebar skeleton */}
 <aside className="hidden md:flex md:flex-col md:fixed md:h-screen md:w-[240px] bg-[var(--card-bg)] border-r-[0.5px] border-[var(--border)] p-4 gap-3 z-10">
 <div className="h-8 w-24 bg-[#e5e5e5] rounded-xl animate-pulse mb-4" />
 <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-2xl mb-4">
 <div className="w-9 h-9 rounded-full bg-[#e5e5e5] animate-pulse flex-shrink-0" />
 <div className="space-y-1.5 flex-1">
 <div className="h-3 bg-[#e5e5e5] rounded-full animate-pulse" />
 <div className="h-2 w-12 bg-[#e5e5e5] rounded-full animate-pulse" />
 </div>
 </div>
 {[...Array(6)].map((_, i) => (
 <div key={i} className="h-10 bg-[var(--bg)] rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
 ))}
 </aside>
 {/* Main skeleton */}
 <main className="flex-grow p-4 md:p-8 md:ml-[240px]">
 <div className="max-w-6xl mx-auto space-y-8">
 {/* Header */}
 <div className="flex justify-between items-center">
 <div className="space-y-2">
 <div className="h-8 w-40 bg-[#e5e5e5] rounded-xl animate-pulse" />
 <div className="h-4 w-56 bg-[#e5e5e5] rounded-full animate-pulse" />
 </div>
 <div className="h-11 w-40 bg-[#e5e5e5] rounded-2xl animate-pulse" />
 </div>
 {/* Stat cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-[var(--card-bg)] rounded-3xl p-5 border-[0.5px] border-[var(--border)] space-y-3" style={{ animationDelay: `${i * 80}ms` }}>
 <div className="w-10 h-10 bg-[#e5e5e5] rounded-2xl animate-pulse" />
 <div className="h-3 w-20 bg-[#e5e5e5] rounded-full animate-pulse" />
 <div className="h-7 w-16 bg-[#e5e5e5] rounded-xl animate-pulse" />
 </div>
 ))}
 </div>
 {/* Product rows */}
 <div className="bg-[var(--card-bg)] rounded-[32px] border-[0.5px] border-[var(--border)] overflow-hidden">
 <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
 <div className="h-5 w-28 bg-[#e5e5e5] rounded-xl animate-pulse" />
 <div className="h-9 w-32 bg-[#e5e5e5] rounded-xl animate-pulse" />
 </div>
 <div className="divide-y divide-[#f5f5f5]">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="flex items-center gap-4 p-5">
 <div className="w-12 h-12 bg-[#e5e5e5] rounded-2xl flex-shrink-0 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
 <div className="flex-1 space-y-2">
 <div className="h-4 w-48 bg-[#e5e5e5] rounded-full animate-pulse" />
 <div className="h-3 w-32 bg-[#e5e5e5] rounded-full animate-pulse" />
 </div>
 <div className="h-4 w-16 bg-[#e5e5e5] rounded-full animate-pulse" />
 <div className="w-8 h-8 bg-[#e5e5e5] rounded-xl animate-pulse" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </main>
 </div>
 );
 }

 const sidebarW = sidebarCollapsed ? "md:w-[72px]" : "md:w-[240px]";
 const mainML = sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[240px]";

 // Quick stats card data
 const statCards = [
 { label: "Total Downloads", value: stats.totalSales, icon: ShoppingBag, desc: "Units accessed", color: "text-blue-500 bg-blue-50" },
 { label: "Active Listings", value: stats.activeListings, icon: Package, desc: "Live in store", color: "text-indigo-500 bg-indigo-50" },
 { label: "Average Rating", value: stats.averageRating > 0 ? `${stats.averageRating} ★` : " - ", icon: Star, desc: "From reviews", color: "text-amber-500 bg-amber-50" },
 ];

 return (
 <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)]">
 {/* ── SIDEBAR ── */}
 <aside className={`bg-[var(--card-bg)] border-b md:border-b-0 md:border-r-[0.5px] border-[var(--border)] flex md:flex-col md:fixed md:h-screen z-10 flex-shrink-0 transition-all duration-300 ${sidebarW}`}>
 <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b-[0.5px] border-[var(--border)] md:border-b-0">
 {!sidebarCollapsed && (
 <Link href="/" className="text-xl font-black italic tracking-tighter text-[var(--text)] uppercase">
 Ventex
 </Link>
 )}
 <button
 onClick={() => setSidebarCollapsed(v => !v)}
 className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg)] transition-colors text-[var(--text2)] hover:text-[var(--text)] ml-auto"
 >
 {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
 </button>
 </div>

 {!sidebarCollapsed && (
 <div className="hidden md:block px-4 py-4">
 <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-2xl">
 <div className="w-9 h-9 rounded-full bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
 {userProfile?.avatar_url ? (
 <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
 ) : (
 <User className="w-4 h-4 text-[var(--text2)]" />
 )}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-[var(--text)] truncate">{userProfile?.full_name || "Founder"}</p>
 <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text2)] bg-[var(--card-bg)] px-1.5 py-0.5 rounded border-[0.5px] border-[var(--border)]">Founder</span>
 </div>
 </div>
 </div>
 )}

 <nav className="hidden md:flex flex-grow flex-col px-2 space-y-1 pt-2">
 <NavItem icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" collapsed={sidebarCollapsed} />
 <NavItem icon={FileText} label="My Pitches" href="/founder/pitches" collapsed={sidebarCollapsed} />
 <NavItem icon={Plus} label="Create Pitch" href="/founder/create-pitch" collapsed={sidebarCollapsed} />
 <NavItem icon={Store} label="My Store" active href="/founder/store" collapsed={sidebarCollapsed} />
 <NavItem icon={Tag} label="Deals & Promos" href="/founder/store/deals" collapsed={sidebarCollapsed} />
 <NavItem icon={Settings} label="Settings" href="/founder/settings" collapsed={sidebarCollapsed} />
 </nav>

 <nav className="flex md:hidden flex-grow items-center gap-1 px-3 overflow-x-auto py-2">
 <NavItemMobile icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" />
 <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" />
 <NavItemMobile icon={Plus} label="Create" href="/founder/create-pitch" />
 <NavItemMobile icon={Store} label="Store" active href="/founder/store" />
 <NavItemMobile icon={Tag} label="Deals" href="/founder/store/deals" />
 <NavItemMobile icon={Settings} label="Settings" href="/founder/settings" />
 </nav>
 </aside>

 {/* ── MAIN CONTENT ── */}
 <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
 <div className="max-w-6xl mx-auto space-y-8">
 
 {/* Header */}
 <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl md:text-3xl font-black text-[var(--text)] tracking-tighter uppercase">My Store</h1>
 <p className="text-[var(--text2)] font-medium text-sm mt-1">Manage listings, track sales, and fulfill custom/digital orders.</p>
 </div>
 <Link
 href="/founder/store/new-product"
 className="bg-[var(--text)] text-[var(--bg)] px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/5 w-full sm:w-auto text-center"
 >
 <Plus className="w-5 h-5" /> Add New Product
 </Link>
 </header>

 {/* Stats grid */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {statCards.map((card, idx) => (
 <div key={idx} className="bg-[var(--card-bg)] p-5 rounded-3xl border-[0.5px] border-[var(--border)] shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <div className={`p-2.5 rounded-2xl ${card.color}`}>
 <card.icon className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase text-[var(--text2)] tracking-widest">{card.desc}</span>
 </div>
 <p className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest mb-1">{card.label}</p>
 <h3 className="text-2xl font-black text-[var(--text)]">{card.value}</h3>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 gap-8">
 {/* Products Table */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-black text-[var(--text)] uppercase tracking-tight">My Products</h2>
 <span className="text-xs font-bold text-[var(--text2)]">{products.length} listed</span>
 </div>

 <div className="bg-[var(--card-bg)] rounded-3xl border-[0.5px] border-[var(--border)] overflow-hidden shadow-sm">
 {products.length === 0 ? (
 <div className="p-16 text-center">
 <Store className="w-12 h-12 text-[var(--text3)] mx-auto mb-4 animate-bounce" />
 <h3 className="text-base font-bold text-[var(--text)] mb-1">Your store is empty</h3>
 <p className="text-sm text-[var(--text2)] mb-6">List digital products, SaaS licenses, or custom design work packages.</p>
 <Link
 href="/founder/store/new-product"
 className="inline-flex items-center gap-2 bg-[var(--text)] text-[var(--bg)] px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-black transition-colors"
 >
 Create your first listing
 </Link>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b-[0.5px] border-[var(--border)] bg-[#F9F9F8] text-[10px] font-black text-[var(--text2)] uppercase tracking-widest">
 <th className="px-6 py-4">Product Details</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y-[0.5px] divide-[#e5e5e5]" ref={menuRef}>
 {products.map(product => {
 const mainImg = product.images_urls?.[0] || "/placeholder.jpg";
 
 return (
 <tr
 key={product.id}
 className={`hover:bg-[#F9F9F8] transition-colors text-sm ${
 deletingId === product.id ? "opacity-40 pointer-events-none" : ""
 }`}
 >
 {/* Product Info */}
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] overflow-hidden flex-shrink-0 flex items-center justify-center">
 {product.images_urls?.[0] ? (
 <img src={mainImg} alt="" className="w-full h-full object-cover" />
 ) : (
 <FileCode className="w-5 h-5 text-[var(--text2)]" />
 )}
 </div>
 <div className="min-w-0">
 <h4 className="font-bold text-[var(--text)] truncate max-w-[180px]">{product.name}</h4>
 <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text2)] bg-[var(--bg)] px-1.5 py-0.5 rounded mt-1 inline-block">
 {product.category || product.type}
 </span>
 </div>
 </div>
 </td>

 {/* Status Badge */}
 <td className="px-6 py-4">
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
 product.status === "live" ? "bg-emerald-100 text-emerald-700" :
 product.status === "pending" ? "bg-amber-100 text-amber-700" :
 product.status === "paused" ? "bg-[var(--bg3)] text-[var(--text2)]" :
 "bg-red-100 text-red-700"
 }`}>
 {product.status}
 </span>
 </td>

 {/* Actions Menu */}
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <Link
 href={`/marketplace/${product.id}`}
 className="px-2.5 py-1.5 border-[0.5px] border-[var(--border)] hover:bg-[var(--bg)] rounded-lg text-xs font-bold transition-all text-[var(--text)]"
 >
 View
 </Link>
 
 {/* Menu toggle */}
 <div className="relative">
 <button
 onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
 className="p-1.5 hover:bg-[var(--bg)] rounded-lg text-[var(--text2)] hover:text-[var(--text)] transition-colors"
 >
 <MoreVertical className="w-4 h-4" />
 </button>

 {openMenuId === product.id && (
 <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-xl shadow-xl z-50 py-1 overflow-hidden">
 <button
 onClick={() => handleTogglePause(product.id, product.status)}
 disabled={updatingId === product.id || product.status === "pending"}
 className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-bold text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-40"
 >
 {product.status === "live" ? (
 <><Pause className="w-3.5 h-3.5" /> Pause Listing</>
 ) : (
 <><Play className="w-3.5 h-3.5" /> Resume Listing</>
 )}
 </button>
 <Link
 href={`/founder/store/edit-product?id=${product.id}`}
 className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
 >
 <Edit className="w-3.5 h-3.5" /> Edit Details
 </Link>
 <div className="border-t-[0.5px] border-[var(--border)] my-1" />
 <button
 onClick={() => handleDeleteProduct(product.id)}
 disabled={deletingId === product.id}
 className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" /> Delete
 </button>
 </div>
 )}
 </div>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

function NavItem({ icon: Icon, label, active, href = "#", collapsed }: any) {
 return (
 <Link
 href={href}
 title={collapsed ? label : undefined}
 className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
 active
 ? "bg-[var(--text)] text-[var(--bg)] shadow-lg shadow-black/10"
 : "text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
 } ${collapsed ? "justify-center" : ""}`}
 >
 <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[var(--text)]" : "text-[var(--text2)] group-hover:text-[var(--text)]"}`} />
 {!collapsed && <span className="text-sm font-bold">{label}</span>}
 </Link>
 );
}

function NavItemMobile({ icon: Icon, label, active, href = "#" }: any) {
 return (
 <Link
 href={href}
 className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${
 active ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
 }`}
 >
 <Icon className="w-4 h-4" />
 <span className="text-[9px] font-bold">{label}</span>
 </Link>
 );
}
