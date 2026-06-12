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
 Shield,
 CreditCard,
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
 const [enrolling2fa, setEnrolling2fa] = useState(false);
 const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
 const [errorMsg, setErrorMsg] = useState("");
 const [successMsg, setSuccessMsg] = useState("");

 const [userProfile, setUserProfile] = useState<any>(null);
 
 // Profile states
 const [fullName, setFullName] = useState("");
 const [avatarUrl, setAvatarUrl] = useState("");
 const [whatsappNumber, setWhatsappNumber] = useState("");
 const [isSeller, setIsSeller] = useState(false);
 const [stripeConnectId, setStripeConnectId] = useState("");
 const [startingSellerSetup, setStartingSellerSetup] = useState(false);

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
 if (profile.role === "investor") {
 router.replace("/investor/settings");
 return;
 }

 if (profile.role === "admin") {
 router.replace("/admin/users");
 return;
 }

 setUserProfile(profile);
 setFullName(profile.full_name || "");
 setAvatarUrl(profile.avatar_url || "");
 setWhatsappNumber(profile.whatsapp_number || "");
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
 whatsapp_number: whatsappNumber || null,
 is_seller: isSeller,
 })
 .eq("id", session.user.id);

 if (error) throw error;

 setSuccessMsg("Settings saved successfully!");
 setUserProfile((prev: any) => ({
 ...prev,
 full_name: fullName,
 avatar_url: avatarUrl,
 whatsapp_number: whatsappNumber || null,
 is_seller: isSeller,
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

 const enableTwoFactor = async () => {
 setEnrolling2fa(true);
 setErrorMsg("");
 try {
 const { error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
 if (error) throw error;
 setTwoFactorEnabled(true);
 setSuccessMsg("2FA setup started. Follow your authenticator app prompts to finish enrollment.");
 } catch (err: any) {
 setErrorMsg(err.message || "Could not start 2FA setup.");
 } finally {
 setEnrolling2fa(false);
 }
 };

 const startSellerSetup = async () => {
 setStartingSellerSetup(true);
 setErrorMsg("");
 try {
 const { data: { session } } = await supabase.auth.getSession();
 const res = await fetch("/api/seller/create-connect-account", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
 },
 body: JSON.stringify({}),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok || !data.url) throw new Error(data.error || "Could not start seller setup.");
 window.location.href = data.url;
 } catch (err: any) {
 setErrorMsg(err.message || "Could not start seller setup.");
 setStartingSellerSetup(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] rounded-full animate-spin" />
 </div>
 );
 }

 const sidebarW = sidebarCollapsed ? "md:w-[72px]" : "md:w-[240px]";
 const mainML = sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[240px]";

 return (
 <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)]">
 {/* Sidebar */}
 <aside className={`bg-[var(--card-bg)] border-b md:border-b-0 md:border-r-[0.5px] border-[var(--border)] flex md:flex-col md:fixed md:h-screen z-10 flex-shrink-0 transition-all duration-300 ${sidebarW}`}>
 <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b-[0.5px] border-[var(--border)] md:border-b-0">
 {!sidebarCollapsed && (
 <Link href="/" className="text-xl font-black italic tracking-tighter text-[var(--text)] uppercase">Ventex</Link>
 )}
 <button onClick={() => setSidebarCollapsed((v) => !v)} className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg)] transition-colors text-[var(--text2)] hover:text-[var(--text)] ml-auto">
 {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
 </button>
 </div>

 {!sidebarCollapsed && (
 <div className="hidden md:block px-4 py-4">
 <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-2xl">
 <div className="w-9 h-9 rounded-full bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
 {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[var(--text2)]" />}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-[var(--text)] truncate">{fullName || "Founder"}</p>
 <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text2)] bg-[var(--card-bg)] px-1.5 py-0.5 rounded border-[0.5px] border-[var(--border)]">Founder</span>
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
 <NavItem icon={Settings} label="Settings" active href="/founder/settings" collapsed={sidebarCollapsed} />
 </nav>

 <nav className="flex md:hidden flex-1 items-center gap-1 px-3 overflow-x-auto py-2">
 <NavItemMobile icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" />
 <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" />
 <NavItemMobile icon={Plus} label="Create" href="/founder/create-pitch" />
 <NavItemMobile icon={Store} label="Store" href="/founder/store" />
 <NavItemMobile icon={Tag} label="Deals" href="/founder/store/deals" />
 <NavItemMobile icon={Settings} label="Settings" active href="/founder/settings" />
 </nav>
 </aside>

 {/* Main Panel */}
 <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
 <div className="max-w-3xl mx-auto space-y-8">
 {/* Header */}
 <header>
 <h1 className="text-3xl font-black text-[var(--text)] tracking-tighter uppercase flex items-center gap-2">
 <Settings className="w-8 h-8 text-[var(--text)]" /> Settings
 </h1>
 <p className="text-[var(--text2)] font-medium text-sm mt-1">Configure your personal and merchant preferences for Ventex.</p>
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
 <form onSubmit={handleSave} className="space-y-8 bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
 {/* Profile Information */}
 <section className="space-y-6">
 <h3 className="text-xs font-black uppercase text-[var(--text2)] tracking-widest border-b-[0.5px] border-[var(--border)] pb-2 flex items-center gap-2">
 <User className="w-4 h-4 text-[var(--text2)]" /> 01. Profile Details
 </h3>

 <div className="flex flex-col sm:flex-row gap-6 items-center">
 <div className="relative group">
 <div className="w-24 h-24 rounded-full bg-[var(--bg)] border-[0.5px] border-[var(--border)] flex items-center justify-center overflow-hidden">
 {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-[var(--text2)]" />}
 </div>
 <button
 type="button"
 onClick={generateRandomAvatar}
 className="absolute -bottom-1 -right-1 bg-[var(--text)] hover:bg-black text-[var(--bg)] p-2 rounded-full shadow-lg transition-transform duration-200 active:scale-90"
 title="Generate Random Avatar"
 >
 <Camera className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="flex-1 w-full space-y-4">
 <div className="space-y-2">
 <label className="block text-xs font-black text-[var(--text2)] uppercase tracking-widest">Full Name</label>
 <input
 type="text"
 required
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 placeholder="Enter your name"
 className="w-full px-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-2xl text-sm font-bold text-[var(--text)] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all"
 />
 </div>

 {/* WhatsApp Number */}
 <div className="space-y-1.5">
 <label className="block text-xs font-black text-[var(--text2)] uppercase tracking-widest">
 WhatsApp Number <span className="text-red-400 ml-0.5">*</span>
 </label>
 <input
 type="tel"
 value={whatsappNumber}
 onChange={(e) => setWhatsappNumber(e.target.value)}
 placeholder="+91 XXXXX XXXXX"
 className="w-full px-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-2xl text-sm font-bold text-[var(--text)] placeholder:font-normal placeholder:text-[var(--text2)] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all"
 />
 <p className="text-[11px] text-[var(--text2)] font-medium">Buyers contact you directly. Include country code. (e.g. +91 98765 43210)</p>
 </div>

 <div className="space-y-2">
 <label className="block text-xs font-black text-[var(--text2)] uppercase tracking-widest">Avatar URL</label>
 <input
 type="text"
 value={avatarUrl}
 onChange={(e) => setAvatarUrl(e.target.value)}
 placeholder="https://api.dicebear.com/..."
 className="w-full px-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-2xl text-sm font-bold text-[var(--text)] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all"
 />
 </div>
 </div>
 </div>
 </section>

 {/* Merchant / Seller Settings */}
 <section className="space-y-6 pt-2">
 <h3 className="text-xs font-black uppercase text-[var(--text2)] tracking-widest border-b-[0.5px] border-[var(--border)] pb-2 flex items-center gap-2">
 <CreditCard className="w-4 h-4 text-[var(--text2)]" /> 02. Seller Configuration
 </h3>

 <div className="space-y-4">
 <div className="flex flex-col gap-4 p-5 bg-[var(--bg)] rounded-2xl border-[0.5px] border-[var(--border)] sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h4 className="text-sm font-bold text-[var(--text)]">Marketplace seller access</h4>
 <p className="text-[11px] text-[var(--text2)] font-semibold mt-0.5">
 Enable your storefront after your WhatsApp contact and managed payout setup are ready.
 </p>
 <div className="mt-3 flex flex-wrap gap-2">
 <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${isSeller ? "bg-emerald-500/10 text-emerald-600" : "bg-[var(--card-bg)] text-[var(--text2)]"}`}>
 {isSeller ? "Store enabled" : "Store disabled"}
 </span>
 <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${stripeConnectId ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
 {stripeConnectId ? "Payouts connected" : "Payout setup pending"}
 </span>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsSeller(!isSeller)}
 className={`flex h-11 min-w-[132px] items-center justify-center rounded-2xl px-4 text-xs font-black uppercase tracking-widest transition-colors ${isSeller ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--card-bg)] text-[var(--text)] border border-[var(--border)]"}`}
 >
 {isSeller ? "Disable store" : "Enable store"}
 </button>
 </div>

 {isSeller && (
 <div className="space-y-4 rounded-2xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] p-5 animate-fadeIn">
 <div>
 <h4 className="text-sm font-black text-[var(--text)]">Managed payout setup</h4>
 <p className="mt-1 text-xs font-semibold text-[var(--text2)]">
 Do not paste a Stripe account ID. Ventex creates or resumes your connected account and sends you through Stripe onboarding securely.
 </p>
 </div>
 <button
 type="button"
 onClick={startSellerSetup}
 disabled={startingSellerSetup}
 className="inline-flex items-center justify-center rounded-2xl bg-[var(--text)] px-5 py-3 text-sm font-black text-[var(--bg)] disabled:opacity-50"
 >
 {startingSellerSetup ? "Opening setup..." : stripeConnectId ? "Resume payout setup" : "Set up seller payouts"}
 </button>
 {stripeConnectId && (
 <p className="text-[10px] font-bold text-[var(--text2)]">
 Connected account stored securely. ID ending {stripeConnectId.slice(-4)}.
 </p>
 )}
 </div>
 )}
 </div>
 </section>

 {/* Notification and Security Placeholder */}
 <section className="space-y-6 pt-2">
 <h3 className="text-xs font-black uppercase text-[var(--text2)] tracking-widest border-b-[0.5px] border-[var(--border)] pb-2 flex items-center gap-2">
 <Shield className="w-4 h-4 text-[var(--text2)]" /> 03. Notification & Account Security
 </h3>

 <div className="space-y-3">
 <div className="flex items-center gap-3 text-[var(--text2)] text-xs font-bold bg-[var(--bg)] p-4 rounded-2xl border-[0.5px] border-[var(--border)]">
 <Mail className="w-4 h-4" />
 <span>Email notifications are enabled automatically for investor interests & product sales.</span>
 </div>
 <div className="flex flex-col gap-4 bg-[var(--bg)] p-4 rounded-2xl border-[0.5px] border-[var(--border)] sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h4 className="text-sm font-bold text-[var(--text)]">Two-Factor Authentication</h4>
 <p className="mt-1 text-xs font-semibold text-[var(--text2)]">Protect your account with an authenticator app.</p>
 <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-[var(--text2)]">Status: {twoFactorEnabled ? "Enabled" : "Not enabled"}</p>
 </div>
 <button type="button" onClick={enableTwoFactor} disabled={enrolling2fa} className="rounded-2xl bg-[var(--text)] px-5 py-2.5 text-sm font-black text-[var(--bg)] disabled:opacity-50">
 {enrolling2fa ? "Starting..." : "Enable 2FA"}
 </button>
 </div>
 </div>
 </section>

 {/* Save Buttons */}
 <div className="pt-4 border-t-[0.5px] border-[var(--border)] flex justify-end">
 <button
 type="submit"
 disabled={saving}
 className="px-6 py-3 bg-[var(--text)] hover:bg-black text-[var(--bg)] text-sm font-black rounded-2xl shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2"
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
 className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active ? "bg-[var(--text)] text-[var(--bg)] shadow-lg shadow-black/10" : "text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg)]"} ${collapsed ? "justify-center" : ""}`}>
 <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[var(--text)]" : "text-[var(--text2)] group-hover:text-[var(--text)]"}`} />
 {!collapsed && <span className="text-sm font-bold">{label}</span>}
 </Link>
 );
}

function NavItemMobile({ icon: Icon, label, active, href = "#" }: any) {
 return (
 <Link href={href} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${active ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg)]"}`}>
 <Icon className="w-4 h-4" />
 <span className="text-[9px] font-bold">{label}</span>
 </Link>
 );
}
