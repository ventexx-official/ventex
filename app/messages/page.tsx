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
  };
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  deal_code: string | null;
  is_read: boolean;
  created_at: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'pitches' | 'orders'>('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobile, setShowMobile] = useState<'list' | 'thread'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
          .select('id, full_name, avatar_url, role')
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

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedId || !user) return;
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      // Mark as read
      await supabase.from('messages').update({ is_read: true }).eq('conversation_id', selectedId).neq('sender_id', user.id);
      // Reset unread counts
      const conv = conversations.find(c => c.id === selectedId);
      if (conv) {
        const field = conv.participant_a === user.id ? 'unread_a' : 'unread_b';
        await supabase.from('conversations').update({ [field]: 0 }).eq('id', selectedId);
      }
    };
    load();

    const channel = supabase
      .channel(`msgs:${selectedId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedId}` }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!draft.trim() || !selectedId || !user || sending) return;
    setSending(true);
    const content = draft.trim();
    setDraft('');
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: selectedId,
      sender_id: user.id,
      content,
      message_type: 'text',
      deal_code: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    await supabase.from('messages').insert({ conversation_id: selectedId, sender_id: user.id, content, message_type: 'text' });
    await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', selectedId);
    setSending(false);
  };

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
              <button className="p-2 rounded-xl hover:bg-[var(--bg2)] transition-colors">
                <MoreHorizontal className="w-5 h-5 text-[var(--text2)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-sm text-[var(--text2)] italic mt-8">No messages yet. Say hello!</p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.sender_id === user?.id;
                const prevMsg = messages[i - 1];
                const showSender = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                if (msg.message_type === 'system') {
                  return (
                    <div key={msg.id} className="text-center">
                      <p className="text-xs text-[var(--text2)] italic bg-[var(--bg2)] inline-block px-3 py-1.5 rounded-full">{msg.content}</p>
                    </div>
                  );
                }
                if (msg.deal_code) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 max-w-sm w-full">
                        <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest mb-2">Deal Code</p>
                        <p className="font-mono font-black text-violet-500 text-lg">{msg.deal_code}</p>
                        <p className="text-xs text-[var(--text2)] mt-2">{msg.content}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showSender && !isMine && (
                        <p className="text-[11px] font-semibold text-[var(--text2)] mb-1 ml-1">
                          {selected.other_user?.full_name || 'User'}
                        </p>
                      )}
                      <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-[var(--text)] text-[var(--bg)]'
                          : 'bg-[var(--bg2)] text-[var(--text)]'
                      }`} style={{ borderRadius: 12 }}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-[var(--text2)] mt-1 mx-1">{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex items-end gap-2 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none bg-[var(--bg2)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text2)] outline-none focus:ring-1 focus:ring-[var(--border2)] max-h-32"
                style={{ minHeight: 44 }}
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                className="w-10 h-10 flex items-center justify-center bg-[var(--text)] text-[var(--bg)] rounded-xl hover:opacity-80 transition-opacity disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
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