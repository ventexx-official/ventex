"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
 LayoutDashboard, Bookmark, MessageSquare, Briefcase, 
 Search, Settings, PanelLeftClose, PanelLeftOpen, 
 User, Star, Eye, Clock, Trash2, 
 ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function InvestorPortal() {
 const [userProfile, setUserProfile] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

 // Data states
 const [stats, setStats] = useState({ viewed: 0, interests: 0, watchlist: 0, daysLeft: 0 });
 const [newPitches, setNewPitches] = useState<any[]>([]);
 const [savedPitches, setSavedPitches] = useState<any[]>([]);
 const [interests, setInterests] = useState<any[]>([]);
 
 // Advanced search states
 const [searchQuery, setSearchQuery] = useState('');
 const [searchResults, setSearchResults] = useState<any[]>([]);
 const [filters, setFilters] = useState({
 industry: '',
 stage: '',
 activelyRaising: false,
 fundingMin: '',
 fundingMax: '',
 mrrMin: '',
 mrrMax: '',
 });

 const router = useRouter();

 useEffect(() => {
 const fetchData = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) { router.push('/login?redirect=/investor/portal'); return; }

 const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
 
 if (!profile || (!profile.investor_premium && !profile.ventex_access)) {
 router.push('/pricing');
 return;
 }

 // Check subscription date
 if (profile.subscription_end_date) {
 const endDate = new Date(profile.subscription_end_date);
 const now = new Date();
 if (endDate < now) {
 router.push('/pricing');
 return;
 }
 const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
 setStats(s => ({ ...s, daysLeft }));
 }

 setUserProfile(profile);

 // Fetch "New pitches this week" (latest 4 live)
 const { data: latestPitches } = await supabase
 .from('pitches')
 .select('*')
 .eq('status', 'live')
 .order('created_at', { ascending: false })
 .limit(4);
 
 if (latestPitches) setNewPitches(latestPitches);

 // Fetch saved pitches
 const { data: savedData } = await supabase
 .from('saved_pitches')
 .select('*, pitch:pitches(*)')
 .eq('user_id', session.user.id)
 .order('created_at', { ascending: false });

 if (savedData) {
 setSavedPitches(savedData.map(s => s.pitch).filter(Boolean));
 setStats(s => ({ ...s, watchlist: savedData.length }));
 }

 // Fetch expressed interests
 const { data: interestData } = await supabase
 .from('investor_interests')
 .select('*, pitch:pitches(*)')
 .eq('investor_id', session.user.id)
 .order('created_at', { ascending: false });

 if (interestData) {
 setInterests(interestData);
 setStats(s => ({ ...s, interests: interestData.length }));
 }

 // Mock pitches viewed stat for now (could add a views tracking table later)
 setStats(s => ({ ...s, viewed: 42 })); 

 setLoading(false);
 };

 fetchData();
 }, [router]);

 // Real-time Advanced Search
 useEffect(() => {
 const fetchSearch = async () => {
 if (!userProfile) return;

 let query = supabase.from('pitches').select('*');

 if (filters.activelyRaising) {
 query = query.eq('status', 'live');
 }
 if (filters.industry) {
 query = query.ilike('industry', `%${filters.industry}%`);
 }
 if (filters.stage) {
 query = query.ilike('company_stage', `%${filters.stage}%`);
 }
 if (filters.fundingMin) {
 query = query.gte('amount_seeking', parseInt(filters.fundingMin));
 }
 if (filters.fundingMax) {
 query = query.lte('amount_seeking', parseInt(filters.fundingMax));
 }
 if (filters.mrrMin) {
 query = query.gte('mrr', parseInt(filters.mrrMin));
 }
 if (filters.mrrMax) {
 query = query.lte('mrr', parseInt(filters.mrrMax));
 }
 if (searchQuery) {
 query = query.ilike('title', `%${searchQuery}%`);
 }

 const { data } = await query.limit(20);
 if (data) setSearchResults(data);
 };

 const timer = setTimeout(() => {
 fetchSearch();
 }, 300);

 return () => clearTimeout(timer);
 }, [filters, searchQuery, userProfile]);

 const handleRemoveSaved = async (pitchId: string) => {
 setSavedPitches(prev => prev.filter(p => p.id !== pitchId));
 await supabase.from('saved_pitches').delete().match({ user_id: userProfile.id, pitch_id: pitchId });
 setStats(s => ({ ...s, watchlist: s.watchlist - 1 }));
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] rounded-full animate-spin"></div>
 </div>
 );
 }

 const sidebarW = sidebarCollapsed ? 'md:w-[72px]' : 'md:w-[240px]';
 const mainML = sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]';

 return (
 <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)]">

 {/* Ã¢â€â‚¬Ã¢â€â‚¬ SIDEBAR Ã¢â€â‚¬Ã¢â€â‚¬ */}
 <aside className={`bg-[var(--card-bg)] border-b md:border-b-0 md:border-r-[0.5px] border-[var(--border)] flex md:flex-col md:fixed md:h-screen z-20 flex-shrink-0 transition-all duration-300 ${sidebarW}`}>
 <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b-[0.5px] border-[var(--border)] md:border-b-0">
 {!sidebarCollapsed && <Link href="/" className="text-xl font-black italic tracking-tighter text-[var(--text)] uppercase">Ventex</Link>}
 <button onClick={() => setSidebarCollapsed(v => !v)} className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg)] text-[var(--text2)] hover:text-[var(--text)] ml-auto">
 {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
 </button>
 </div>

 {!sidebarCollapsed && (
 <div className="hidden md:block px-4 py-4">
 <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#222222] to-black rounded-2xl text-[var(--text)] shadow-xl shadow-black/10">
 <div className="w-9 h-9 rounded-full bg-[var(--card-bg)]/10 flex items-center justify-center overflow-hidden flex-shrink-0 border-[0.5px] border-white/20">
 {userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold truncate">{userProfile?.full_name || 'Investor'}</p>
 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
 <Star className="w-2.5 h-2.5 fill-current" /> Premium
 </span>
 </div>
 </div>
 </div>
 )}
 {sidebarCollapsed && (
 <div className="hidden md:flex justify-center py-4">
 <div className="w-9 h-9 rounded-full bg-[var(--text)] text-[var(--bg)] flex items-center justify-center overflow-hidden border-[0.5px] border-white/20">
 {userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
 </div>
 </div>
 )}

 <nav className="hidden md:flex flex-grow flex-col px-2 space-y-1 pt-2">
 <NavItem icon={LayoutDashboard} label="Dashboard" active collapsed={sidebarCollapsed} />
 <NavItem icon={Bookmark} label="Saved Pitches" collapsed={sidebarCollapsed} />
 <NavItem icon={MessageSquare} label="My Interests" collapsed={sidebarCollapsed} />
 <NavItem icon={Briefcase} label="Deal Room" collapsed={sidebarCollapsed} />
 <NavItem icon={Search} label="Advanced Search" collapsed={sidebarCollapsed} />
 <NavItem icon={Settings} label="Settings" collapsed={sidebarCollapsed} />
 </nav>

 {/* Mobile Nav Row */}
 <nav className="flex md:hidden flex-1 items-center gap-1 px-3 overflow-x-auto py-2">
 <NavItemMobile icon={LayoutDashboard} label="Dashboard" active />
 <NavItemMobile icon={Bookmark} label="Saved" />
 <NavItemMobile icon={MessageSquare} label="Interests" />
 <NavItemMobile icon={Search} label="Search" />
 </nav>
 </aside>

 {/* Ã¢â€â‚¬Ã¢â€â‚¬ MAIN CONTENT Ã¢â€â‚¬Ã¢â€â‚¬ */}
 <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
 <div className="max-w-6xl mx-auto space-y-10">

 {/* Header */}
 <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl md:text-3xl font-black text-[var(--text)] tracking-tighter uppercase flex items-center gap-3">
 Investor Portal
 <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-current"/> PRO</span>
 </h1>
 <p className="text-[var(--text2)] font-medium mt-1 text-sm">Welcome back. Here's your deal flow overview.</p>
 </div>
 </header>

 {/* Stats Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="Pitches Viewed" value={stats.viewed} icon={Eye} color="text-blue-500" />
 <StatCard label="Interests Expressed" value={stats.interests} icon={MessageSquare} color="text-emerald-500" />
 <StatCard label="Watchlist Size" value={stats.watchlist} icon={Bookmark} color="text-amber-500" />
 <StatCard label="Subscription Days" value={stats.daysLeft} icon={Clock} color="text-purple-500" />
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
 
 {/* Left Column (Wider) */}
 <div className="xl:col-span-2 space-y-10">
 
 {/* New Pitches This Week */}
 <div>
 <h2 className="text-xl font-black text-[var(--text)] tracking-tight uppercase mb-5">New Pitches This Week</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {newPitches.map(pitch => (
 <Link key={pitch.id} href={`/pitch/${pitch.id}`} className="block group">
 <div className="bg-[var(--card-bg)] p-5 rounded-3xl border-[0.5px] border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[#cccccc] transition-all h-full flex flex-col">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 bg-[var(--bg)] rounded-2xl flex items-center justify-center overflow-hidden">
 {pitch.logo_url ? <img src={pitch.logo_url} alt="" className="w-full h-full object-cover" /> : <div className="text-xl font-bold text-[var(--text2)]">{pitch.title?.[0]}</div>}
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--text)] truncate">{pitch.title}</h3>
 <p className="text-xs text-[var(--text2)] truncate">{pitch.industry || 'Tech'} Â¢ {pitch.company_stage || 'Seed'}</p>
 </div>
 </div>
 <p className="text-sm text-[var(--text2)] line-clamp-2 mb-4 flex-grow">{pitch.short_description || pitch.tagline}</p>
 <div className="flex items-center justify-between pt-4 border-t-[0.5px] border-[var(--border)]">
 <div>
 <p className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest">MRR</p>
 <p className="text-sm font-black text-[var(--text)]">${pitch.mrr?.toLocaleString() || '0'}</p>
 </div>
 <div className="text-right">
 <p className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest">Raising</p>
 <p className="text-sm font-black text-emerald-600">${pitch.amount_seeking?.toLocaleString() || '0'}</p>
 </div>
 </div>
 </div>
 </Link>
 ))}
 {newPitches.length === 0 && <p className="text-sm text-[var(--text2)]">No new pitches this week.</p>}
 </div>
 </div>

 {/* Advanced Search */}
 <div>
 <h2 className="text-xl font-black text-[var(--text)] tracking-tight uppercase mb-5 flex items-center gap-2">
 <Search className="w-5 h-5" /> Advanced Search
 </h2>
 <div className="bg-[var(--card-bg)] p-6 rounded-3xl border-[0.5px] border-[var(--border)] shadow-sm mb-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
 <input 
 type="text" 
 placeholder="Search startups by name..." 
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="w-full pl-11 pr-4 py-3 bg-[var(--bg)] border-[0.5px] border-transparent rounded-2xl text-sm focus:outline-none focus:bg-[var(--card-bg)] focus:border-[#222222] transition-colors"
 />
 </div>
 <label className="flex items-center gap-2 cursor-pointer bg-[var(--bg)] px-4 py-3 rounded-2xl hover:bg-[#e5e5e5] transition-colors">
 <input 
 type="checkbox" 
 checked={filters.activelyRaising}
 onChange={e => setFilters(f => ({ ...f, activelyRaising: e.target.checked }))}
 className="rounded border-gray-300 text-[var(--text)] focus:ring-[#222222]"
 />
 <span className="text-sm font-bold text-[var(--text)]">Live only</span>
 </label>
 </div>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <FilterSelect label="Industry" value={filters.industry} onChange={(v: string) => setFilters(f => ({ ...f, industry: v }))} options={['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce']} />
 <FilterSelect label="Stage" value={filters.stage} onChange={(v: string) => setFilters(f => ({ ...f, stage: v }))} options={['Pre-seed', 'Seed', 'Series A', 'Series B']} />
 <FilterSelect label="Min MRR" value={filters.mrrMin} onChange={(v: string) => setFilters(f => ({ ...f, mrrMin: v }))} options={[{l: '$1k+', v: '1000'}, {l: '$10k+', v: '10000'}, {l: '$50k+', v: '50000'}, {l: '$100k+', v: '100000'}]} />
 <FilterSelect label="Max Funding" value={filters.fundingMax} onChange={(v: string) => setFilters(f => ({ ...f, fundingMax: v }))} options={[{l: '< $100k', v: '100000'}, {l: '< $500k', v: '500000'}, {l: '< $1M', v: '1000000'}, {l: '< $5M', v: '5000000'}]} />
 </div>
 </div>

 {/* Search Results List */}
 <div className="space-y-3">
 {searchResults.map(pitch => (
 <Link key={pitch.id} href={`/pitch/${pitch.id}`} className="flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-2xl border-[0.5px] border-[var(--border)] hover:shadow-md transition-all group">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-[var(--bg)] rounded-xl flex items-center justify-center">
 {pitch.logo_url ? <img src={pitch.logo_url} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="font-bold text-xs">{pitch.title?.[0]}</span>}
 </div>
 <div>
 <p className="font-bold text-[var(--text)] text-sm group-hover:text-[var(--text)]">{pitch.title}</p>
 <p className="text-xs text-[var(--text2)]">{pitch.industry} Â¢ {pitch.company_stage}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm font-black text-[var(--text)]">${pitch.mrr?.toLocaleString() || '0'} <span className="text-[10px] text-[var(--text2)] font-normal uppercase">MRR</span></p>
 </div>
 </Link>
 ))}
 {searchResults.length === 0 && <p className="text-sm text-[var(--text2)] text-center py-4">No results matching your filters.</p>}
 </div>
 </div>

 </div>

 {/* Right Column (Narrower) */}
 <div className="space-y-10">
 
 {/* My Saved Pitches */}
 <div>
 <h2 className="text-xl font-black text-[var(--text)] tracking-tight uppercase mb-5 flex items-center gap-2">
 <Bookmark className="w-5 h-5" /> Watchlist
 </h2>
 <div className="bg-[var(--card-bg)] rounded-3xl border-[0.5px] border-[var(--border)] shadow-sm overflow-hidden">
 {savedPitches.length === 0 ? (
 <div className="p-8 text-center">
 <p className="text-sm text-[var(--text2)]">Your watchlist is empty.</p>
 </div>
 ) : (
 <div className="divide-y divide-[#e5e5e5]">
 {savedPitches.map(pitch => (
 <div key={pitch.id} className="p-4 hover:bg-[var(--bg)] transition-colors flex items-center justify-between group">
 <div>
 <Link href={`/pitch/${pitch.id}`} className="font-bold text-[var(--text)] text-sm hover:underline">{pitch.title}</Link>
 <p className="text-[11px] text-[var(--text2)]">{pitch.industry}</p>
 </div>
 <button onClick={() => handleRemoveSaved(pitch.id)} className="p-2 text-[var(--text2)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Remove from watchlist">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Expressed Interests */}
 <div>
 <h2 className="text-xl font-black text-[var(--text)] tracking-tight uppercase mb-5 flex items-center gap-2">
 <MessageSquare className="w-5 h-5" /> Interests
 </h2>
 <div className="bg-[var(--card-bg)] rounded-3xl border-[0.5px] border-[var(--border)] shadow-sm overflow-hidden">
 {interests.length === 0 ? (
 <div className="p-8 text-center">
 <p className="text-sm text-[var(--text2)]">No interests expressed yet.</p>
 </div>
 ) : (
 <div className="divide-y divide-[#e5e5e5]">
 {interests.map(interest => (
 <div key={interest.id} className="p-4">
 <div className="flex items-start justify-between mb-2">
 <Link href={`/pitch/${interest.pitch?.id}`} className="font-bold text-[var(--text)] text-sm hover:underline">{interest.pitch?.title}</Link>
 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
 interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
 interest.status === 'declined' ? 'bg-red-100 text-red-700' :
 'bg-amber-100 text-amber-700'
 }`}>
 {interest.status}
 </span>
 </div>
 {interest.status === 'accepted' && (
 <button className="text-xs font-bold text-[var(--text)] flex items-center gap-1 hover:text-[var(--text)] mt-2">
 View thread <ExternalLink className="w-3 h-3" />
 </button>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 </div>
 </div>

 </div>
 </main>
 </div>
 );
}

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Sub-components Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */

function StatCard({ label, value, icon: Icon, color }: any) {
 return (
 <div className="bg-[var(--card-bg)] p-5 rounded-3xl border-[0.5px] border-[var(--border)] shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <div className={`p-2.5 rounded-2xl bg-[var(--bg)] ${color}`}><Icon className="w-5 h-5" /></div>
 </div>
 <p className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest mb-1">{label}</p>
 <h3 className="text-2xl font-black text-[var(--text)]">{value}</h3>
 </div>
 );
}

function FilterSelect({ label, value, onChange, options }: any) {
 return (
 <div>
 <select 
 value={value} 
 onChange={(e) => onChange(e.target.value)}
 className="w-full bg-[var(--bg)] border-[0.5px] border-transparent rounded-xl px-3 py-2 text-xs font-medium text-[var(--text)] focus:outline-none focus:bg-[var(--card-bg)] focus:border-[#222222] transition-colors appearance-none cursor-pointer"
 >
 <option value="">{label} (All)</option>
 {options.map((opt: any) => {
 const val = typeof opt === 'string' ? opt : opt.v;
 const lbl = typeof opt === 'string' ? opt : opt.l;
 return <option key={val} value={val}>{lbl}</option>;
 })}
 </select>
 </div>
 );
}

function NavItem({ icon: Icon, label, active, href = '#', collapsed }: any) {
 return (
 <Link href={href} title={collapsed ? label : undefined}
 className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active ? 'bg-[var(--text)] text-[var(--bg)] shadow-lg shadow-black/10' : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg)]'} ${collapsed ? 'justify-center' : ''}`}>
 <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[var(--text)]' : 'text-[var(--text2)] group-hover:text-[var(--text)]'}`} />
 {!collapsed && <span className="text-sm font-bold">{label}</span>}
 </Link>
 );
}

function NavItemMobile({ icon: Icon, label, active, href = '#' }: any) {
 return (
 <Link href={href} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${active ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg)]'}`}>
 <Icon className="w-4 h-4" /><span className="text-[9px] font-bold">{label}</span>
 </Link>
 );
}
