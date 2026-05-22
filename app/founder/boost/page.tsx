"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  FileText,
  Store,
  Tag,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Plus,
  Rocket,
  Flame,
  Eye,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Pitch {
  id: string;
  title: string;
  tagline: string;
  industry: string;
  featured: boolean;
}

export default function FounderBoostPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boosting, setBoosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedPitchId, setSelectedPitchId] = useState("");
  const [selectedTier, setSelectedTier] = useState<"silver" | "gold" | "platinum">("gold");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUserProfile(profile || { id: session.user.id, role: "founder" });

      // Fetch user's pitches
      const { data: myPitches } = await supabase
        .from("pitches")
        .select("id, title, tagline, industry, featured")
        .eq("founder_id", session.user.id);

      const fetchedPitches = myPitches || [];
      setPitches(fetchedPitches);
      if (fetchedPitches.length > 0) {
        setSelectedPitchId(fetchedPitches[0].id);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSimulateBoost = async () => {
    if (!selectedPitchId) {
      setErrorMsg("Please select a pitch to boost.");
      return;
    }
    setBoosting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase
        .from("pitches")
        .update({ featured: true })
        .eq("id", selectedPitchId);

      if (error) throw error;

      setSuccessMsg("Success! Payment simulated and Booster Pack is active!");
      setPitches(prev => prev.map(p => p.id === selectedPitchId ? { ...p, featured: true } : p));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to active booster pack.");
    } finally {
      setBoosting(false);
    }
  };

  const activePitch = pitches.find(p => p.id === selectedPitchId);

  const tiers = {
    silver: {
      name: "Silver Spark",
      price: "$29",
      period: "7 days",
      icon: Sparkles,
      color: "from-slate-400 to-slate-500",
      textColor: "text-slate-500",
      benefits: [
        "2x increase in visibility",
        "Highlighted card style",
        "Detailed performance insights",
      ],
    },
    gold: {
      name: "Gold Launchpad",
      price: "$79",
      period: "14 days",
      icon: Flame,
      color: "from-amber-400 to-amber-600",
      textColor: "text-amber-500",
      benefits: [
        "5x increase in visibility",
        "Gradient premium glow border",
        "Weekly email digest placement",
        "Direct feedback tool",
      ],
    },
    platinum: {
      name: "Platinum Rocket",
      price: "$199",
      period: "30 days",
      icon: Rocket,
      color: "from-indigo-500 to-purple-600",
      textColor: "text-indigo-500",
      benefits: [
        "10x increase in visibility",
        "Animated premium card style",
        "Front-page featured banner",
        "Direct intros to top investors",
        "Exclusive premium founder group access",
      ],
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarW = sidebarCollapsed ? "md:w-[72px]" : "md:w-[240px]";
  const mainML = sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[240px]";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F2F0]">
      {/* Sidebar */}
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
          <NavItem icon={Tag} label="Deals & Promos" href="/founder/store/deals" collapsed={sidebarCollapsed} />
          <NavItem icon={Zap} label="Booster Packs" active href="/founder/boost" collapsed={sidebarCollapsed} />
          <NavItem icon={Settings} label="Settings" href="/founder/settings" collapsed={sidebarCollapsed} />
        </nav>

        <nav className="flex md:hidden flex-1 items-center gap-1 px-3 overflow-x-auto py-2">
          <NavItemMobile icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" />
          <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" />
          <NavItemMobile icon={Store} label="Store" href="/founder/store" />
          <NavItemMobile icon={Tag} label="Deals" href="/founder/store/deals" />
          <NavItemMobile icon={Zap} label="Boost" active href="/founder/boost" />
          <NavItemMobile icon={Settings} label="Settings" href="/founder/settings" />
        </nav>
      </aside>

      {/* Main Panel */}
      <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#222222] tracking-tighter uppercase flex items-center gap-2">
                <Zap className="w-8 h-8 text-[#222222] fill-[#222222]" /> Booster Packs
              </h1>
              <p className="text-[#888888] font-medium text-sm mt-1">Get 10x more eyes on your startup pitch from premier investors globally.</p>
            </div>
            <Link
              href="/founder/dashboard"
              className="flex items-center gap-2 text-sm font-bold text-[#888888] hover:text-[#222222] transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </header>

          {/* Messages */}
          {errorMsg && (
            <div className="bg-red-50 border-[0.5px] border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border-[0.5px] border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{successMsg}</div>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Booster Tiers Selector */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border-[0.5px] border-[#e5e5e5] rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">
                  01. Select Startup Pitch
                </h3>
                {pitches.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-[#888888] font-semibold">You don't have any pitches yet.</p>
                    <Link
                      href="/founder/create-pitch"
                      className="mt-3 inline-block px-4 py-2 bg-[#222222] text-white text-xs font-bold rounded-xl"
                    >
                      Create your first pitch
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Select Pitch</label>
                    <select
                      value={selectedPitchId}
                      onChange={(e) => setSelectedPitchId(e.target.value)}
                      className="w-full bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                    >
                      {pitches.map(p => (
                        <option key={p.id} value={p.id}>{p.title} {p.featured ? "🌟 (Boosted)" : ""}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Booster cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(tiers) as Array<keyof typeof tiers>).map((tierKey) => {
                  const t = tiers[tierKey];
                  const Icon = t.icon;
                  const isSelected = selectedTier === tierKey;
                  return (
                    <button
                      key={tierKey}
                      onClick={() => setSelectedTier(tierKey)}
                      className={`text-left p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#222222] border-[#222222] text-white shadow-xl scale-[1.02]"
                          : "bg-white border-[#e5e5e5] text-[#222222] hover:border-[#888888]"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-base uppercase tracking-tight">{t.name}</h4>
                          <span className={`text-[10px] font-bold ${isSelected ? "text-white/60" : "text-[#888888]"}`}>
                            Duration: {t.period}
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 space-y-2 w-full border-t border-dashed border-[#e5e5e5]/20 pt-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black tracking-tight">{t.price}</span>
                          <span className={`text-[10px] font-bold ${isSelected ? "text-white/60" : "text-[#888888]"}`}>
                            One-time fee
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tier Benefits */}
              <div className="bg-white border-[0.5px] border-[#e5e5e5] rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">
                  Included Benefits & Coverage
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tiers[selectedTier].benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-[#555555] font-semibold">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${tiers[selectedTier].textColor}`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side: Mock Card Preview & Checkout */}
            <div className="space-y-6">
              <div className="bg-white border-[0.5px] border-[#e5e5e5] rounded-3xl p-6 space-y-6 shadow-sm">
                <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">
                  Live Preview
                </h3>

                {/* Mock Card */}
                <div className={`relative rounded-3xl p-6 transition-all duration-500 overflow-hidden ${
                  selectedTier === "silver" ? "bg-white border-[2px] border-slate-300 shadow-lg" :
                  selectedTier === "gold" ? "bg-white border-[3px] border-amber-400 shadow-xl shadow-amber-400/5 animate-pulse" :
                  "bg-[#222222] text-white shadow-2xl shadow-indigo-500/10 border border-indigo-500/30"
                }`}>
                  {/* Floating Glowing Badge */}
                  <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    selectedTier === "silver" ? "bg-slate-100 text-slate-600" :
                    selectedTier === "gold" ? "bg-amber-100 text-amber-600" :
                    "bg-indigo-500 text-white animate-bounce"
                  }`}>
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    Boosted ({tiers[selectedTier].name})
                  </span>

                  <div className="space-y-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      selectedTier === "platinum" ? "bg-white/10 text-indigo-300" : "bg-[#F2F2F0] text-[#888888]"
                    }`}>
                      {activePitch?.industry || "AI / Deeptech"}
                    </span>

                    <div>
                      <h4 className="text-lg font-black tracking-tight uppercase truncate">
                        {activePitch?.title || "Project Alpha"}
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                        selectedTier === "platinum" ? "text-white/60" : "text-[#888888]"
                      }`}>
                        {activePitch?.tagline || "Redefining startup growth with high-performance metrics."}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-2 border-t border-[#e5e5e5]/10 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-emerald-500" />
                        <span>2x Views</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#888888]" />
                        <span>Top Tier Rank</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Checkout Block */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#888888]">
                    <span>Subtotal:</span>
                    <span>{tiers[selectedTier].price}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#888888]">
                    <span>Platform Tax:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-[#222222] border-t border-[#e5e5e5] pt-2">
                    <span>Total Price:</span>
                    <span>{tiers[selectedTier].price}</span>
                  </div>

                  <button
                    onClick={handleSimulateBoost}
                    disabled={boosting || !selectedPitchId}
                    className="w-full py-4 bg-[#222222] hover:bg-black text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {boosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Finalizing Checkout...
                      </>
                    ) : (
                      <>
                        Activate Pitch Boost <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
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
    <Link href={href} title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active ? "bg-[#222222] text-white shadow-lg shadow-black/10" : "text-[#888888] hover:text-[#222222] hover:bg-[#F2F2F0]"} ${collapsed ? "justify-center" : ""}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-[#888888] group-hover:text-[#222222]"}`} />
      {!collapsed && <span className="text-sm font-bold">{label}</span>}
    </Link>
  );
}

function NavItemMobile({ icon: Icon, label, active, href = "#" }: any) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${active ? "bg-[#222222] text-white" : "text-[#888888] hover:text-[#222222] hover:bg-[#F2F2F0]"}`}>
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-bold">{label}</span>
    </Link>
  );
}
