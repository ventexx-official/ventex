"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Email helper (fires-and-forgets)
async function sendEmail(type: string, recipientEmail: string, data: Record<string, any>) {
  try {
    await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipientEmail, data }),
    });
  } catch (e) {
    console.error('[sendEmail]', e);
  }
}
import { 
  Plus, 
  LayoutDashboard, 
  FileText, 
  Store, 
  Zap, 
  Settings, 
  Eye, 
  MessageSquare, 
  ShoppingBag, 
  DollarSign, 
  ArrowRight,
  User,
  Clock,
  MoreVertical,
  ChevronRight,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle,
  Tag,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function FounderDashboard() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profile, error: profileError } = await supabase
        .from('users').select('*').eq('id', session.user.id).single();

      if (profileError || !profile) { router.push('/'); return; }
      if (profile.role !== 'founder') { router.push('/'); return; }
      setUserProfile(profile);

      const { data: pitchesData } = await supabase
        .from('pitches').select('*')
        .eq('founder_id', session.user.id)
        .order('created_at', { ascending: false });

      if (pitchesData) {
        setPitches(pitchesData);
        
        const pitchIds = pitchesData.map(p => p.id) || [];
        if (pitchIds.length > 0) {
          const { data: interestsData } = await supabase
            .from('investor_interests')
            .select(`
              *,
              pitch:pitch_id ( id, title, logo_url ),
              investor:investor_id ( id, full_name, role, avatar_url, email )
            `)
            .in('pitch_id', pitchIds)
            .order('created_at', { ascending: false });
          if (interestsData) setInterests(interestsData);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleAcceptInterest = async (interestId: string, investorId: string, pitchTitle: string) => {
    try {
      const { error } = await supabase
        .from('investor_interests')
        .update({ status: 'accepted' })
        .eq('id', interestId);

      if (error) throw error;

      // Notify investor in-app
      await supabase
        .from('notifications')
        .insert({
          user_id: investorId,
          type: 'deal_room_unlocked',
          message: `Your interest in "${pitchTitle}" has been accepted! You can now join the Deal Room.`,
          link: `/deal-room/${interestId}`
        });

      // Send email to investor
      const { data: investorProfile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', investorId)
        .single();

      const { data: investorAuth } = await supabase.auth.admin
        ? ({ data: null } as any)
        : ({ data: null } as any);

      // Get investor email from auth (use interests join or separate fetch)
      const interest = interests.find(i => i.id === interestId);
      const investorEmail = interest?.investor?.email;
      if (investorEmail) {
        await sendEmail('interest_accepted', investorEmail, {
          startupName: pitchTitle,
          interestId,
        });
      }

      setInterests(prev => prev.map(item =>
        item.id === interestId ? { ...item, status: 'accepted' } : item
      ));
      alert("Interest accepted! Deal room is unlocked.");
    } catch (err: any) {
      console.error(err);
      alert("Failed to accept interest: " + err.message);
    }
  };

  const handleDeclineInterest = async (interestId: string, investorId: string, pitchTitle: string) => {
    try {
      const { error } = await supabase
        .from('investor_interests')
        .update({ status: 'declined' })
        .eq('id', interestId);

      if (error) throw error;

      const interest = interests.find(i => i.id === interestId);
      const investorEmail = interest?.investor?.email;

      // Send email to investor
      if (investorEmail) {
        await sendEmail('interest_accepted', investorEmail, {
          startupName: pitchTitle,
          declined: true,
        });
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: investorId,
          type: 'deal_room_declined',
          message: `Your interest expression in "${pitchTitle}" has been declined.`,
          link: `/discover`
        });

      setInterests(prev => prev.map(item =>
        item.id === interestId ? { ...item, status: 'declined' } : item
      ));
      alert("Interest declined.");
    } catch (err: any) {
      console.error(err);
      alert("Failed to decline interest: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { id: pitchId } = confirmDelete;
    setDeletingId(pitchId);
    setConfirmDelete(null);

    const { data: { session } } = await supabase.auth.getSession();

    // First ensure founder_id is set correctly on this pitch
    const pitch = pitches.find(p => p.id === pitchId);
    if (pitch && !pitch.founder_id && session?.user?.id) {
      // patch missing founder_id before deleting
      await supabase.from('pitches').update({ founder_id: session.user.id }).eq('id', pitchId);
    }

    const { data, error } = await supabase
      .from('pitches').delete().eq('id', pitchId).select();

    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else if (!data || data.length === 0) {
      // RLS silently blocked — patch founder_id and retry
      if (session?.user?.id) {
        await supabase.from('pitches').update({ founder_id: session.user.id }).eq('id', pitchId);
        const { data: retryData, error: retryError } = await supabase
          .from('pitches').delete().eq('id', pitchId).select();
        if (retryData && retryData.length > 0) {
          setPitches(prev => prev.filter(p => p.id !== pitchId));
        } else {
          alert(`Could not delete pitch. ${retryError?.message || 'RLS policy may be blocking the delete. Run the DELETE policy SQL in Supabase.'}`);
        }
      }
    } else {
      setPitches(prev => prev.filter(p => p.id !== pitchId));
    }
    setDeletingId(null);
  };

  const handleDuplicate = async (pitch: any) => {
    setOpenMenuId(null);
    const { data, error } = await supabase.from('pitches').insert({
      ...pitch,
      id: undefined,
      title: `${pitch.title} (Copy)`,
      status: 'draft',
      created_at: undefined,
      updated_at: undefined,
    }).select().single();
    if (error) { alert('Failed to duplicate: ' + error.message); }
    else if (data) { setPitches(prev => [data, ...prev]); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Pitch Views (30d)', value: pitches.reduce((a, p) => a + (p.views || 0), 0).toLocaleString(), icon: Eye, color: 'text-blue-500' },
    { label: 'Investor Interests', value: interests.length.toString(), icon: MessageSquare, color: 'text-emerald-500' },
    { label: 'Products Sold', value: '0', icon: ShoppingBag, color: 'text-purple-500' },
    { label: 'Total Earnings', value: '$0', icon: DollarSign, color: 'text-amber-500' },
  ];

  const recentActivity = [
    { id: 1, text: 'No recent activity yet.', time: '' },
  ];

  const sidebarW = sidebarCollapsed ? 'md:w-[72px]' : 'md:w-[240px]';
  const mainML = sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F2F0]">

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setConfirmDelete(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#F2F2F0] rounded-lg transition-colors text-[#888888]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-[#222222] text-center mb-2">Delete pitch?</h2>
            <p className="text-sm text-[#888888] text-center mb-1">
              You're about to permanently delete:
            </p>
            <p className="text-sm font-bold text-[#222222] text-center mb-6 px-4 truncate">
              "{confirmDelete.title}"
            </p>
            <p className="text-xs text-red-500 text-center mb-8 bg-red-50 rounded-xl py-2 px-4">
              This action <strong>cannot be undone</strong>. All data will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 border-[0.5px] border-[#e5e5e5] rounded-2xl font-bold text-[#222222] hover:bg-[#F2F2F0] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`bg-white border-b md:border-b-0 md:border-r-[0.5px] border-[#e5e5e5] flex md:flex-col md:fixed md:h-screen z-10 flex-shrink-0 transition-all duration-300 ${sidebarW}`}>
        <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b-[0.5px] border-[#e5e5e5] md:border-b-0">
          {!sidebarCollapsed && (
            <Link href="/" className="text-xl font-black italic tracking-tighter text-[#222222] uppercase">Ventex</Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F2F2F0] transition-colors text-[#888888] hover:text-[#222222] ml-auto"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
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
                <p className="text-sm font-bold text-[#222222] truncate">{userProfile?.full_name || 'Founder'}</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] bg-white px-1.5 py-0.5 rounded border-[0.5px] border-[#e5e5e5]">Founder</span>
              </div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="hidden md:flex justify-center py-4">
            <div className="w-9 h-9 rounded-full bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] flex items-center justify-center overflow-hidden">
              {userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[#888888]" />}
            </div>
          </div>
        )}

        <nav className="hidden md:flex flex-grow flex-col px-2 space-y-1 pt-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active collapsed={sidebarCollapsed} href="/founder/dashboard" />
          <NavItem icon={FileText} label="My Pitches" collapsed={sidebarCollapsed} href="/founder/pitches" />
          <NavItem icon={Plus} label="Create Pitch" href="/founder/create-pitch" collapsed={sidebarCollapsed} />
          <NavItem icon={Store} label="My Store" href="/founder/store" collapsed={sidebarCollapsed} />
          <NavItem icon={Tag} label="Deals & Promos" href="/founder/store/deals" collapsed={sidebarCollapsed} />
          <NavItem icon={Zap} label="Booster Packs" collapsed={sidebarCollapsed} />
          <NavItem icon={Settings} label="Settings" collapsed={sidebarCollapsed} />
        </nav>

        <nav className="flex md:hidden flex-1 items-center gap-1 px-3 overflow-x-auto py-2">
          <NavItemMobile icon={LayoutDashboard} label="Dashboard" active href="/founder/dashboard" />
          <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" />
          <NavItemMobile icon={Plus} label="Create" href="/founder/create-pitch" />
          <NavItemMobile icon={Store} label="Store" href="/founder/store" />
          <NavItemMobile icon={Tag} label="Deals" href="/founder/store/deals" />
          <NavItemMobile icon={Zap} label="Boost" />
          <NavItemMobile icon={Settings} label="Settings" />
        </nav>

        {!sidebarCollapsed && (
          <div className="hidden md:block px-3 pb-4 mt-auto border-t-[0.5px] border-[#e5e5e5] pt-4">
            <Link href={`/profile/${userProfile?.id}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F2F2F0] transition-colors group">
              <span className="text-xs font-bold text-[#888888] group-hover:text-[#222222]">View public profile</span>
              <ArrowRight className="w-4 h-4 text-[#888888]" />
            </Link>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="hidden md:flex justify-center pb-4 mt-auto pt-4 border-t-[0.5px] border-[#e5e5e5]">
            <Link href={`/profile/${userProfile?.id}`} className="p-2 rounded-xl hover:bg-[#F2F2F0] transition-colors text-[#888888]" title="View public profile">
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
        <div className="max-w-6xl mx-auto">

          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#222222] tracking-tighter uppercase">Founder Dashboard</h1>
              <p className="text-[#888888] font-medium mt-1 text-sm">Everything you need to scale your startup.</p>
            </div>
            <button
              onClick={() => router.push('/founder/create-pitch')}
              className="bg-[#222222] text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/5 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" /> Create New Pitch
            </button>
          </header>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-2xl bg-[#F2F2F0] ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                </div>
                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#222222]">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* MY PITCHES */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-[#222222] tracking-tight uppercase">My Pitches</h2>
                <Link href="/founder/pitches" className="text-sm font-bold text-[#888888] hover:text-[#222222] flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3" ref={menuRef}>
                {pitches.length === 0 ? (
                  <div className="bg-white border-[0.5px] border-[#e5e5e5] rounded-3xl p-12 text-center">
                    <p className="text-[#888888] font-medium">You haven't created any pitches yet.</p>
                    <button
                      onClick={() => router.push('/founder/create-pitch')}
                      className="mt-4 text-sm font-bold text-[#222222] underline decoration-[0.5px] underline-offset-4 hover:no-underline"
                    >
                      Create your first pitch →
                    </button>
                  </div>
                ) : (
                  pitches.slice(0, 5).map((pitch) => (
                    <div
                      key={pitch.id}
                      className={`bg-white p-4 rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm hover:shadow-md transition-all flex items-center justify-between group ${deletingId === pitch.id ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-[#F2F2F0] rounded-2xl flex items-center justify-center overflow-hidden border-[0.5px] border-[#e5e5e5] flex-shrink-0">
                          {pitch.logo_url ? <img src={pitch.logo_url} alt="" className="w-full h-full object-cover" /> : <FileText className="w-5 h-5 text-[#888888]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-[#222222] text-sm truncate">{pitch.title || 'Untitled Pitch'}</h3>
                            <StatusBadge status={pitch.status} />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-medium text-[#888888]">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {pitch.views || 0}</span>
                            <span className="hidden sm:flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(pitch.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <Link href={`/founder/create-pitch?id=${pitch.id}`} className="hidden sm:block px-3 py-1.5 bg-[#F2F2F0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#e5e5e5] active:scale-95 transition-all">Edit</Link>
                        <Link href={`/pitch/${pitch.id}`} className="hidden sm:block px-3 py-1.5 bg-[#222222] text-white text-xs font-bold rounded-xl hover:bg-black active:scale-95 transition-all">View</Link>

                        {/* Three-dot menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === pitch.id ? null : pitch.id); }}
                            className="p-2 hover:bg-[#F2F2F0] rounded-xl transition-colors text-[#888888] hover:text-[#222222]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === pitch.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border-[0.5px] border-[#e5e5e5] z-50 py-1 overflow-hidden">
                              <Link href={`/founder/create-pitch?id=${pitch.id}`} onClick={() => setOpenMenuId(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#F2F2F0] transition-colors">
                                <Edit2 className="w-4 h-4 text-[#888888]" /> Edit pitch
                              </Link>
                              <Link href={`/pitch/${pitch.id}`} onClick={() => setOpenMenuId(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#F2F2F0] transition-colors">
                                <ExternalLink className="w-4 h-4 text-[#888888]" /> View public page
                              </Link>
                              <button onClick={() => handleDuplicate(pitch)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#F2F2F0] transition-colors">
                                <Copy className="w-4 h-4 text-[#888888]" /> Duplicate
                              </button>
                              <div className="border-t-[0.5px] border-[#e5e5e5] my-1" />
                              <button
                                onClick={() => { setOpenMenuId(null); setConfirmDelete({ id: pitch.id, title: pitch.title || 'Untitled Pitch' }); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> Delete pitch
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {pitches.length > 5 && (
                  <Link href="/founder/pitches" className="block text-center py-3 text-sm font-bold text-[#888888] hover:text-[#222222] transition-colors">
                    + {pitches.length - 5} more pitches — View all →
                  </Link>
                )}
              </div>
            </div>

            {/* SIDE CONTENT */}
            <div className="space-y-8">
              <div className="bg-[#222222] rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Boost your pitch</h3>
                  <p className="text-white/60 text-sm mb-6 leading-relaxed">Get 10x more eyes on your startup with premium booster packs.</p>
                  <button className="w-full py-3 bg-white text-[#222222] rounded-2xl font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                    Buy booster pack <Zap className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
              </div>

              <div>
                <h2 className="text-xl font-black text-[#222222] tracking-tight uppercase mb-5">Investor Interests</h2>
                <div className="space-y-4">
                  {interests.length === 0 ? (
                    <p className="text-sm text-[#888888]">No requests yet.</p>
                  ) : (
                    interests.map((interest) => {
                      const invName = interest.investor?.full_name || interest.investor?.email?.split('@')[0] || 'Premium Investor';
                      return (
                        <div key={interest.id} className="bg-white border-[0.5px] border-[#e5e5e5] rounded-3xl p-5 shadow-sm space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] flex items-center justify-center overflow-hidden flex-shrink-0">
                              {interest.investor?.avatar_url ? (
                                <img src={interest.investor.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-[#888888]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#222222] truncate">{invName}</p>
                              <p className="text-[10px] text-[#888888] font-semibold truncate">Interest in {interest.pitch?.title}</p>
                            </div>
                            <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                              interest.status === 'declined' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {interest.status}
                            </span>
                          </div>

                          <p className="text-xs text-[#555555] dark:text-[#cccccc] italic leading-relaxed border-l-2 border-[#e5e5e5] pl-3 py-0.5">
                            "{interest.message || 'No custom message.'}"
                          </p>

                          {interest.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleDeclineInterest(interest.id, interest.investor_id, interest.pitch?.title)}
                                className="flex-1 py-2 rounded-xl border-[0.5px] border-[#e5e5e5] text-xs font-bold text-[#222222] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAcceptInterest(interest.id, interest.investor_id, interest.pitch?.title)}
                                className="flex-1 py-2 rounded-xl bg-[#222222] text-white text-xs font-bold hover:bg-black transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          )}

                          {interest.status === 'accepted' && (
                            <Link
                              href={`/deal-room/${interest.id}`}
                              className="block w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold text-center transition-colors"
                            >
                              Enter Deal Room
                            </Link>
                          )}
                        </div>
                      );
                    })
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

function NavItem({ icon: Icon, label, active, href = '#', collapsed }: any) {
  return (
    <Link href={href} title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active ? 'bg-[#222222] text-white shadow-lg shadow-black/10' : 'text-[#888888] hover:text-[#222222] hover:bg-[#F2F2F0]'} ${collapsed ? 'justify-center' : ''}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-[#888888] group-hover:text-[#222222]'}`} />
      {!collapsed && <span className="text-sm font-bold">{label}</span>}
    </Link>
  );
}

function NavItemMobile({ icon: Icon, label, active, href = '#' }: any) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${active ? 'bg-[#222222] text-white' : 'text-[#888888] hover:text-[#222222] hover:bg-[#F2F2F0]'}`}>
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-bold">{label}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    live: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-500',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.draft}`}>{status}</span>;
}
