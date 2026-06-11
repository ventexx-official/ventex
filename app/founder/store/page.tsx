"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutDashboard,
  FileText,
  Store,
  Zap,
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
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
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

        // 3. Fetch orders
        const { data: ordersData, error: ordersErr } = await supabase
          .from("orders")
          .select(`
            *,
            product:product_id ( id, name, type, images_urls ),
            buyer:buyer_id ( id, full_name, email )
          `)
          .eq("seller_id", session.user.id)
          .order("created_at", { ascending: false });

        if (ordersErr) throw ordersErr;

        // Set state
        const fetchedProducts = productsData || [];
        const fetchedOrders = ordersData || [];
        setProducts(fetchedProducts);
        setOrders(fetchedOrders);

        // Compute Stats
        const totalSales = fetchedProducts.reduce((acc, p) => acc + (p.sales_count || 0), 0);
        const totalRevenue = fetchedOrders.reduce((acc, o) => acc + (o.amount_paid || 0), 0);
        const activeListings = fetchedProducts.filter(p => p.status === "live").length;
        
        // Average rating calculation
        const ratedProducts = fetchedProducts.filter(p => (p.review_count || 0) > 0);
        const averageRating = ratedProducts.length > 0
          ? Number((ratedProducts.reduce((acc, p) => acc + Number(p.average_rating || 0), 0) / ratedProducts.length).toFixed(1))
          : 0;

        setStats({
          totalSales,
          totalRevenue,
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

  // Fulfil order
  const handleMarkFulfilled = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "fulfilled" })
        .eq("id", orderId);

      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "fulfilled" } : o));
      alert("Order marked as fulfilled!");
    } catch (err: any) {
      alert("Failed to fulfil order: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F2F0]">
        {/* Sidebar skeleton */}
        <aside className="hidden md:flex md:flex-col md:fixed md:h-screen md:w-[240px] bg-white border-r-[0.5px] border-[#e5e5e5] p-4 gap-3 z-10">
          <div className="h-8 w-24 bg-[#e5e5e5] rounded-xl animate-pulse mb-4" />
          <div className="flex items-center gap-3 p-3 bg-[#F2F2F0] rounded-2xl mb-4">
            <div className="w-9 h-9 rounded-full bg-[#e5e5e5] animate-pulse flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-[#e5e5e5] rounded-full animate-pulse" />
              <div className="h-2 w-12 bg-[#e5e5e5] rounded-full animate-pulse" />
            </div>
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-[#F2F2F0] rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
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
                <div key={i} className="bg-white rounded-3xl p-5 border-[0.5px] border-[#e5e5e5] space-y-3" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-10 h-10 bg-[#e5e5e5] rounded-2xl animate-pulse" />
                  <div className="h-3 w-20 bg-[#e5e5e5] rounded-full animate-pulse" />
                  <div className="h-7 w-16 bg-[#e5e5e5] rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
            {/* Product rows */}
            <div className="bg-white rounded-[32px] border-[0.5px] border-[#e5e5e5] overflow-hidden">
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
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
    { label: "Total Sales", value: stats.totalSales, icon: ShoppingBag, desc: "Units sold", color: "text-blue-500 bg-blue-50" },
    { label: "Total Revenue", value: `₹${(stats.totalRevenue / 100).toLocaleString()}`, icon: DollarSign, desc: "Total earnings", color: "text-emerald-500 bg-emerald-50" },
    { label: "Active Listings", value: stats.activeListings, icon: Package, desc: "Live in store", color: "text-indigo-500 bg-indigo-50" },
    { label: "Average Rating", value: stats.averageRating > 0 ? `${stats.averageRating} ★` : "—", icon: Star, desc: "From reviews", color: "text-amber-500 bg-amber-50" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F2F0]">
      {/* ── SIDEBAR ── */}
      <aside className={`bg-white border-b md:border-b-0 md:border-r-[0.5px] border-[#e5e5e5] flex md:flex-col md:fixed md:h-screen z-10 flex-shrink-0 transition-all duration-300 ${sidebarW}`}>
        <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b-[0.5px] border-[#e5e5e5] md:border-b-0">
          {!sidebarCollapsed && (
            <Link href="/" className="text-xl font-black italic tracking-tighter text-[#222222] uppercase">
              Ventex
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F2F2F0] transition-colors text-[#888888] hover:text-[#222222] ml-auto"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="hidden md:block px-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-[#F2F2F0] rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-white border-[0.5px] border-[#e5e5e5] flex items-center justify-center overflow-hidden flex-shrink-0">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#888888]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#222222] truncate">{userProfile?.full_name || "Founder"}</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] bg-white px-1.5 py-0.5 rounded border-[0.5px] border-[#e5e5e5]">Founder</span>
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
          <NavItem icon={Zap} label="Booster Packs" href="/founder/boost" collapsed={sidebarCollapsed} />
          <NavItem icon={Settings} label="Settings" href="/founder/settings" collapsed={sidebarCollapsed} />
        </nav>

        <nav className="flex md:hidden flex-grow items-center gap-1 px-3 overflow-x-auto py-2">
          <NavItemMobile icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" />
          <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" />
          <NavItemMobile icon={Plus} label="Create" href="/founder/create-pitch" />
          <NavItemMobile icon={Store} label="Store" active href="/founder/store" />
          <NavItemMobile icon={Tag} label="Deals" href="/founder/store/deals" />
          <NavItemMobile icon={Zap} label="Boost" href="/founder/boost" />
          <NavItemMobile icon={Settings} label="Settings" href="/founder/settings" />
        </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#222222] tracking-tighter uppercase">My Store</h1>
              <p className="text-[#888888] font-medium text-sm mt-1">Manage listings, track sales, and fulfill custom/digital orders.</p>
            </div>
            <Link
              href="/founder/store/new-product"
              className="bg-[#222222] text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/5 w-full sm:w-auto text-center"
            >
              <Plus className="w-5 h-5" /> Add New Product
            </Link>
          </header>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-2xl ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#888888] tracking-widest">{card.desc}</span>
                </div>
                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-1">{card.label}</p>
                <h3 className="text-2xl font-black text-[#222222]">{card.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products Table (Col-span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#222222] uppercase tracking-tight">My Products</h2>
                <span className="text-xs font-bold text-[#888888]">{products.length} listed</span>
              </div>

              <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] overflow-hidden shadow-sm">
                {products.length === 0 ? (
                  <div className="p-16 text-center">
                    <Store className="w-12 h-12 text-[#cccccc] mx-auto mb-4 animate-bounce" />
                    <h3 className="text-base font-bold text-[#222222] mb-1">Your store is empty</h3>
                    <p className="text-sm text-[#888888] mb-6">List digital products, SaaS licenses, or custom design work packages.</p>
                    <Link
                      href="/founder/store/new-product"
                      className="inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-black transition-colors"
                    >
                      Create your first listing
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-[0.5px] border-[#e5e5e5] bg-[#F9F9F8] text-[10px] font-black text-[#888888] uppercase tracking-widest">
                          <th className="px-6 py-4">Product Details</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Sales</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-[0.5px] divide-[#e5e5e5]" ref={menuRef}>
                        {products.map(product => {
                          const mainImg = product.images_urls?.[0] || "/placeholder.jpg";
                          const isCustom = product.type?.toLowerCase() === "custom work";
                          
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
                                  <div className="w-12 h-12 rounded-xl border-[0.5px] border-[#e5e5e5] bg-[#F2F2F0] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {product.images_urls?.[0] ? (
                                      <img src={mainImg} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <FileCode className="w-5 h-5 text-[#888888]" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-[#222222] truncate max-w-[180px]">{product.name}</h4>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#888888] bg-[#F2F2F0] px-1.5 py-0.5 rounded mt-1 inline-block">
                                      {product.category || product.type}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Price */}
                              <td className="px-6 py-4 font-bold text-[#222222]">
                                {isCustom ? (
                                  <span className="text-[#888888] text-xs">Custom Work</span>
                                ) : (
                                  `₹${(product.price / 100).toLocaleString()}`
                                )}
                              </td>

                              {/* Status Badge */}
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  product.status === "live" ? "bg-emerald-100 text-emerald-700" :
                                  product.status === "pending" ? "bg-amber-100 text-amber-700" :
                                  product.status === "paused" ? "bg-gray-100 text-gray-600" :
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {product.status}
                                </span>
                              </td>

                              {/* Sales / Rev */}
                              <td className="px-6 py-4 text-center">
                                <p className="font-bold text-[#222222]">{product.sales_count || 0}</p>
                                <p className="text-[10px] text-[#888888] font-medium mt-0.5">
                                  ₹{((product.sales_count || 0) * (product.price || 0) / 100).toLocaleString()}
                                </p>
                              </td>

                              {/* Actions Menu */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/marketplace/${product.id}`}
                                    className="px-2.5 py-1.5 border-[0.5px] border-[#e5e5e5] hover:bg-[#F2F2F0] rounded-lg text-xs font-bold transition-all text-[#222222]"
                                  >
                                    View
                                  </Link>
                                  
                                  {/* Menu toggle */}
                                  <div className="relative">
                                    <button
                                      onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                                      className="p-1.5 hover:bg-[#F2F2F0] rounded-lg text-[#888888] hover:text-[#222222] transition-colors"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {openMenuId === product.id && (
                                      <div className="absolute right-0 top-full mt-1 w-40 bg-white border-[0.5px] border-[#e5e5e5] rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                                        <button
                                          onClick={() => handleTogglePause(product.id, product.status)}
                                          disabled={updatingId === product.id || product.status === "pending"}
                                          className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-bold text-[#222222] hover:bg-[#F2F2F0] transition-colors disabled:opacity-40"
                                        >
                                          {product.status === "live" ? (
                                            <><Pause className="w-3.5 h-3.5" /> Pause Listing</>
                                          ) : (
                                            <><Play className="w-3.5 h-3.5" /> Resume Listing</>
                                          )}
                                        </button>
                                        <Link
                                          href={`/founder/store/edit-product?id=${product.id}`}
                                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-[#222222] hover:bg-[#F2F2F0] transition-colors"
                                        >
                                          <Edit className="w-3.5 h-3.5" /> Edit Details
                                        </Link>
                                        <div className="border-t-[0.5px] border-[#e5e5e5] my-1" />
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

            {/* Payouts card + schedule */}
            <div className="space-y-6">
              <h2 className="text-lg font-black text-[#222222] uppercase tracking-tight">Payout Account</h2>
              <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-[#888888] tracking-widest mb-2">Payout balance</p>
                  <h3 className="text-3xl font-black text-[#222222]">
                    ₹{(orders.reduce((acc, o) => acc + (o.seller_payout || 0), 0) / 100).toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#888888] mt-2 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Calculated automatically (95% of total sales)</span>
                  </div>
                </div>

                <div className="border-t-[0.5px] border-[#e5e5e5] pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#888888]">Earnings (This Month)</span>
                    <span className="text-[#222222]">
                      ₹{(orders.reduce((acc, o) => {
                        const orderMonth = new Date(o.created_at).getMonth();
                        const currMonth = new Date().getMonth();
                        return orderMonth === currMonth ? acc + (o.seller_payout || 0) : acc;
                      }, 0) / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#888888]">Stripe Connect Status</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wider border-[0.5px] border-emerald-200">
                      Connected
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border-[0.5px] border-amber-200 rounded-2xl p-4 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 font-semibold leading-normal">
                    <strong>7-day rolling payout schedule:</strong> Stripe processes payments dynamically. Funds arrive securely to your bank account weekly.
                  </p>
                </div>

                <Link
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  className="block w-full text-center py-3.5 border-[0.5px] border-[#e5e5e5] rounded-2xl text-xs font-black text-[#222222] hover:bg-[#F2F2F0] active:scale-95 transition-all"
                >
                  Manage payout account →
                </Link>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#222222] uppercase tracking-tight">Recent Orders</h2>
            
            <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] overflow-hidden shadow-sm">
              {orders.length === 0 ? (
                <div className="p-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-[#cccccc] mx-auto mb-4" />
                  <h3 className="text-base font-bold text-[#222222] mb-1">No orders yet</h3>
                  <p className="text-sm text-[#888888]">Your sales and client contracts will populate here once active.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-[0.5px] border-[#e5e5e5] bg-[#F9F9F8] text-[10px] font-black text-[#888888] uppercase tracking-widest">
                        <th className="px-6 py-4">Order ID / Buyer</th>
                        <th className="px-6 py-4">Product purchased</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Net Payout</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[0.5px] divide-[#e5e5e5]">
                      {orders.map((order, idx) => {
                        const anonBuyer = `Buyer #${order.buyer_id?.slice(-4) || "Anon"}`;
                        const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });

                        return (
                          <tr key={order.id} className="hover:bg-[#F9F9F8] transition-colors text-sm">
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#222222]">{anonBuyer}</p>
                              <p className="text-[10px] text-[#888888] font-semibold mt-0.5 truncate max-w-[120px]">
                                {order.id}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#222222]">{order.product?.name || "Deleted Product"}</p>
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#888888]">
                                {order.product?.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#888888] font-medium">{formattedDate}</td>
                            <td className="px-6 py-4 font-bold text-emerald-600">
                              ₹{(order.seller_payout / 100).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                order.status === "fulfilled" || order.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border-[0.5px] border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-[0.5px] border-amber-200"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {order.status !== "fulfilled" && order.status !== "completed" ? (
                                <button
                                  onClick={() => handleMarkFulfilled(order.id)}
                                  className="px-3 py-1.5 bg-[#222222] text-white hover:bg-black rounded-lg text-xs font-black transition-colors"
                                >
                                  Mark fulfilled
                                </button>
                              ) : (
                                <div className="flex items-center justify-end gap-1 text-emerald-600 text-xs font-bold">
                                  <CheckCircle className="w-3.5 h-3.5" /> Fulfilled
                                </div>
                              )}
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
          ? "bg-[#222222] text-white shadow-lg shadow-black/10"
          : "text-[#888888] hover:text-[#222222] hover:bg-[#F2F2F0]"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-[#888888] group-hover:text-[#222222]"}`} />
      {!collapsed && <span className="text-sm font-bold">{label}</span>}
    </Link>
  );
}

function NavItemMobile({ icon: Icon, label, active, href = "#" }: any) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${
        active ? "bg-[#222222] text-white" : "text-[#888888] hover:text-[#222222] hover:bg-[#F2F2F0]"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-bold">{label}</span>
    </Link>
  );
}

