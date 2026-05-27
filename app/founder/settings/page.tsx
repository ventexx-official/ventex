"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Plus,
  LayoutDashboard,
  FileText,
  Store,
  Zap,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Shield,
  CreditCard,
  Bell,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
} from "lucide-react";
import Link from "next/link";

export default function FounderSettingsPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Profile states
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [stripeConnectId, setStripeConnectId] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        setFullName(profile.full_name || "");
        setAvatarUrl(profile.avatar_url || "");
        setIsSeller(profile.is_seller || false);
        setStripeConnectId(profile.stripe_connect_id || "");
      } else {
        setUserProfile({ id: session.user.id, role: "founder" });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          is_seller: isSeller,
          stripe_connect_id: stripeConnectId || null,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      setSuccessMsg("Settings saved successfully!");
      setUserProfile((prev: any) => ({
        ...prev,
        full_name: fullName,
        avatar_url: avatarUrl,
        is_seller: isSeller,
        stripe_connect_id: stripeConnectId || null,
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const generateRandomAvatar = () => {
    const seeds = ["lucky", "sparky", "buster", "shadow", "fluffy", "pepper", "oreo"];
    const seed = seeds[Math.floor(Math.random() * seeds.length)] + Math.floor(Math.random() * 100);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
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
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[#888888]" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#222222] truncate">{fullName || "Founder"}</p>
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
          <NavItem icon={Zap} label="Booster Packs" href="/founder/boost" collapsed={sidebarCollapsed} />
          <NavItem icon={Settings} label="Settings" active href="/founder/settings" collapsed={sidebarCollapsed} />
        </nav>

        <nav className="flex md:hidden flex-1 items-center gap-1 px-3 overflow-x-auto py-2">
          <NavItemMobile icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" />
          <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" />
          <NavItemMobile icon={Store} label="Store" href="/founder/store" />
          <NavItemMobile icon={Tag} label="Deals" href="/founder/store/deals" />
          <NavItemMobile icon={Zap} label="Boost" href="/founder/boost" />
          <NavItemMobile icon={Settings} label="Settings" active href="/founder/settings" />
        </nav>
      </aside>

      {/* Main Panel */}
      <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <header>
            <h1 className="text-3xl font-black text-[#222222] tracking-tighter uppercase flex items-center gap-2">
              <Settings className="w-8 h-8 text-[#222222]" /> Settings
            </h1>
            <p className="text-[#888888] font-medium text-sm mt-1">Configure your personal and merchant preferences for Ventex.</p>
          </header>

          {/* Messages */}
          {errorMsg && (
            <div className="bg-red-50 border-[0.5px] border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border-[0.5px] border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{successMsg}</div>
            </div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSave} className="space-y-8 bg-white border-[0.5px] border-[#e5e5e5] rounded-3xl p-6 md:p-8 shadow-sm">
            {/* Profile Information */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#888888]" /> 01. Profile Details
              </h3>

              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] flex items-center justify-center overflow-hidden">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-[#888888]" />}
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomAvatar}
                    className="absolute -bottom-1 -right-1 bg-[#222222] hover:bg-black text-white p-2 rounded-full shadow-lg transition-transform duration-200 active:scale-90"
                    title="Generate Random Avatar"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Avatar URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://api.dicebear.com/..."
                      className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Merchant / Seller Settings */}
            <section className="space-y-6 pt-2">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#888888]" /> 02. Seller Configuration
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#F2F2F0] rounded-2xl border-[0.5px] border-[#e5e5e5]">
                  <div>
                    <h4 className="text-sm font-bold text-[#222222]">Register as Marketplace Seller</h4>
                    <p className="text-[11px] text-[#888888] font-semibold mt-0.5">Toggle to list products and custom packages on Ventex.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSeller(!isSeller)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isSeller ? "bg-[#222222]" : "bg-gray-300"}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${isSeller ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                {isSeller && (
                  <div className="space-y-4 pt-2 animate-fadeIn">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Stripe Connect Custom Account ID</label>
                      <input
                        type="text"
                        value={stripeConnectId}
                        onChange={(e) => setStripeConnectId(e.target.value)}
                        placeholder="acct_xxxxxxxxxxxx"
                        className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-white transition-all"
                      />
                      <p className="text-[10px] text-[#888888] font-bold">
                        Provide your Stripe Account ID to route checkout payments and payouts automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Notification and Security Placeholder */}
            <section className="space-y-6 pt-2">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#888888]" /> 03. Notification & Account Security
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[#888888] text-xs font-bold bg-[#F2F2F0] p-4 rounded-2xl border-[0.5px] border-[#e5e5e5]">
                  <Mail className="w-4 h-4" />
                  <span>Email notifications are enabled automatically for investor interests & product sales.</span>
                </div>
                <div className="flex flex-col gap-4 bg-[#F2F2F0] p-4 rounded-2xl border-[0.5px] border-[#e5e5e5] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#222222]">Two-Factor Authentication</h4>
                    <p className="mt-1 text-xs font-semibold text-[#888888]">Protect your account with an authenticator app.</p>
                    <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-[#888888]">Status: Not enabled</p>
                  </div>
                  <button type="button" className="rounded-2xl bg-[#222222] px-5 py-2.5 text-sm font-black text-white">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </section>

            {/* Save Buttons */}
            <div className="pt-4 border-t-[0.5px] border-[#e5e5e5] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#222222] hover:bg-black text-white text-sm font-black rounded-2xl shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </form>
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
