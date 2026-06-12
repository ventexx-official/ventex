'use client';

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Search, Plus, ArrowLeft, MessageSquare, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Conversation = {
  id: string;
  participant_a: string;
  participant_b: string;
  context_type: string | null;
  context_id: string | null;
  context_title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_a: number;
  unread_b: number;
  deal_status: string | null;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    whatsapp_number: string | null;
  };
};

function formatTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  if (diffH < 48) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (src) return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-[var(--bg2)] border border-[var(--border)] flex items-center justify-center font-bold text-[var(--text2)] flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

const CONTEXT_COLORS: Record<string, string> = {
  pitch_inquiry: 'bg-blue-100 text-blue-700',
  marketplace_purchase: 'bg-emerald-100 text-emerald-700',
  general: 'bg-[var(--bg2)] text-[var(--text2)]',
};

const CONTEXT_LABELS: Record<string, string> = {
  pitch_inquiry: 'PITCH',
  marketplace_purchase: 'ORDER',
  general: 'GENERAL',
};

function MessagesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'pitches' | 'orders'>('all');
  const [loading, setLoading] = useState(true);
  const [showMobile, setShowMobile] = useState<'list' | 'thread'>('list');

  // Load user + conversations
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/login'); return; }
      setUser(session.user);

      const { data: convos } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_a.eq.${session.user.id},participant_b.eq.${session.user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convos && convos.length > 0) {
        // Fetch other user profiles
        const otherIds = convos.map(c => c.participant_a === session.user.id ? c.participant_b : c.participant_a);
        const { data: profiles } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, role, whatsapp_number')
          .in('id', otherIds);

        const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
        const enriched = convos.map(c => ({
          ...c,
          other_user: profileMap[c.participant_a === session.user.id ? c.participant_b : c.participant_a] || null,
        }));
        setConversations(enriched);

        const requestedId = searchParams.get('conversationId');
        if (requestedId) {
          setSelectedId(requestedId);
          setShowMobile('thread');
        } else {
          setSelectedId(enriched[0]?.id || '');
        }
      }
      setLoading(false);
    };
    init();
  }, [router, searchParams]);

  // Load details for selected conversation
  useEffect(() => {
    if (!selectedId || !user) return;
    const load = async () => {
      // Reset unread counts
      const conv = conversations.find(c => c.id === selectedId);
      if (conv) {
        const field = conv.participant_a === user.id ? 'unread_a' : 'unread_b';
        await supabase.from('conversations').update({ [field]: 0 }).eq('id', selectedId);
      }
    };
    load();
  }, [selectedId, user]);

  const selected = useMemo(() => conversations.find(c => c.id === selectedId), [conversations, selectedId]);

  const filtered = conversations.filter(c => {
    const name = c.other_user?.full_name?.toLowerCase() || '';
    const matchSearch = !search || name.includes(search.toLowerCase()) || c.context_title?.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || (tab === 'pitches' && c.context_type === 'pitch_inquiry') || (tab === 'orders' && c.context_type === 'marketplace_purchase');
    return matchSearch && matchTab;
  });

  const myUnread = (c: Conversation) => c.participant_a === user?.id ? c.unread_a : c.unread_b;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--text)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg)] pt-16">
      {/* LEFT PANEL */}
      <div className={`${showMobile === 'thread' ? 'hidden md:flex' : 'flex'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-[var(--border)] bg-[var(--bg)] flex-shrink-0`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-2 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-black text-[var(--text)]">Messages</h1>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--bg2)] hover:bg-[var(--bg3)] transition-colors">
              <Plus className="w-4 h-4 text-[var(--text2)]" />
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg2)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text2)] border-0 outline-none focus:ring-1 focus:ring-[var(--border2)]"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'pitches', 'orders'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  tab === t ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--text2)] hover:bg-[var(--bg2)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <MessageSquare className="w-12 h-12 text-[var(--text3)] mb-4" />
              <p className="font-bold text-[var(--text)] mb-1">No conversations yet.</p>
              <p className="text-sm text-[var(--text2)] mb-6">Start by contacting a founder or browsing the marketplace.</p>
              <Link href="/discover" className="text-sm font-bold text-violet-500 hover:underline mb-2">Browse Startups →</Link>
              <Link href="/marketplace" className="text-sm font-bold text-violet-500 hover:underline">Browse Marketplace →</Link>
            </div>
          ) : (
            filtered.map(c => {
              const unread = myUnread(c);
              const isActive = c.id === selectedId;
              const ctxKey = c.context_type || 'general';
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); setShowMobile('thread'); }}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-[var(--border)] transition-colors text-left ${
                    isActive ? 'bg-[var(--bg2)]' : 'hover:bg-[var(--bg2)]/50'
                  }`}
                >
                  <Avatar name={c.other_user?.full_name || '?'} src={c.other_user?.avatar_url} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${unread > 0 ? 'font-black text-[var(--text)]' : 'font-semibold text-[var(--text)]'}`}>
                        {c.other_user?.full_name || 'Unknown User'}
                      </p>
                      <span className="text-[11px] text-[var(--text2)] flex-shrink-0">{formatTime(c.last_message_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${CONTEXT_COLORS[ctxKey]}`}>
                        {CONTEXT_LABELS[ctxKey] || ctxKey}
                      </span>
                      {unread > 0 && (
                        <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text2)] truncate mt-1">{c.last_message || c.context_title || 'No messages yet.'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={`${showMobile === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <MessageSquare className="w-16 h-16 text-[var(--text3)] mb-4" />
            <p className="font-bold text-[var(--text)] mb-1">Select a conversation</p>
            <p className="text-sm text-[var(--text2)] mb-6">Or start a new one</p>
            <div className="flex gap-3">
              <Link href="/discover" className="text-sm font-bold bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-xl hover:opacity-80 transition-opacity">Browse Startups</Link>
              <Link href="/investors" className="text-sm font-bold border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-xl hover:bg-[var(--bg2)] transition-colors">Browse Investors</Link>
            </div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex-shrink-0">
              <button onClick={() => setShowMobile('list')} className="md:hidden p-1 rounded-lg hover:bg-[var(--bg2)] transition-colors">
                <ArrowLeft className="w-5 h-5 text-[var(--text2)]" />
              </button>
              <Avatar name={selected.other_user?.full_name || '?'} src={selected.other_user?.avatar_url} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text)] text-sm">{selected.other_user?.full_name || 'Unknown User'}</p>
                {selected.context_title && (
                  <p className="text-xs text-[var(--text2)] truncate">Re: {selected.context_title}</p>
                )}
              </div>
            </div>

            {/* Lead Details */}
            <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center">
              <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar name={selected.other_user?.full_name || '?'} src={selected.other_user?.avatar_url} size={80} />
                  <h2 className="text-xl font-black mt-4 text-[var(--text)]">{selected.other_user?.full_name || 'Unknown User'}</h2>
                  <p className="text-sm font-semibold text-[var(--text2)] uppercase tracking-widest mt-1">
                    {selected.other_user?.role || 'User'}
                  </p>
                </div>
                
                <div className="bg-[var(--bg2)] rounded-2xl p-4 mb-6">
                  <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest mb-1">Context</p>
                  <p className="text-sm font-semibold text-[var(--text)]">{selected.context_title || 'General Inquiry'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${CONTEXT_COLORS[selected.context_type || 'general']}`}>
                      {CONTEXT_LABELS[selected.context_type || 'general'] || selected.context_type || 'GENERAL'}
                    </span>
                  </div>
                </div>

                {selected.last_message && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest mb-2">Initial Message</p>
                    <p className="text-sm text-[var(--text)] bg-[var(--bg2)] p-4 rounded-2xl italic">
                      "{selected.last_message}"
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  {selected.other_user?.whatsapp_number ? (
                    <a
                      href={`https://wa.me/${selected.other_user.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selected.other_user.full_name}, I saw your inquiry regarding "${selected.context_title}" on Ventex!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#20b858] active:scale-95 transition-all shadow-lg shadow-[#25D366]/20"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Chat on WhatsApp
                    </a>
                  ) : (
                    <div className="text-center">
                      <button disabled className="w-full flex items-center justify-center gap-3 bg-[var(--bg2)] text-[var(--text3)] px-6 py-4 rounded-2xl font-bold cursor-not-allowed">
                        <MessageSquare className="w-5 h-5" />
                        No WhatsApp Provided
                      </button>
                      <p className="text-xs text-[var(--text2)] mt-3">This user has not linked their WhatsApp number.</p>
                    </div>
                  )}
                  <p className="text-xs text-center text-[var(--text2)] mt-4">
                    All communication and payments are directly P2P via WhatsApp. Ventex takes 0% commission.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>}>
      <MessagesInner />
    </Suspense>
  );
}