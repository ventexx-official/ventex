"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles, Lock, FileText, Share2, Heart, CheckCircle2, User, Send, X } from 'lucide-react';
import Link from 'next/link';
import PitchDeckViewer from '@/components/PitchDeckViewer';

// Fire-and-forget email helper
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Helper
function formatCurrency(amount: number) {
  if (!amount) return 'N/A';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString()}`;
}

export default function PitchDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [pitch, setPitch] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Subscription state
  const [investorPremium, setInvestorPremium] = useState(false);
  const [ventexAccess, setVentexAccess] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  
  // Interest modal state
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [sendingInterest, setSendingInterest] = useState(false);

  const handleSendInterest = async () => {
    if (!currentUser) {
      alert("Please log in to express interest.");
      return;
    }
    if (!investorPremium && !ventexAccess) {
      if (confirm("Ventex Access or Investor Premium is required to express interest. Upgrade now?")) {
        router.push('/pricing');
      }
      return;
    }
    if (interestMessage.length > 500) {
      alert("Message must be 500 characters or less.");
      return;
    }
    setSendingInterest(true);
    try {
      const { data, error } = await supabase
        .from('investor_interests')
        .insert({
          investor_id: currentUser.id,
          pitch_id: pitch.id,
          message: interestMessage,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;

      // Create notification for founder
      if (pitch.founder_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: pitch.founder_id,
            type: 'interest',
            message: `${currentProfile?.full_name || currentUser.email?.split('@')[0] || 'An investor'} has expressed interest in your pitch: "${pitch.title}"`,
            link: `/founder/dashboard`
          });

        // Fire investor_interest email to founder via server trigger
        await fetch('/api/emails/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'investor_interest',
            payload: {
              pitchFounderId: pitch.founder_id,
              startupName: pitch.title,
              investorName: currentProfile?.full_name || currentUser.email?.split('@')[0] || 'A premium investor',
              message: interestMessage,
            },
          }),
        });
      }

      alert("Interest expressed successfully! The founder has been notified.");
      setIsInterestModalOpen(false);
      setInterestMessage('');
    } catch (err: any) {
      console.error(err);
      alert("Failed to express interest: " + err.message);
    } finally {
      setSendingInterest(false);
    }
  };

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const { data: pitchData, error: pitchError } = await supabase
          .from('pitches')
          .select('*')
          .eq('id', id)
          .single();
          
        if (pitchError) throw pitchError;
        setPitch(pitchData);

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('pitch_id', id);
          
        if (productsError) throw productsError;
        setProducts(productsData || []);

      } catch (err) {
        console.error('Error fetching pitch:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Load current user session + liked comments from localStorage
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, role, avatar_url, investor_premium, ventex_access, subscription_end_date')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setCurrentProfile(profile);
          const hasActiveSub = profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date();
          setInvestorPremium(!!(profile.investor_premium && hasActiveSub));
          setVentexAccess(!!((profile.ventex_access || profile.investor_premium) && hasActiveSub));
        }
      }
      // Load liked comments from localStorage
      try {
        const stored = localStorage.getItem(`ventex_liked_${id}`);
        if (stored) setLikedComments(new Set(JSON.parse(stored)));
      } catch {}
    };
    if (id) loadUser();
  }, [id]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!id) return;
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, content, likes, created_at,
        users:user_id ( id, full_name, role, avatar_url )
      `)
      .eq('pitch_id', id)
      .order('created_at', { ascending: false });
    if (data) setComments(data);
    setCommentsLoading(false);
  }, [id]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Real-time subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`comments:${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `pitch_id=eq.${id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          fetchComments(); // re-fetch to get joined user data
        } else if (payload.eventType === 'UPDATE') {
          setComments(prev => prev.map(c =>
            c.id === payload.new.id ? { ...c, likes: payload.new.likes } : c
          ));
        } else if (payload.eventType === 'DELETE') {
          setComments(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchComments]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser || posting) return;
    setPosting(true);
    const optimistic = {
      id: `opt-${Date.now()}`,
      content: newComment,
      likes: 0,
      created_at: new Date().toISOString(),
      users: {
        id: currentUser.id,
        full_name: currentProfile?.full_name || currentUser.email?.split('@')[0] || 'You',
        role: currentProfile?.role || 'visitor',
        avatar_url: currentProfile?.avatar_url || null,
      },
    };
    setComments(prev => [optimistic, ...prev]);
    setNewComment('');
    const { error } = await supabase.from('comments').insert({
      pitch_id: id,
      user_id: currentUser.id,
      content: optimistic.content,
      likes: 0,
    });
    if (error) {
      console.error('Error posting comment:', error);
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
      setNewComment(optimistic.content);
      alert('Failed to post comment: ' + error.message);
    } else {
      // Fire new_comment email to founder via server trigger
      try {
        if (pitch?.founder_id) {
          fetch('/api/emails/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'new_comment',
              payload: {
                pitchFounderId: pitch.founder_id,
                pitchId: id,
                pitchName: pitch.title,
                commenterName: currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'Someone',
                commentText: optimistic.content,
              },
            }),
          });
        }
      } catch {}
    }
    setPosting(false);
  };

  const handleLike = async (commentId: string, currentLikes: number) => {
    if (!currentUser) return;
    const alreadyLiked = likedComments.has(commentId);
    const newLiked = new Set(likedComments);
    if (alreadyLiked) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);
    localStorage.setItem(`ventex_liked_${id}`, JSON.stringify(Array.from(newLiked)));
    // Optimistic UI
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, likes: alreadyLiked ? c.likes - 1 : c.likes + 1 } : c
    ));
    await supabase.from('comments').update({ likes: alreadyLiked ? currentLikes - 1 : currentLikes + 1 }).eq('id', commentId);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-300 dark:bg-[#222222] rounded-xl mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-[#222222] rounded w-32 mb-2"></div>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] flex items-center justify-center flex-col text-center px-4">
        <h1 className="text-2xl font-bold text-[#222222] dark:text-white mb-2">Pitch not found</h1>
        <p className="text-[#888888] mb-6">The pitch you are looking for does not exist or has been removed.</p>
        <Link href="/discover" className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-6 py-2 rounded-full font-medium">Browse startups</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F2F2F0] dark:bg-[#111111] min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-12 space-y-6">
        
        {/* HERO CARD */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-8 relative">
          {pitch.status === 'live' && pitch.is_raising === false && (
            <div className="absolute top-8 right-8 flex items-center gap-1 bg-[#F2F2F0] dark:bg-[#333333] px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-[10px] font-bold text-[#222222] dark:text-white uppercase tracking-wider">Verified</span>
            </div>
          )}
          {pitch.is_raising && (
            <div className="absolute top-8 right-8 flex items-center gap-1 bg-[#222222] dark:bg-white px-3 py-1 rounded-full">
              <span className="text-[10px] font-bold text-white dark:text-[#222222] uppercase tracking-wider">Raising</span>
            </div>
          )}

          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 bg-[#F2F2F0] dark:bg-[#333333] rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
              {pitch.logo_url ? <img src={pitch.logo_url} alt={pitch.title} className="w-full h-full object-cover" /> : <div className="text-2xl font-bold text-[#888888]">{pitch.title?.charAt(0)}</div>}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#222222] dark:text-white mb-2">{pitch.title}</h1>
              <p className="text-lg text-[#888888] mb-4">{pitch.tagline || pitch.short_description}</p>
              <div className="flex gap-2 flex-wrap">
                {pitch.industry && <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[11px] px-3 py-1.5 rounded-md font-medium">{pitch.industry}</span>}
                {pitch.company_stage && <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[11px] px-3 py-1.5 rounded-md font-medium">{pitch.company_stage}</span>}
                {pitch.country && <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[11px] px-3 py-1.5 rounded-md font-medium">{pitch.country}</span>}
                {pitch.business_type && <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[11px] px-3 py-1.5 rounded-md font-medium">{pitch.business_type}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 flex flex-col justify-center text-center">
              <span className="text-[#888888] text-xs font-medium uppercase tracking-wider mb-1">Funding Ask</span>
              <span className="text-xl font-bold text-[#222222] dark:text-white">{formatCurrency(pitch.amount_seeking)}</span>
            </div>
            <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 flex flex-col justify-center text-center">
              <span className="text-[#888888] text-xs font-medium uppercase tracking-wider mb-1">Equity Offered</span>
              <span className="text-xl font-bold text-[#222222] dark:text-white">{pitch.equity_pct ? `${pitch.equity_pct}%` : 'N/A'}</span>
            </div>
            <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 flex flex-col justify-center text-center">
              <span className="text-[#888888] text-xs font-medium uppercase tracking-wider mb-1">Valuation (Post)</span>
              <span className="text-xl font-bold text-[#222222] dark:text-white">
                {pitch.amount_seeking && pitch.equity_pct ? formatCurrency(pitch.amount_seeking / (pitch.equity_pct / 100)) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => {
                 if (investorPremium || ventexAccess) {
                   setIsInterestModalOpen(true);
                 } else {
                   if (confirm("Ventex Access or Investor Premium is required to express interest. Upgrade now?")) {
                     router.push('/pricing');
                   }
                 }
               }}
               className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-8 py-3 rounded-full text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors flex-grow md:flex-grow-0 text-center"
             >
               Express interest
             </button>
            <button className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] text-[#222222] dark:text-white p-3 rounded-full hover:bg-[#F2F2F0] dark:hover:bg-[#333333] transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] text-[#222222] dark:text-white p-3 rounded-full hover:bg-[#F2F2F0] dark:hover:bg-[#333333] transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI SUMMARY BAR */}
        {pitch.ai_summary && (
          <div className="bg-gradient-to-r from-[#F2F2F0] to-white dark:from-[#222222] dark:to-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#888888]" />
              <span className="text-xs font-bold text-[#222222] dark:text-white uppercase tracking-wider">AI-generated briefing</span>
            </div>
            <p className="text-[#888888] italic text-[15px] leading-relaxed">"{pitch.ai_summary}"</p>
          </div>
        )}

        {/* CONTENT SECTIONS */}
        <div className="space-y-6">
          {/* Problem & Solution */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] overflow-hidden">
            <div className="p-6 border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333]">
              <h2 className="text-lg font-bold text-[#222222] dark:text-white mb-6">Problem & Solution</h2>
              <div className="flex gap-4 items-start mb-8">
                <div className="w-8 h-8 rounded-full bg-[#F2F2F0] dark:bg-[#333333] flex items-center justify-center flex-shrink-0 font-bold text-[#888888] text-sm">P</div>
                <div>
                  <h3 className="font-bold text-[#222222] dark:text-white mb-2 text-sm">The Problem</h3>
                  <p className="text-[#888888] text-sm leading-relaxed">{pitch.problem || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#222222] dark:bg-white flex items-center justify-center flex-shrink-0 font-bold text-white dark:text-[#222222] text-sm">S</div>
                <div>
                  <h3 className="font-bold text-[#222222] dark:text-white mb-2 text-sm">Our Solution</h3>
                  <p className="text-[#888888] text-sm leading-relaxed">{pitch.solution || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Market Opportunity */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6">
            <h2 className="text-lg font-bold text-[#222222] dark:text-white mb-6">Market opportunity</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F2F2F0] dark:bg-[#333333] rounded-xl p-4 text-center">
                <div className="text-xs text-[#888888] font-bold mb-1">TAM</div>
                <div className="font-bold text-[#222222] dark:text-white">{formatCurrency(pitch.tam)}</div>
              </div>
              <div className="bg-[#F2F2F0] dark:bg-[#333333] rounded-xl p-4 text-center">
                <div className="text-xs text-[#888888] font-bold mb-1">SAM</div>
                <div className="font-bold text-[#222222] dark:text-white">{formatCurrency(pitch.sam)}</div>
              </div>
              <div className="bg-[#F2F2F0] dark:bg-[#333333] rounded-xl p-4 text-center">
                <div className="text-xs text-[#888888] font-bold mb-1">SOM</div>
                <div className="font-bold text-[#222222] dark:text-white">{formatCurrency(pitch.som)}</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-2">Market Trends</h3>
              <p className="text-[#888888] text-sm leading-relaxed">{pitch.market_trend || 'Not specified'}</p>
            </div>
          </div>

          {/* Competition */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6">
            <h2 className="text-lg font-bold text-[#222222] dark:text-white mb-6">Competition</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-2">Key Competitors</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{pitch.competitors || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-2">Competitive Advantages</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{pitch.competitive_advantages || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-2">Moat / Defensibility</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{pitch.moat || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Business Model */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6">
            <h2 className="text-lg font-bold text-[#222222] dark:text-white mb-6">Business model</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-2">Revenue Model</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{pitch.revenue_model || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-2">Pricing Strategy</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{pitch.pricing || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Team (Mocked) */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6">
            <h2 className="text-lg font-bold text-[#222222] dark:text-white mb-6">Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F2F2F0] dark:bg-[#333333] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#888888]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#222222] dark:text-white text-sm">Jane Doe</h4>
                  <p className="text-[#888888] text-[11px] uppercase tracking-wider mb-2">Founder & CEO</p>
                  <p className="text-[#888888] text-xs">Ex-Google PM. 2x founder with 1 exit in the logistics space.</p>
                </div>
              </div>
              <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F2F2F0] dark:bg-[#333333] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#888888]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#222222] dark:text-white text-sm">John Smith</h4>
                  <p className="text-[#888888] text-[11px] uppercase tracking-wider mb-2">CTO</p>
                  <p className="text-[#888888] text-xs">10 years engineering leadership at Stripe. Built highly scalable architectures.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Traction & Financials (Premium Gated) */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6 relative overflow-hidden">
            <h2 className="text-lg font-bold text-[#222222] dark:text-white mb-6">Traction & Financials</h2>
            
            <div className={`space-y-6 ${!investorPremium ? 'blur-sm select-none opacity-50' : ''}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F2F2F0] dark:bg-[#333333] rounded-xl p-4">
                  <div className="text-xs text-[#888888] mb-1">MRR</div>
                  <div className="font-bold text-[#222222] dark:text-white">{formatCurrency(pitch.mrr)}</div>
                </div>
                <div className="bg-[#F2F2F0] dark:bg-[#333333] rounded-xl p-4">
                  <div className="text-xs text-[#888888] mb-1">ARR</div>
                  <div className="font-bold text-[#222222] dark:text-white">{formatCurrency(pitch.arr)}</div>
                </div>
                <div className="bg-[#F2F2F0] dark:bg-[#333333] rounded-xl p-4">
                  <div className="text-xs text-[#888888] mb-1">Active Users</div>
                  <div className="font-bold text-[#222222] dark:text-white">{pitch.users_count ? pitch.users_count.toLocaleString() : 'N/A'}</div>
                </div>
                <div className="bg-[#F2F2F0] dark:bg-[#333333] rounded-xl p-4">
                  <div className="text-xs text-[#888888] mb-1">MoM Growth</div>
                  <div className="font-bold text-[#222222] dark:text-white">{pitch.mom_growth || 'N/A'}</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-2">Key Milestones</h3>
                <p className="text-[#888888] text-sm leading-relaxed whitespace-pre-wrap">{pitch.milestones || 'Not specified'}</p>
              </div>
            </div>

            {!investorPremium && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px]">
                <div className="bg-white dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6 rounded-2xl flex flex-col items-center text-center max-w-sm shadow-xl">
                  <div className="w-12 h-12 bg-[#F2F2F0] dark:bg-[#222222] rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5 text-[#222222] dark:text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#222222] dark:text-white mb-2">Premium content</h3>
                  <p className="text-sm text-[#888888] mb-6">Financial data and traction details are reserved for verified premium investors.</p>
                  <Link href="/pricing" className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] w-full py-3 rounded-full text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors">
                    Unlock with Investor Premium
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Product Listings (If exists) */}
          {products.length > 0 && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#222222] dark:text-white">Products by this startup</h2>
                <span className="text-[#888888] text-sm font-medium">{products.length} listed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className="border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[10px] overflow-hidden group">
                    <div className="w-full aspect-video bg-[#F2F2F0] dark:bg-[#333333] flex items-center justify-center">
                      <span className="text-[#888888] text-xs">Image Placeholder</span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-[#222222] dark:text-white text-sm mb-1 truncate">{p.name}</h4>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-bold text-[#222222] dark:text-white text-sm">{formatCurrency(p.price)}</span>
                        <button className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-3 py-1.5 rounded-md text-xs font-bold hover:bg-black dark:hover:bg-gray-200">Buy now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6 relative overflow-hidden">
            <h2 className="text-lg font-bold text-[#222222] dark:text-white mb-6">Documents</h2>
            
            <div className={`flex items-center justify-between border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 ${!investorPremium ? 'blur-sm select-none opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F2F2F0] dark:bg-[#333333] rounded-md flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#888888]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#222222] dark:text-white text-sm">Pitch Deck</h4>
                  <p className="text-[#888888] text-xs">Confidential PDF</p>
                </div>
              </div>
              <button 
                onClick={() => { if (investorPremium) setIsDeckModalOpen(true); }}
                className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-4 py-2 rounded-md text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors"
                disabled={!investorPremium}
              >
                View Pitch Deck
              </button>
            </div>

            {!investorPremium && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px]">
                <div className="bg-white dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-6 rounded-2xl flex flex-col items-center text-center max-w-sm shadow-xl">
                  <div className="w-12 h-12 bg-[#F2F2F0] dark:bg-[#222222] rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5 text-[#222222] dark:text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#222222] dark:text-white mb-2">Premium content</h3>
                  <p className="text-sm text-[#888888] mb-6">Pitch decks and confidential files are reserved for verified premium investors.</p>
                  <Link href="/pricing" className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] w-full py-3 rounded-full text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors">
                    Unlock with Investor Premium
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COMMUNITY COMMENTS */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] p-8 mt-12">
          <h2 className="text-xl font-bold text-[#222222] dark:text-white mb-8 border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] pb-4">
            Community &middot; {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </h2>

          {/* Comment Input */}
          {currentUser ? (
            <div className="flex gap-4 mb-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-[0.5px] border-[#e5e5e5] bg-[#222222] text-white font-bold text-sm flex-shrink-0">
                {currentProfile?.avatar_url
                  ? <img src={currentProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : getInitials(currentProfile?.full_name || currentUser.email || 'U')
                }
              </div>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  className="w-full border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 text-sm bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#222222] min-h-[100px] resize-y transition-all"
                  placeholder="Ask a question or leave feedback for the founders..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostComment(); }}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#888888]">Ctrl+Enter to post</span>
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || posting}
                    className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-5 py-2 rounded-md text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {posting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-between w-full border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl p-4 mb-10 hover:bg-[#F2F2F0] dark:hover:bg-[#333333] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F2F2F0] dark:bg-[#333333] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#888888]" />
                </div>
                <span className="text-sm text-[#888888]">Login to join the conversation</span>
              </div>
              <span className="text-sm font-bold text-[#222222] dark:text-white group-hover:underline">Login &rarr;</span>
            </Link>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-[#F2F2F0] rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#F2F2F0] rounded w-24" />
                    <div className="h-3 bg-[#F2F2F0] rounded w-full" />
                    <div className="h-3 bg-[#F2F2F0] rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#888888] text-sm">No comments yet. Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {comments.map((comment) => {
                const user = comment.users;
                const name = user?.full_name || 'Anonymous';
                const isLiked = likedComments.has(comment.id);
                return (
                  <div key={comment.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-[#F2F2F0] dark:bg-[#333333] flex items-center justify-center border-[0.5px] border-[#e5e5e5]">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" />
                        : <span className="text-[#888888] font-bold text-xs">{getInitials(name)}</span>
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-[#222222] dark:text-white text-sm">{name}</span>
                        {user?.role === 'mentor' && (
                          <span className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Mentor</span>
                        )}
                        {user?.role === 'investor' && (
                          <span className="bg-[#888888] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Investor</span>
                        )}
                        {user?.role === 'founder' && (
                          <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Founder</span>
                        )}
                        <span className="text-[#888888] text-xs ml-auto">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-[#222222] dark:text-[#cccccc] text-sm leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(comment.id, comment.likes)}
                          disabled={!currentUser}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            isLiked
                              ? 'text-red-500'
                              : 'text-[#888888] hover:text-red-500'
                          } disabled:cursor-not-allowed`}
                        >
                          <Heart className={`w-3.5 h-3.5 transition-all ${isLiked ? 'fill-red-500' : ''}`} />
                          <span>{comment.likes ?? 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pitch Deck Modal Overlay */}
      {isDeckModalOpen && pitch.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#F2F2F0] w-full max-w-6xl h-full rounded-2xl overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="bg-[#222222] px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-white font-bold text-lg">{pitch.title} - Pitch Deck</h3>
                <p className="text-[#888888] text-xs">Secure Viewer</p>
              </div>
              <button 
                onClick={() => setIsDeckModalOpen(false)}
                className="text-[#888888] hover:text-white transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow relative bg-white">
              <PitchDeckViewer 
                pitchId={pitch.id} 
                investorName={currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'Investor'} 
                investorEmail={currentUser?.email || 'investor@example.com'} 
              />
            </div>
          </div>
        </div>
      )}
      {/* Express Interest Modal Overlay */}
      {isInterestModalOpen && pitch.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl relative p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[#222222] dark:text-white font-bold text-lg">Express Interest in {pitch.title}</h3>
              <button 
                onClick={() => setIsInterestModalOpen(false)}
                className="text-[#888888] hover:text-[#222222] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Message to Founder</label>
                <textarea 
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value.slice(0, 500))}
                  placeholder="Introduce yourself and explain why you're interested in this startup..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[#e5e5e5] dark:border-[#333333] bg-[#F2F2F0] dark:bg-[#222222] text-[#222222] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all resize-none text-sm"
                />
                <div className="flex justify-between text-xs text-[#888888] mt-1.5">
                  <span>Keep it professional and concise.</span>
                  <span className={interestMessage.length >= 500 ? 'text-red-500 font-bold' : ''}>
                    {interestMessage.length}/500 chars
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setIsInterestModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border-[0.5px] border-[#e5e5e5] dark:border-[#333333] hover:bg-[#F2F2F0] dark:hover:bg-[#222222] text-sm font-bold text-[#222222] dark:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInterest}
                  disabled={sendingInterest || !interestMessage.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#222222] hover:bg-black dark:hover:bg-gray-200 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingInterest ? 'Sending...' : 'Send interest'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
