"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Send, 
  AlertOctagon, 
  ArrowLeft, 
  MessageSquare, 
  User, 
  ShieldAlert, 
  Clock, 
  Check, 
  Sparkles,
  Lock
} from 'lucide-react';


export default function DealRoomChat() {
  const { interestId } = useParams();
  const router = useRouter();
  const [interest, setInterest] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initDealRoom = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setCurrentUser(session.user);

        // Fetch interest detail
        const { data: interestData, error: interestError } = await supabase
          .from('investor_interests')
          .select(`
            *,
            pitch:pitch_id ( id, title, logo_url, founder_id ),
            investor:investor_id ( id, full_name, avatar_url, email )
          `)
          .eq('id', interestId)
          .single();

        if (interestError || !interestData) {
          console.error('Error fetching interest:', interestError);
          router.push('/discover');
          return;
        }

        // Access checks
        const isInvestor = interestData.investor_id === session.user.id;
        const isFounder = interestData.pitch?.founder_id === session.user.id;

        if (!isInvestor && !isFounder) {
          alert("Access Denied: You are not authorized to view this deal room.");
          router.push('/discover');
          return;
        }

        if (interestData.status !== 'accepted') {
          setInterest(interestData);
          setLoading(false);
          return; // Stay in locked state render
        }

        setInterest(interestData);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('deal_room_messages')
          .select(`
            *,
            sender:sender_id ( id, full_name, role, avatar_url )
          `)
          .eq('interest_id', interestId)
          .order('created_at', { ascending: true });

        if (!messagesError && messagesData) {
          setMessages(messagesData);
        }

        setLoading(false);

        // Real-time listener
        const channel = supabase
          .channel(`deal_room_messages:${interestId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'deal_room_messages',
            filter: `interest_id=eq.${interestId}`
          }, async (payload) => {
            const { data: fullMsg } = await supabase
              .from('deal_room_messages')
              .select(`
                *,
                sender:sender_id ( id, full_name, role, avatar_url )
              `)
              .eq('id', payload.new.id)
              .single();

            if (fullMsg) {
              setMessages(prev => {
                if (prev.some(m => m.id === fullMsg.id)) return prev;
                return [...prev, fullMsg];
              });
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };

      } catch (err) {
        console.error(err);
        router.push('/discover');
      }
    };

    if (interestId) {
      initDealRoom();
    }
  }, [interestId, router]);

  // Moderation validator
  const validateMessage = (text: string): boolean => {
    // 1. Phone numbers: US, IN, formats with spaces/hyphens, or 10-digit formats
    const phoneRegex = /\b(\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/;
    
    // 2. UPI Handles: ending in @[bank/app]
    const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]{3,}/;

    // 3. WhatsApp mentions
    const whatsappRegex = /\b(whatsapp|wa|w\.a\.)\b/i;

    // 4. External payments: paypal, gpay, phonepe, paytm
    const paymentRegex = /(paypal|gpay|phonepe|paytm|pay\.google\.com|paypal\.com|phonepe\.com)\b/i;

    if (phoneRegex.test(text) || upiRegex.test(text) || whatsappRegex.test(text) || paymentRegex.test(text)) {
      setModerationWarning("Please keep discussions on-platform. Sharing payment details violates Ventex terms.");
      return false;
    }

    setModerationWarning(null);
    return true;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // Validate
    if (!validateMessage(newMessage)) {
      return;
    }

    setSending(true);
    try {
      const { data: _data, error } = await supabase
        .from('deal_room_messages')
        .insert({
          interest_id: interestId,
          sender_id: currentUser.id,
          content: newMessage
        })
        .select()
        .single();

      if (error) throw error;
      setNewMessage('');
    } catch (err: any) {
      console.error(err);
      alert("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleReportConversation = async () => {
    if (confirm("Are you sure you want to report this conversation? A moderator will review all thread history.")) {
      setReporting(true);
      try {
        // Flag all messages
        await supabase
          .from('deal_room_messages')
          .update({ flagged: true })
          .eq('interest_id', interestId);

        setIsReported(true);
        alert("Thank you. Our moderation team has been notified and will review this thread.");
      } catch (err: any) {
        console.error(err);
        alert("Failed to send report: " + err.message);
      } finally {
        setReporting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Deal Room is not accepted state
  if (interest?.status !== 'accepted') {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-[32px] p-8 border-[0.5px] border-[#e5e5e5] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-[#222222] uppercase tracking-tight">Deal Room Locked</h2>
          <p className="text-sm text-[#888888] leading-relaxed">
            The deal room for <strong>"{interest?.pitch?.title || 'this Pitch'}"</strong> has not been unlocked. The founder must Accept your interest request in their dashboard to unlock this secure messaging channel.
          </p>
          <button 
            onClick={() => router.push('/discover')}
            className="w-full py-3 bg-[#222222] hover:bg-black text-white font-bold rounded-2xl text-sm transition-all"
          >
            Return to Discover
          </button>
        </div>
      </div>
    );
  }

  const otherUser = currentUser.id === interest.investor_id 
    ? { name: interest.pitch?.title || 'Founder', email: 'Founder', avatar: interest.pitch?.logo_url } 
    : { name: interest.investor?.full_name || 'Investor', email: interest.investor?.email, avatar: interest.investor?.avatar_url };

  return (
    <div className="min-h-screen bg-[#F2F2F0] flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b-[0.5px] border-[#e5e5e5] px-6 py-4 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[#F2F2F0] rounded-full text-[#888888] hover:text-[#222222] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] flex items-center justify-center overflow-hidden flex-shrink-0">
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-[#888888]" />
              )}
            </div>
            <div>
              <h2 className="font-black text-sm text-[#222222] leading-tight uppercase tracking-tight flex items-center gap-1.5">
                {otherUser.name} 
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </h2>
              <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">
                Secure Deal Room Chat
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleReportConversation}
          disabled={reporting || isReported}
          className={`flex items-center gap-1.5 px-4 py-2 border-[0.5px] rounded-full text-xs font-bold transition-all ${
            isReported 
              ? 'bg-red-50 text-red-500 border-red-200' 
              : 'border-[#e5e5e5] text-[#888888] hover:text-red-500 hover:bg-red-50 hover:border-red-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isReported ? 'Conversation Reported' : 'Report Conversation'}</span>
        </button>
      </header>

      {/* CHAT MESSAGES BODY */}
      <div className="flex-grow overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="max-w-md mx-auto text-center space-y-3 py-12">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto border-[0.5px] border-[#e5e5e5]">
              <MessageSquare className="w-5 h-5 text-[#888888]" />
            </div>
            <h3 className="font-bold text-[#222222] text-sm uppercase tracking-tight">Deal Room Initialized</h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              This is a secure, end-to-end moderated chat channel for sharing private discussions and deal queries. Keep your transactions and conversations strictly on Ventex.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_id === currentUser.id;
            const timeStr = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div 
                key={message.id} 
                className={`flex gap-3 max-w-[80%] md:max-w-[60%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-lg bg-white border-[0.5px] border-[#e5e5e5] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {message.sender?.avatar_url ? (
                      <img src={message.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#888888]" />
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-[#222222] text-white rounded-tr-none' 
                      : 'bg-white text-[#222222] border-[0.5px] border-[#e5e5e5] rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] text-[#888888] px-1 ${isMe ? 'justify-end' : ''}`}>
                    <Clock className="w-3 h-3" />
                    <span>{timeStr}</span>
                    {isMe && <Check className="w-3 h-3 text-emerald-500" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT AREA */}
      <div className="bg-white border-t-[0.5px] border-[#e5e5e5] p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {moderationWarning && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-center animate-in slide-in-from-bottom-2 duration-200">
              <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">
                {moderationWarning}
              </p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (moderationWarning) validateMessage(e.target.value);
              }}
              placeholder="Send secure message..."
              className="flex-grow px-5 py-3.5 rounded-2xl border-[0.5px] border-[#e5e5e5] bg-[#F2F2F0] text-sm text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
            />
            <button 
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-5 rounded-2xl bg-[#222222] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center text-[#888888] font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Messages are real-time, secured, and scanned by standard content safety.
          </p>
        </div>
      </div>
    </div>
  );
}
