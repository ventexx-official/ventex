"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Settings } from 'lucide-react';
import InvestorResponseBadge from '@/components/InvestorResponseBadge';

type UserProfile = {
 id: string;
 full_name?: string | null;
 role?: string | null;
 avatar_url?: string | null;
 bio?: string | null;
 created_at?: string | null;
 response_rate?: number | null;
 investment_thesis?: string | null;
 preferred_sectors?: string[] | null;
 preferred_stages?: string[] | null;
 xp?: number | null;
 badges?: string[] | null;
};

type PitchCardData = {
 id: string;
 title: string | null;
 tagline: string | null;
 industry: string | null;
 company_stage: string | null;
 country: string | null;
 city: string | null;
 is_raising: boolean | null;
 status?: string | null;
 created_at?: string | null;
};

function roleBadgeClass(role: string) {
 if (role === 'admin') return 'bg-purple-100 text-purple-700 border-purple-200';
 if (role === 'founder') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 if (role === 'investor') return 'bg-blue-100 text-blue-700 border-blue-200';
 return 'bg-[var(--bg)] text-[var(--text2)] border-[var(--border)]';
}

function formatJoined(dateStr?: string | null) {
 if (!dateStr) return null;
 const d = new Date(dateStr);
 if (Number.isNaN(d.getTime())) return null;
 return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
 const router = useRouter();
 const userId = params.userId;

 const [loading, setLoading] = useState(true);
 const [viewerId, setViewerId] = useState<string | null>(null);
 const [profile, setProfile] = useState<UserProfile | null>(null);
 const [pitches, setPitches] = useState<PitchCardData[]>([]);
 const [savedPitches, setSavedPitches] = useState<PitchCardData[]>([]);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const isOwnProfile = viewerId === userId;
 const displayName = profile?.full_name || 'User';
 const initial = (displayName.trim()?.[0] || 'U').toUpperCase();
 const role = (profile?.role || 'visitor').toLowerCase();
 const joined = useMemo(() => formatJoined(profile?.created_at), [profile?.created_at]);
 const xp = Number(profile?.xp || 0);
 const badges = profile?.badges || ['Pitch Submitted', 'Marketplace Seller'];

 useEffect(() => {
 const load = async () => {
 setLoading(true);
 setErrorMsg(null);

 const [{ data: sessionData }, { data: profileData, error: profileError }] = await Promise.all([
 supabase.auth.getSession(),
 supabase.from('users').select('*').eq('id', userId).single(),
 ]);

 setViewerId(sessionData.session?.user?.id || null);

 if (profileError) {
 setProfile(null);
 setErrorMsg(profileError.message || 'Profile not found.');
 setLoading(false);
 return;
 }

 setProfile(profileData as UserProfile);

 if ((profileData?.role || '').toLowerCase() === 'founder') {
 let query = supabase
 .from('pitches')
 .select('id, title, tagline, industry, company_stage, country, city, is_raising, status, created_at')
 .eq('founder_id', userId)
 .order('created_at', { ascending: false });

 if (!sessionData.session?.user?.id || sessionData.session.user.id !== userId) {
 query = query.eq('status', 'live');
 }

 const { data } = await query;
 setPitches((data as PitchCardData[]) || []);
 } else if ((profileData?.role || '').toLowerCase() === 'investor') {
 if (sessionData.session?.user?.id === userId) {
 const { data } = await supabase
 .from('saved_pitches')
 .select('pitch:pitch_id ( id, title, tagline, industry, company_stage, country, city, is_raising, created_at )')
 .eq('user_id', userId)
 .order('created_at', { ascending: false });

 const mapped = ((data || []) as any[])
 .map((row) => row.pitch)
 .filter(Boolean) as PitchCardData[];
 setSavedPitches(mapped);
 } else {
 setSavedPitches([]);
 }
 }

 setLoading(false);
 };

 load();
 }, [userId]);

 if (loading) {
 return (
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] rounded-full animate-spin" />
 </div>
 );
 }

 if (errorMsg || !profile) {
 return (
 <div className="min-h-screen bg-[var(--bg)] px-4 py-10">
 <div className="max-w-3xl mx-auto bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6 md:p-8">
 <div className="text-xl font-black text-[var(--text)] tracking-tight">Profile unavailable</div>
 <div className="text-sm text-[var(--text2)] mt-2">{errorMsg || 'This profile does not exist.'}</div>
 <button
 onClick={() => router.push('/')}
 className="mt-6 bg-[var(--text)] text-[var(--bg)] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-colors"
 >
 Go Home
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-[var(--bg)] px-4 py-8">
 <div className="max-w-5xl mx-auto space-y-8">
 <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6 md:p-8">
 <div className="flex flex-col sm:flex-row sm:items-center gap-6">
 <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
 {profile.avatar_url ? (
 <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
 ) : (
 <span className="text-[var(--text)] text-2xl font-black">{initial}</span>
 )}
 </div>

 <div className="min-w-0 flex-1">
 <div className="flex flex-col sm:flex-row sm:items-center gap-3">
 <h1 className="text-3xl font-black text-[var(--text)] tracking-tighter truncate">{displayName}</h1>
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${roleBadgeClass(role)}`}>
 {role.toUpperCase()}
 </span>
 {role === 'investor' ? <InvestorResponseBadge response_rate={profile.response_rate} /> : null}
 </div>
 <div className="text-sm text-[var(--text2)] mt-1">
 {joined ? `Joined ${joined}` : null}
 </div>
 <div className="text-sm text-[var(--text2)] mt-4 whitespace-pre-wrap">
 {profile.bio?.trim() ? profile.bio : 'No bio added yet.'}
 </div>
 {role === 'founder' && (
 <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[var(--text2)]">
 <span>Founder XP</span>
 <span>{xp} XP</span>
 </div>
 <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5e5e5]">
 <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, xp % 100)}%` }} />
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 {['Pitch Submitted', 'First Investor Interest', 'Featured in Battle', 'Marketplace Seller', 'Ventex Live Participant'].map((badge) => (
 <span key={badge} className={`rounded-full px-2 py-1 text-[10px] font-black ${badges.includes(badge) ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--card-bg)] text-[var(--text2)]'}`}>
 {badge}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>

 {isOwnProfile && (
 <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
 <Link
 href="/settings"
 className="inline-flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--bg)] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-colors"
 >
 <Settings className="w-4 h-4" />
 Edit Profile
 </Link>
 <Link
 href="/dashboard"
 className="inline-flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--text)] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[var(--bg)] transition-colors"
 >
 <LayoutDashboard className="w-4 h-4" />
 Dashboard
 </Link>
 </div>
 )}
 </div>
 </div>

 {role === 'founder' && (
 <section className="space-y-4">
 <div className="flex items-center justify-between">
 <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text2)]">Pitches</h2>
 {isOwnProfile && (
 <Link href="/founder/pitches" className="text-sm font-bold text-[var(--text)] hover:underline">
 Manage
 </Link>
 )}
 </div>

 {pitches.length === 0 ? (
 <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6 text-sm text-[var(--text2)]">
 No pitches to show.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {pitches.map((p) => (
 <Link
 key={p.id}
 href={`/pitch/${p.id}`}
 className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6 hover:shadow-md transition-shadow"
 >
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0">
 <div className="text-lg font-black text-[var(--text)] tracking-tight truncate">{p.title || 'Untitled Pitch'}</div>
 <div className="text-sm text-[var(--text2)] mt-1 line-clamp-2">{p.tagline || ''}</div>
 </div>
 {p.is_raising ? (
 <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full flex-shrink-0">
 Raising
 </span>
 ) : null}
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 {p.industry ? (
 <span className="text-[11px] font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {p.industry}
 </span>
 ) : null}
 {p.company_stage ? (
 <span className="text-[11px] font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {p.company_stage}
 </span>
 ) : null}
 {(p.city || p.country) ? (
 <span className="text-[11px] font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {[p.city, p.country].filter(Boolean).join(', ')}
 </span>
 ) : null}
 {isOwnProfile && p.status ? (
 <span className="text-[11px] font-bold text-[var(--text2)] bg-[var(--card-bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {p.status}
 </span>
 ) : null}
 </div>
 </Link>
 ))}
 </div>
 )}
 </section>
 )}

 {role === 'investor' && isOwnProfile && (
 <section className="space-y-4">
 <div className="flex items-center justify-between">
 <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text2)]">Saved Pitches</h2>
 <Link href="/discover" className="text-sm font-bold text-[var(--text)] hover:underline">
 Discover
 </Link>
 </div>

 {savedPitches.length === 0 ? (
 <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6 text-sm text-[var(--text2)]">
 No saved pitches yet.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {savedPitches.map((p) => (
 <Link
 key={p.id}
 href={`/pitch/${p.id}`}
 className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6 hover:shadow-md transition-shadow"
 >
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0">
 <div className="text-lg font-black text-[var(--text)] tracking-tight truncate">{p.title || 'Untitled Pitch'}</div>
 <div className="text-sm text-[var(--text2)] mt-1 line-clamp-2">{p.tagline || ''}</div>
 </div>
 {p.is_raising ? (
 <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full flex-shrink-0">
 Raising
 </span>
 ) : null}
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 {p.industry ? (
 <span className="text-[11px] font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {p.industry}
 </span>
 ) : null}
 {p.company_stage ? (
 <span className="text-[11px] font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {p.company_stage}
 </span>
 ) : null}
 {(p.city || p.country) ? (
 <span className="text-[11px] font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {[p.city, p.country].filter(Boolean).join(', ')}
 </span>
 ) : null}
 </div>
 </Link>
 ))}
 </div>
 )}
 </section>
 )}

 {role === 'investor' && (
 <section className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-3xl p-6">
 <div className="flex items-center justify-between gap-4">
 <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text2)]">Investment Thesis</h2>
 {isOwnProfile ? (
 <Link href="/investor/settings" className="text-sm font-bold text-[var(--text)] hover:underline">Edit</Link>
 ) : null}
 </div>
 <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--text2)]">
 {profile.investment_thesis || 'No thesis added yet.'}
 </p>
 <div className="mt-4 flex flex-wrap gap-2">
 {[...(profile.preferred_sectors || []), ...(profile.preferred_stages || [])].map((item) => (
 <span key={item} className="text-[11px] font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border)]">
 {item}
 </span>
 ))}
 </div>
 </section>
 )}
 </div>
 </div>
 );
}
