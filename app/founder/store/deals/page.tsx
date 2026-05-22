"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  LayoutDashboard,
  FileText,
  Store,
  Zap,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Clock,
  Trash2,
  Ticket,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

/* ─────────────────────── Types ─────────────────────── */
interface Product {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  deal_end_date: string | null;
  images_urls: string[] | null;
  category: string | null;
  status: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount_pct: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  product_id: string | null;
  is_active: boolean;
  created_at: string;
  product?: { name: string } | null;
}

/* ─────────────────── CountdownBadge ───────────────── */
function CountdownBadge({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const isExpired = timeLeft === "Expired";
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${isExpired ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
      <Clock className="w-2.5 h-2.5" />
      {timeLeft}
    </span>
  );
}

/* ─────────────────── Main Page ─────────────────────── */
export default function FounderDealsPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"deals" | "promo">("deals");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [savingDealId, setSavingDealId] = useState<string | null>(null);
  const [endingDealId, setEndingDealId] = useState<string | null>(null);
  const [dealForms, setDealForms] = useState<Record<string, { price: string; endDate: string }>>({});
  const [openDealForm, setOpenDealForm] = useState<string | null>(null);

  // Promo codes state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discount_pct: "",
    max_uses: "",
    expires_at: "",
    product_id: "",
  });
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  /* ─── Auth + initial fetch ─── */
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("users").select("*").eq("id", session.user.id).single();

      setUserProfile(profile || { id: session.user.id, full_name: session.user.email, role: 'founder' });

      // Fetch products
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, discount_price, deal_end_date, images_urls, category, status")
        .eq("seller_id", session.user.id)
        .eq("status", "live")
        .order("created_at", { ascending: false });

      setProducts(prods || []);

      // Initialise deal forms
      const forms: Record<string, { price: string; endDate: string }> = {};
      (prods || []).forEach((p: Product) => {
        forms[p.id] = {
          price: p.discount_price ? String(p.discount_price / 100) : "",
          endDate: p.deal_end_date ? new Date(p.deal_end_date).toISOString().slice(0, 16) : "",
        };
      });
      setDealForms(forms);

      setLoading(false);
      fetchPromoCodes(session.user.id);
    };
    init();
  }, [router]);

  const fetchPromoCodes = async (sellerId: string) => {
    setLoadingPromos(true);
    const { data } = await supabase
      .from("promo_codes")
      .select("*, product:product_id(name)")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    setPromoCodes(data || []);
    setLoadingPromos(false);
  };

  /* ─── Deal handlers ─── */
  const activeDeals = products.filter(
    (p) => p.discount_price && p.deal_end_date && new Date(p.deal_end_date) > new Date()
  );
  const eligibleProducts = products.filter(
    (p) => !(p.discount_price && p.deal_end_date && new Date(p.deal_end_date) > new Date())
  );

  const handleSaveDeal = useCallback(async (productId: string) => {
    const form = dealForms[productId];
    if (!form?.price || !form?.endDate) {
      alert("Please enter both deal price and end date.");
      return;
    }
    const dealPricePaise = Math.round(parseFloat(form.price) * 100);
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (dealPricePaise >= product.price) {
      alert("Deal price must be lower than the original price.");
      return;
    }
    if (new Date(form.endDate) <= new Date()) {
      alert("End date must be in the future.");
      return;
    }

    setSavingDealId(productId);
    const { error } = await supabase
      .from("products")
      .update({
        discount_price: dealPricePaise,
        deal_end_date: new Date(form.endDate).toISOString(),
      })
      .eq("id", productId);

    if (error) {
      alert("Failed to save deal: " + error.message);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, discount_price: dealPricePaise, deal_end_date: new Date(form.endDate).toISOString() }
            : p
        )
      );
      setOpenDealForm(null);
    }
    setSavingDealId(null);
  }, [dealForms, products]);

  const handleEndDeal = useCallback(async (productId: string) => {
    if (!confirm("End this deal early? The price will revert to the original.")) return;
    setEndingDealId(productId);
    const { error } = await supabase
      .from("products")
      .update({ discount_price: null, deal_end_date: null })
      .eq("id", productId);

    if (error) {
      alert("Failed to end deal: " + error.message);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, discount_price: null, deal_end_date: null } : p
        )
      );
    }
    setEndingDealId(null);
  }, []);

  /* ─── Promo code handlers ─── */
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const prefix = newPromo.code.trim().toUpperCase() || "DEAL";
    const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setNewPromo((p) => ({ ...p, code: `${prefix}${suffix}` }));
  };

  const handleCreatePromo = async () => {
    setPromoError("");
    if (!newPromo.code.trim()) { setPromoError("Code name is required."); return; }
    if (!newPromo.discount_pct || isNaN(Number(newPromo.discount_pct)) || Number(newPromo.discount_pct) <= 0 || Number(newPromo.discount_pct) > 100) {
      setPromoError("Discount must be between 1 and 100%."); return;
    }

    setSavingPromo(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("promo_codes").insert({
      seller_id: session.user.id,
      code: newPromo.code.trim().toUpperCase(),
      discount_pct: Number(newPromo.discount_pct),
      max_uses: newPromo.max_uses ? Number(newPromo.max_uses) : null,
      expires_at: newPromo.expires_at ? new Date(newPromo.expires_at).toISOString() : null,
      product_id: newPromo.product_id || null,
      is_active: true,
      used_count: 0,
    });

    if (error) {
      setPromoError(error.message.includes("duplicate") ? "That code already exists. Choose a unique code." : "Failed to create promo: " + error.message);
    } else {
      setNewPromo({ code: "", discount_pct: "", max_uses: "", expires_at: "", product_id: "" });
      await fetchPromoCodes(session.user.id);
    }
    setSavingPromo(false);
  };

  const handleTogglePromo = async (promoId: string, currentActive: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !currentActive }).eq("id", promoId);
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, is_active: !currentActive } : p))
    );
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm("Delete this promo code? This cannot be undone.")) return;
    await supabase.from("promo_codes").delete().eq("id", promoId);
    setPromoCodes((prev) => prev.filter((p) => p.id !== promoId));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  /* ─── Layout vars ─── */
  const sidebarW = sidebarCollapsed ? "md:w-[72px]" : "md:w-[240px]";
  const mainML = sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[240px]";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F2F0]">
      {/* ── SIDEBAR ── */}
      <aside className={`bg-white border-b md:border-b-0 md:border-r-[0.5px] border-[#e5e5e5] flex md:flex-col md:fixed md:h-screen z-10 flex-shrink-0 transition-all duration-300 ${sidebarW}`}>
        <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b-[0.5px] border-[#e5e5e5] md:border-b-0">
          {!sidebarCollapsed && (
            <Link href="/" className="text-xl font-black italic tracking-tighter text-[#222222] uppercase">Ventex</Link>
          )}
          <button onClick={() => setSidebarCollapsed((v) => !v)} className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F2F2F0] transition-colors text-[#888888] hover:text-[#222222] ml-auto">
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="hidden md:block px-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-[#F2F2F0] rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-white border-[0.5px] border-[#e5e5e5] flex items-center justify-center overflow-hidden flex-shrink-0">
                {userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[#888888]" />}
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
          <NavItem icon={Store} label="My Store" href="/founder/store" collapsed={sidebarCollapsed} />
          <NavItem icon={Tag} label="Deals & Promos" active href="/founder/store/deals" collapsed={sidebarCollapsed} />
          <NavItem icon={Zap} label="Booster Packs" href="/founder/boost" collapsed={sidebarCollapsed} />
          <NavItem icon={Settings} label="Settings" href="/founder/settings" collapsed={sidebarCollapsed} />
        </nav>

        <nav className="flex md:hidden flex-1 items-center gap-1 px-3 overflow-x-auto py-2">
          <NavItemMobile icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" />
          <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" />
          <NavItemMobile icon={Store} label="Store" href="/founder/store" />
          <NavItemMobile icon={Tag} label="Deals" active href="/founder/store/deals" />
          <NavItemMobile icon={Zap} label="Boost" href="/founder/boost" />
          <NavItemMobile icon={Settings} label="Settings" href="/founder/settings" />
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#222222] tracking-tighter uppercase">Deals & Promos</h1>
              <p className="text-[#888888] font-medium text-sm mt-1">Run time-limited deals and create promo codes for your store.</p>
            </div>
            <Link
              href="/founder/store"
              className="flex items-center gap-2 text-sm font-bold text-[#888888] hover:text-[#222222] transition-colors"
            >
              ← Back to Store
            </Link>
          </header>

          {/* Tab Bar */}
          <div className="flex gap-1 bg-white border-[0.5px] border-[#e5e5e5] rounded-2xl p-1.5 w-fit shadow-sm">
            {(["deals", "promo"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? "bg-[#222222] text-white shadow-md" : "text-[#888888] hover:text-[#222222]"}`}
              >
                {tab === "deals" ? "⚡ Active Deals" : "🎟️ Promo Codes"}
              </button>
            ))}
          </div>

          {/* ═══════════════════ DEALS TAB ═══════════════════ */}
          {activeTab === "deals" && (
            <div className="space-y-6">

              {/* Active Deals */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-[#222222] uppercase tracking-tight">Active Deals</h2>
                  <span className="text-xs font-bold text-[#888888]">{activeDeals.length} running</span>
                </div>

                {activeDeals.length === 0 ? (
                  <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] p-12 text-center shadow-sm">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-7 h-7 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-[#222222] mb-1">No active deals</h3>
                    <p className="text-sm text-[#888888]">Add a deal on any product below to show a countdown timer on the marketplace.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeDeals.map((product) => {
                      const pct = Math.round((1 - product.discount_price! / product.price) * 100);
                      return (
                        <div key={product.id} className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#F2F2F0] overflow-hidden flex-shrink-0">
                              {product.images_urls?.[0] ? (
                                <img src={product.images_urls[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#888888]">
                                  <Tag className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#222222] text-sm">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{pct}% OFF</span>
                                <span className="text-sm font-black text-emerald-600">₹{(product.discount_price! / 100).toLocaleString()}</span>
                                <span className="text-xs text-[#888888] line-through">₹{(product.price / 100).toLocaleString()}</span>
                                {product.deal_end_date && <CountdownBadge endDate={product.deal_end_date} />}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEndDeal(product.id)}
                            disabled={endingDealId === product.id}
                            className="flex items-center gap-2 px-4 py-2.5 border-[0.5px] border-red-200 text-red-500 hover:bg-red-50 rounded-2xl text-xs font-bold transition-all disabled:opacity-40 flex-shrink-0"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {endingDealId === product.id ? "Ending..." : "End Early"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Set Deal on Product */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-[#222222] uppercase tracking-tight">Set a Deal</h2>
                  <span className="text-xs font-bold text-[#888888]">{eligibleProducts.length} products available</span>
                </div>

                {eligibleProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] p-8 text-center shadow-sm">
                    <p className="text-sm text-[#888888]">All your live products already have active deals.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eligibleProducts.map((product) => {
                      const form = dealForms[product.id] || { price: "", endDate: "" };
                      const isOpen = openDealForm === product.id;

                      return (
                        <div key={product.id} className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm overflow-hidden">
                          <button
                            onClick={() => setOpenDealForm(isOpen ? null : product.id)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F9F9F8] transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#F2F2F0] overflow-hidden flex-shrink-0">
                                {product.images_urls?.[0] ? (
                                  <img src={product.images_urls[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#cccccc]">
                                    <Tag className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-[#222222] text-sm">{product.name}</p>
                                <p className="text-xs text-[#888888] mt-0.5">Original price: ₹{(product.price / 100).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#888888] px-3 py-1.5 bg-[#F2F2F0] rounded-full">Set Deal</span>
                              <ChevronDown className={`w-4 h-4 text-[#888888] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-5 border-t-[0.5px] border-[#e5e5e5] pt-5 bg-[#F9F9F8] animate-in slide-in-from-top-2 duration-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">
                                    Deal Price (₹)
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] font-bold text-sm">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder={`Max: ₹${(product.price / 100 - 0.01).toFixed(2)}`}
                                      value={form.price}
                                      onChange={(e) =>
                                        setDealForms((prev) => ({ ...prev, [product.id]: { ...prev[product.id], price: e.target.value } }))
                                      }
                                      className="w-full pl-8 pr-4 py-3 bg-white border-[0.5px] border-[#e5e5e5] rounded-xl text-sm font-bold text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                                    />
                                  </div>
                                  {form.price && !isNaN(Number(form.price)) && Number(form.price) > 0 && (
                                    <p className="text-xs text-emerald-600 font-bold mt-1.5">
                                      {Math.round((1 - (Number(form.price) * 100) / product.price) * 100)}% discount
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">
                                    Deal End Date & Time
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={form.endDate}
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) =>
                                      setDealForms((prev) => ({ ...prev, [product.id]: { ...prev[product.id], endDate: e.target.value } }))
                                    }
                                    className="w-full px-4 py-3 bg-white border-[0.5px] border-[#e5e5e5] rounded-xl text-sm font-bold text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end mt-4">
                                <button
                                  onClick={() => handleSaveDeal(product.id)}
                                  disabled={savingDealId === product.id}
                                  className="px-6 py-3 bg-[#222222] text-white rounded-2xl text-sm font-bold hover:bg-black active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                  <Sparkles className="w-4 h-4" />
                                  {savingDealId === product.id ? "Saving..." : "Launch Deal"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══════════════════ PROMO TAB ═══════════════════ */}
          {activeTab === "promo" && (
            <div className="space-y-6">

              {/* Create promo form */}
              <section className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b-[0.5px] border-[#e5e5e5]">
                  <h2 className="text-base font-black text-[#222222] uppercase tracking-tight flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-indigo-500" /> Generate Promo Code
                  </h2>
                  <p className="text-xs text-[#888888] mt-1 font-medium">Creates a reusable discount code buyers can enter at checkout.</p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Code name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. LAUNCH50"
                          value={newPromo.code}
                          onChange={(e) => setNewPromo((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                          className="flex-1 px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-xl text-sm font-bold text-[#222222] uppercase focus:outline-none focus:ring-1 focus:ring-[#222222] focus:bg-white transition-all"
                        />
                        <button
                          onClick={generateCode}
                          title="Auto-generate code"
                          className="px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-xl text-xs font-bold text-[#888888] hover:text-[#222222] hover:bg-white transition-all flex-shrink-0"
                        >
                          ✨ Auto
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">Discount %</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="e.g. 20"
                          value={newPromo.discount_pct}
                          onChange={(e) => setNewPromo((p) => ({ ...p, discount_pct: e.target.value }))}
                          className="w-full pl-4 pr-10 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-xl text-sm font-bold text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] focus:bg-white transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] font-black text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">Max Uses</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Unlimited"
                        value={newPromo.max_uses}
                        onChange={(e) => setNewPromo((p) => ({ ...p, max_uses: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-xl text-sm font-bold text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">Expiry Date</label>
                      <input
                        type="datetime-local"
                        value={newPromo.expires_at}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setNewPromo((p) => ({ ...p, expires_at: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-xl text-sm font-bold text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">
                        Limit to Product <span className="normal-case text-[#cccccc]">(optional)</span>
                      </label>
                      <select
                        value={newPromo.product_id}
                        onChange={(e) => setNewPromo((p) => ({ ...p, product_id: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-xl text-sm font-bold text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] focus:bg-white transition-all"
                      >
                        <option value="">All products</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {promoError && (
                    <div className="flex items-center gap-2 bg-red-50 border-[0.5px] border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {promoError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleCreatePromo}
                      disabled={savingPromo}
                      className="px-6 py-3 bg-[#222222] text-white rounded-2xl text-sm font-bold hover:bg-black active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      {savingPromo ? "Creating..." : "Create Promo Code"}
                    </button>
                  </div>
                </div>
              </section>

              {/* Promo codes list */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-[#222222] uppercase tracking-tight">Your Promo Codes</h2>
                  <span className="text-xs font-bold text-[#888888]">{promoCodes.length} total</span>
                </div>

                <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm overflow-hidden">
                  {loadingPromos ? (
                    <div className="p-12 flex justify-center">
                      <div className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
                    </div>
                  ) : promoCodes.length === 0 ? (
                    <div className="p-12 text-center">
                      <Ticket className="w-10 h-10 text-[#cccccc] mx-auto mb-3" />
                      <p className="text-sm font-bold text-[#222222]">No promo codes yet</p>
                      <p className="text-xs text-[#888888] mt-1">Create your first promo code above.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-[0.5px] border-[#e5e5e5] bg-[#F9F9F8] text-[10px] font-black text-[#888888] uppercase tracking-widest">
                            <th className="px-5 py-4">Code</th>
                            <th className="px-5 py-4">Discount</th>
                            <th className="px-5 py-4">Uses</th>
                            <th className="px-5 py-4">Scope</th>
                            <th className="px-5 py-4">Expires</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-[0.5px] divide-[#e5e5e5]">
                          {promoCodes.map((promo) => {
                            const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
                            const isExhausted = promo.max_uses !== null && promo.used_count >= promo.max_uses;
                            const isEffectivelyActive = promo.is_active && !isExpired && !isExhausted;

                            return (
                              <tr key={promo.id} className="hover:bg-[#F9F9F8] transition-colors text-sm">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-[#222222] tracking-widest text-xs bg-[#F2F2F0] px-2.5 py-1 rounded-lg">{promo.code}</span>
                                    <button
                                      onClick={() => copyCode(promo.code)}
                                      className="p-1 rounded hover:bg-[#e5e5e5] transition-colors text-[#888888]"
                                      title="Copy code"
                                    >
                                      {copiedCode === promo.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-5 py-4 font-bold text-emerald-600">{promo.discount_pct}%</td>
                                <td className="px-5 py-4">
                                  <div>
                                    <span className="font-bold text-[#222222]">{promo.used_count}</span>
                                    {promo.max_uses !== null && (
                                      <span className="text-[#888888] text-xs"> / {promo.max_uses}</span>
                                    )}
                                    {promo.max_uses === null && (
                                      <span className="text-[#888888] text-xs"> (unlimited)</span>
                                    )}
                                  </div>
                                  {promo.max_uses !== null && (
                                    <div className="w-16 h-1 bg-[#e5e5e5] rounded-full mt-1">
                                      <div
                                        className="h-full bg-[#222222] rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (promo.used_count / promo.max_uses) * 100)}%` }}
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-xs text-[#888888] font-medium">
                                  {promo.product ? (
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide">{(promo.product as any).name}</span>
                                  ) : (
                                    "All products"
                                  )}
                                </td>
                                <td className="px-5 py-4 text-xs text-[#888888] font-medium">
                                  {promo.expires_at
                                    ? new Date(promo.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                    : "—"}
                                </td>
                                <td className="px-5 py-4">
                                  {isExpired ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-500">Expired</span>
                                  ) : isExhausted ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600">Exhausted</span>
                                  ) : isEffectivelyActive ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">Active</span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">Paused</span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {!isExpired && !isExhausted && (
                                      <button
                                        onClick={() => handleTogglePromo(promo.id, promo.is_active)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${promo.is_active ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                                      >
                                        {promo.is_active ? "Pause" : "Resume"}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeletePromo(promo.id)}
                                      className="p-1.5 rounded-lg text-[#888888] hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
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
              </section>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* ─────────────── Nav components ─────────────── */
function NavItem({ icon: Icon, label, active, href = "#", collapsed }: any) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        active ? "bg-[#222222] text-white shadow-lg shadow-black/10" : "text-[#888888] hover:text-[#222222] hover:bg-[#F2F2F0]"
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
