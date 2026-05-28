"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sanitizeMessage } from "@/lib/message-protection";
import { getDealEnforcementState } from "@/lib/deal-enforcement";

type ConversationMeta = {
  preview: string;
  timestamp: string;
  unread: number;
};

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationMeta, setConversationMeta] = useState<Record<string, ConversationMeta>>({});
  const [dealsByConversation, setDealsByConversation] = useState<Record<string, any>>({});
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [showExternalWarning, setShowExternalWarning] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      const { data } = await supabase
        .from("conversations")
        .select("*, pitch:pitch_id(id,title), founder:founder_id(id,full_name,avatar_url), investor:investor_id(id,full_name,avatar_url)")
        .or(`founder_id.eq.${session.user.id},investor_id.eq.${session.user.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      const requestedConversation = searchParams.get("conversationId");
      setConversations(data || []);
      setSelectedId(requestedConversation || (data || [])[0]?.id || "");

      const ids = (data || []).map((conversation: any) => conversation.id);
      if (ids.length > 0) {
        const [{ data: messageRows }, { data: dealRows }] = await Promise.all([
          supabase
            .from("messages")
            .select("id, conversation_id, sender_id, content, read, created_at")
            .in("conversation_id", ids)
            .order("created_at", { ascending: false }),
          supabase
            .from("deals")
            .select("*")
            .in("conversation_id", ids),
        ]);

        const meta: Record<string, ConversationMeta> = {};
        ids.forEach((conversationId: string) => {
          const rows = (messageRows || []).filter((message: any) => message.conversation_id === conversationId);
          const latest = rows[0];
          meta[conversationId] = {
            preview: latest?.content || "No messages yet.",
            timestamp: formatTime(latest?.created_at),
            unread: rows.filter((message: any) => message.sender_id !== session.user.id && !message.read).length,
          };
        });
        setConversationMeta(meta);
        setDealsByConversation(Object.fromEntries((dealRows || []).map((deal: any) => [deal.conversation_id, deal])));
      } else {
        setConversationMeta({});
        setDealsByConversation({});
      }
    };
    load();
  }, [router, searchParams]);

  useEffect(() => {
    if (!selectedId || !user) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      await supabase.from("messages").update({ read: true }).eq("conversation_id", selectedId).neq("sender_id", user.id);
    };
    loadMessages();
    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` }, loadMessages)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId, user]);

  const selected = useMemo(() => conversations.find((item) => item.id === selectedId), [conversations, selectedId]);
  const isFounder = selected?.founder_id === user?.id;
  const selectedDeal = selected ? dealsByConversation[selected.id] : null;
  const enforcement = getDealEnforcementState(selectedDeal);

  const sendMessage = async (force = false) => {
    if (!draft.trim() || !selected || !user || enforcement.isLocked || enforcement.isBanned) return;
    const result = sanitizeMessage(draft.trim());
    if (result.hasExternalUrl && !force) {
      setShowExternalWarning(true);
      return;
    }
    const { data } = await supabase.from("messages").insert({
      conversation_id: selected.id,
      sender_id: user.id,
      content: result.masked,
    }).select().single();
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", selected.id);
    if (result.flags.length > 0) {
      await Promise.all(result.flags.map((flag) => supabase.from("moderation_flags").insert({
        conversation_id: selected.id,
        message_id: data?.id,
        flag_type: flag,
        content: draft.trim(),
      })));
    }
    setDraft("");
    setShowExternalWarning(false);
  };

  const markDealAgreed = async () => {
    if (!selected || !user) return;
    const amount = Number(prompt("Enter final agreed amount"));
    if (!amount || Number.isNaN(amount)) return;
    const fee = amount * 0.02;
    const ok = confirm(`Platform fee: Rs ${fee.toLocaleString("en-IN")} (2% of Rs ${amount.toLocaleString("en-IN")}) — activates post early access\n\nI agree to pay Rs ${fee.toLocaleString("en-IN")} to Ventex when fee collection activates`);
    if (!ok) return;
    await supabase.from("deals").upsert({
      pitch_id: selected.pitch_id,
      founder_id: selected.founder_id,
      investor_id: selected.investor_id,
      conversation_id: selected.id,
      agreed_amount: amount,
      status: "agreed",
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    }, { onConflict: "conversation_id" });
    alert(`Deal agreed. Platform fee of Rs ${fee.toLocaleString("en-IN")} will apply post early access.`);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`${selectedId ? "hidden md:block" : "block"} border-r p-4`} style={{ borderColor: "var(--border)" }}>
          <h1 className="mb-4 text-2xl font-black">Messages</h1>
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const other = conversation.founder_id === user?.id ? conversation.investor : conversation.founder;
              const meta = conversationMeta[conversation.id];
              return (
                <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`w-full rounded-lg border p-3 text-left ${selectedId === conversation.id ? "bg-[var(--bg2)]" : ""}`} style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--text)] text-sm font-black text-[var(--bg)]">
                      {(other?.full_name || "U")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-black">{other?.full_name || "Ventex member"}</p>
                        <span className="shrink-0 text-[10px] font-semibold text-[var(--text3)]">{meta?.timestamp}</span>
                      </div>
                      <p className="truncate text-xs text-[var(--text3)]">{conversation.pitch?.title || "Pitch conversation"}</p>
                      <p className="mt-1 truncate text-xs text-[var(--text2)]">{meta?.preview || "No messages yet."}</p>
                    </div>
                    {meta?.unread ? (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                        {meta.unread}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
            {conversations.length === 0 ? <p className="text-sm text-[var(--text2)]">No conversations yet.</p> : null}
          </div>
        </aside>

        <section className={`${selectedId ? "block" : "hidden md:block"} flex min-h-[calc(100vh-64px)] flex-col`}>
          {selected ? (
            <>
              <header className="border-b p-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[var(--text3)]">Pitch</p>
                    <Link href={`/pitch/${selected.pitch_id}`} className="font-black underline underline-offset-4">{selected.pitch?.title || "View pitch"}</Link>
                  </div>
                  {isFounder ? <button onClick={markDealAgreed} className="btn-primary">Mark Deal as Agreed</button> : null}
                </div>
              </header>
              {(selectedDeal && (enforcement.isLocked || enforcement.isBanned || enforcement.isPartialUnlock)) ? (
                <div className={`border-b p-4 text-sm font-bold ${enforcement.isLocked || enforcement.isBanned ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`} style={{ borderColor: "var(--border)" }}>
                  <p>{enforcement.label}</p>
                  {enforcement.isSevenDayOverdue ? <p className="mt-1 text-xs">Pitch hidden from Discover and data room access revoked when fee collection activates post early access.</p> : null}
                  {enforcement.isFourteenDayOverdue ? <p className="mt-1 text-xs">Pitch permanently delisted, founder added to blacklist, and investor receives 1 month credit when enforcement activates.</p> : null}
                </div>
              ) : null}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message) => {
                  const founderMessage = message.sender_id === selected.founder_id;
                  return (
                    <div key={message.id} className={`flex ${founderMessage ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${founderMessage ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--bg2)] text-[var(--text)]"}`}>
                        {message.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              {showExternalWarning ? (
                <div className="border-t p-4 text-sm" style={{ borderColor: "var(--border)" }}>
                  <p className="font-bold text-red-600">Sharing external contacts violates Ventex terms.</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => sendMessage(true)} className="btn-primary">Send Anyway</button>
                    <button onClick={() => setShowExternalWarning(false)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--border)" }}>
                <input disabled={enforcement.isLocked || enforcement.isBanned} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} className="min-h-11 flex-1 border bg-[var(--bg)] px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60" style={{ borderColor: "var(--border)" }} placeholder={enforcement.isLocked || enforcement.isBanned ? "Conversation paused — pending platform fee settlement" : "Write a message..."} />
                <button disabled={enforcement.isLocked || enforcement.isBanned} onClick={() => sendMessage()} className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" /> Send</button>
              </div>
            </>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-[var(--text2)]">Select a conversation</div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--bg)]" />}>
      <MessagesContent />
    </Suspense>
  );
}
