"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Plus, LayoutDashboard, FileText, Store, Zap, Settings,
  Eye, Clock, MoreVertical, Edit2, ExternalLink, Copy, Trash2,
  AlertTriangle, X, PanelLeftClose, PanelLeftOpen, ArrowRight,
  User, Search, Filter, Tag
} from 'lucide-react';
import Link from 'next/link';

export default function MyPitchesPage() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setUserProfile(profile || { id: session.user.id, full_name: session.user.email, role: 'founder' });
      const { data: pitchesData } = await supabase
        .from('pitches').select('*')
        .eq('founder_id', session.user.id)
        .order('created_at', { ascending: false });
      if (pitchesData) { setPitches(pitchesData); setFiltered(pitchesData); }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    let result = pitches;
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (search) result = result.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [pitches, statusFilter, search]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { id: pitchId } = confirmDelete;
    setDeletingId(pitchId);
    setConfirmDelete(null);

    const { data: { session } } = await supabase.auth.getSession();
    const pitch = pitches.find(p => p.id === pitchId);
    if (pitch && !pitch.founder_id && session?.user?.id) {
      await supabase.from('pitches').update({ founder_id: session.user.id }).eq('id', pitchId);
    }

    const { data, error } = await supabase.from('pitches').delete().eq('id', pitchId).select();

    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else if (!data || data.length === 0) {
      if (session?.user?.id) {
        await supabase.from('pitches').update({ founder_id: session.user.id }).eq('id', pitchId);
        const { data: retryData, error: retryError } = await supabase.from('pitches').delete().eq('id', pitchId).select();
        if (retryData && retryData.length > 0) {
          setPitches(prev => prev.filter(p => p.id !== pitchId));
        } else {
          alert(`Could not delete. ${retryError?.message || 'Please run the DELETE RLS policy in Supabase SQL Editor.'}`);
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
      ...pitch, id: undefined, title: `${pitch.title} (Copy)`,
      status: 'draft', created_at: undefined, updated_at: undefined,
    }).select().single();
    if (error) alert('Failed to duplicate: ' + error.message);
    else if (data) setPitches(prev => [data, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarW = sidebarCollapsed ? 'md:w-[72px]' : 'md:w-[240px]';
  const mainML = sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F2F0]">

      {/* DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <button onClick={() => setConfirmDelete(null)} className="absolute top-4 right-4 p-1.5 hover:bg-[#F2F2F0] rounded-lg text-[#888888]"><X className="w-4 h-4" /></button>
            <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-[#222222] text-center mb-2">Delete pitch?</h2>
            <p className="text-sm text-[#888888] text-center mb-1">You're about to permanently delete:</p>
            <p className="text-sm font-bold text-[#222222] text-center mb-6 px-4 truncate">"{confirmDelete.title}"</p>
            <p className="text-xs text-red-500 text-center mb-8 bg-red-50 rounded-xl py-2 px-4">This action <strong>cannot be undone</strong>.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border-[0.5px] border-[#e5e5e5] rounded-2xl font-bold text-[#222222] hover:bg-[#F2F2F0] text-sm">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`bg-white border-b md:border-b-0 md:border-r-[0.5px] border-[#e5e5e5] flex md:flex-col md:fixed md:h-screen z-10 flex-shrink-0 transition-all duration-300 ${sidebarW}`}>
        <div className="flex items-center justify-between px-4 py-4 md:py-5">
          {!sidebarCollapsed && <Link href="/" className="text-xl font-black italic tracking-tighter text-[#222222] uppercase">Ventex</Link>}
          <button onClick={() => setSidebarCollapsed(v => !v)} className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F2F2F0] text-[#888888] hover:text-[#222222] ml-auto">
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="hidden md:block px-4 pb-4">
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

        <nav className="hidden md:flex flex-grow flex-col px-2 space-y-1 pt-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" collapsed={sidebarCollapsed} />
          <NavItem icon={FileText} label="My Pitches" href="/founder/pitches" active collapsed={sidebarCollapsed} />
          <NavItem icon={Plus} label="Create Pitch" href="/founder/create-pitch" collapsed={sidebarCollapsed} />
          <NavItem icon={Store} label="My Store" href="/founder/store" collapsed={sidebarCollapsed} />
          <NavItem icon={Tag} label="Deals & Promos" href="/founder/store/deals" collapsed={sidebarCollapsed} />
          <NavItem icon={Zap} label="Booster Packs" collapsed={sidebarCollapsed} />
          <NavItem icon={Settings} label="Settings" collapsed={sidebarCollapsed} />
        </nav>

        <nav className="flex md:hidden flex-1 items-center gap-1 px-3 overflow-x-auto py-2">
          <NavItemMobile icon={LayoutDashboard} label="Dashboard" href="/founder/dashboard" />
          <NavItemMobile icon={FileText} label="Pitches" href="/founder/pitches" active />
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
      </aside>

      {/* MAIN */}
      <main className={`flex-grow p-4 md:p-8 w-full transition-all duration-300 ${mainML}`}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#222222] tracking-tighter uppercase">My Pitches</h1>
              <p className="text-[#888888] text-sm mt-1">{pitches.length} pitch{pitches.length !== 1 ? 'es' : ''} total</p>
            </div>
            <Link
              href="/founder/create-pitch"
              className="bg-[#222222] text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" /> New Pitch
            </Link>
          </header>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
              <input
                type="text"
                placeholder="Search pitches..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-[0.5px] border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] text-[#222222]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border-[0.5px] border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="live">Live</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Pitch List */}
          <div className="space-y-3" ref={menuRef}>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] p-16 text-center">
                <FileText className="w-10 h-10 text-[#e5e5e5] mx-auto mb-4" />
                <h3 className="font-bold text-[#222222] mb-2">{search || statusFilter !== 'all' ? 'No pitches match your filters' : "You haven't created any pitches yet"}</h3>
                <p className="text-sm text-[#888888] mb-6">{search ? 'Try a different search term.' : 'Start building your investor-ready pitch profile.'}</p>
                {!search && statusFilter === 'all' && (
                  <Link href="/founder/create-pitch" className="inline-flex items-center gap-2 bg-[#222222] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-black transition-colors">
                    <Plus className="w-4 h-4" /> Create your first pitch
                  </Link>
                )}
              </div>
            ) : (
              filtered.map((pitch) => (
                <div
                  key={pitch.id}
                  className={`bg-white p-5 rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm hover:shadow-md transition-all flex items-center justify-between group ${deletingId === pitch.id ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-[#F2F2F0] rounded-2xl flex items-center justify-center overflow-hidden border-[0.5px] border-[#e5e5e5] flex-shrink-0">
                      {pitch.logo_url ? <img src={pitch.logo_url} alt="" className="w-full h-full object-cover" /> : <FileText className="w-5 h-5 text-[#888888]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-[#222222] text-sm">{pitch.title || 'Untitled Pitch'}</h3>
                        <StatusBadge status={pitch.status} />
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-medium text-[#888888] flex-wrap">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {pitch.views || 0} views</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(pitch.updated_at || pitch.created_at).toLocaleDateString()}</span>
                        {pitch.industry && <span className="hidden md:inline bg-[#F2F2F0] px-2 py-0.5 rounded text-[10px]">{pitch.industry}</span>}
                        {pitch.company_stage && <span className="hidden md:inline bg-[#F2F2F0] px-2 py-0.5 rounded text-[10px]">{pitch.company_stage}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Link href={`/founder/create-pitch?id=${pitch.id}`} className="hidden sm:block px-3 py-1.5 bg-[#F2F2F0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#e5e5e5] transition-colors">Edit</Link>
                    <Link href={`/pitch/${pitch.id}`} className="hidden sm:block px-3 py-1.5 bg-[#222222] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">View</Link>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === pitch.id ? null : pitch.id); }}
                        className="p-2 hover:bg-[#F2F2F0] rounded-xl transition-colors text-[#888888] hover:text-[#222222]"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === pitch.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border-[0.5px] border-[#e5e5e5] z-50 py-1">
                          <Link href={`/founder/create-pitch?id=${pitch.id}`} onClick={() => setOpenMenuId(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#F2F2F0]"><Edit2 className="w-4 h-4 text-[#888888]" />Edit pitch</Link>
                          <Link href={`/pitch/${pitch.id}`} onClick={() => setOpenMenuId(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#F2F2F0]"><ExternalLink className="w-4 h-4 text-[#888888]" />View public page</Link>
                          <button onClick={() => handleDuplicate(pitch)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#F2F2F0]"><Copy className="w-4 h-4 text-[#888888]" />Duplicate</button>
                          <div className="border-t-[0.5px] border-[#e5e5e5] my-1" />
                          <button
                            onClick={() => { setOpenMenuId(null); setConfirmDelete({ id: pitch.id, title: pitch.title || 'Untitled Pitch' }); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />Delete pitch
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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
      <Icon className="w-4 h-4" /><span className="text-[9px] font-bold">{label}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = { live: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700', draft: 'bg-gray-100 text-gray-500' };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.draft}`}>{status}</span>;
}
