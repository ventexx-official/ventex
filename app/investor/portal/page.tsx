'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Star,
  Compass,
  MessageSquare,
  ArrowRight,
  Trash2,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Presentation,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/ui-kit/DashboardShell';
import { ENABLE_PUBLIC_PITCH_PAGE, ENABLE_MESSAGING } from '@/lib/brand';

interface TopPitch {
  id: string;
  title: string;
  tagline: string | null;
  industry: string | null;
  stage: string | null;
  logo_url: string | null;
  founder_name: string | null;
  ai_score: number | null;
  rating_avg: number;
  rating_count: number;
  combined_score: number;
}

interface MyInterest {
  id: string;
  pitch_id: string;
  message: string | null;
  created_at: string;
  pitch_title?: string;
}

export default function InvestorPortalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [topPitches, setTopPitches] = useState<TopPitch[]>([]);
  const [interests, setInterests] = useState<MyInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?next=/investor/portal');
        return;
      }
      const uid = session.user.id;

      // Check role
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (profErr) throw profErr;
      if (prof.role !== 'investor' && prof.role !== 'admin') {
        router.replace('/discover');
        return;
      }
      setProfile(prof);

      // 1. Fetch Top 6 Pitches from discover_pitches view
      const { data: pitchesData, error: pErr } = await supabase
        .from('discover_pitches')
        .select('id, title, tagline, industry, stage, logo_url, founder_name, ai_score, rating_avg, rating_count, combined_score')
        .order('combined_score', { ascending: false })
        .limit(6);

      if (pErr) console.warn('Could not load discover_pitches:', pErr.message);
      setTopPitches(pitchesData || []);

      // 2. Fetch My Funding Interests
      const { data: interestData, error: iErr } = await supabase
        .from('funding_interests')
        .select('id, pitch_id, message, created_at')
        .eq('investor_id', uid)
        .order('created_at', { ascending: false });

      if (iErr) throw iErr;

      if (interestData && interestData.length > 0) {
        const pIds = Array.from(new Set(interestData.map((i) => i.pitch_id)));
        const { data: pTitles } = await supabase
          .from('pitches')
          .select('id, title')
          .in('id', pIds);

        const pMap = new Map((pTitles || []).map((p) => [p.id, p.title]));
        const combined = interestData.map((item) => ({
          ...item,
          pitch_title: pMap.get(item.pitch_id) || 'Pitch',
        }));
        setInterests(combined);
      } else {
        setInterests([]);
      }
    } catch (err: any) {
      console.error('Error loading investor portal:', err);
      setError(err.message || 'Failed to load investor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleWithdrawInterest = async (interestId: string) => {
    if (!confirm('Withdraw your expression of funding interest? This will remove your message to the founder.')) {
      return;
    }

    try {
      setDeletingId(interestId);
      const { error: delErr } = await supabase
        .from('funding_interests')
        .delete()
        .eq('id', interestId);

      if (delErr) throw delErr;
      setInterests((prev) => prev.filter((i) => i.id !== interestId));
    } catch (err: any) {
      alert(err.message || 'Could not withdraw interest');
    } finally {
      setDeletingId(null);
    }
  };

  const firstName = profile?.display_name ? profile.display_name.split(' ')[0] : 'Investor';

  // Profile completeness check
  const profileComplete = Boolean(
    profile?.display_name && profile?.headline && profile?.bio && profile?.country
  );

  return (
    <DashboardShell role="investor">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-mono uppercase tracking-tight text-[var(--paper)]">
              Welcome, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--smoke)] mt-1">
              Explore high-conviction startups, manage active interest, and track your deal pipeline.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors min-h-[44px] cursor-pointer shadow-sm"
          >
            <Compass className="w-4 h-4" />
            Browse all pitches
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-xs font-mono flex items-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-32 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-44 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Profile Summary Card */}
            <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Investor'}
                    className="w-12 h-12 rounded-full object-cover border border-[var(--line)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-mono text-sm font-bold text-[var(--paper)]">
                    {firstName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--paper)]">
                    {profile?.display_name || 'Investor Profile'}
                  </h3>
                  <p className="text-xs text-[var(--smoke)] font-mono">
                    {profile?.headline || profile?.company || 'Accredited Investor'}
                  </p>
                  {!profileComplete && (
                    <span className="text-[11px] text-amber-400 font-mono block mt-0.5">
                      Hint: Complete your bio and investment focus to build founder trust.
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-mono border border-[var(--line)] hover:border-[var(--red)] transition-colors text-[var(--paper)] min-h-[44px]"
              >
                Edit profile
              </Link>
            </div>

            {/* Top Pitches Right Now */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Top Pitches Right Now
                </h2>
                <Link
                  href="/discover"
                  className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px] flex items-center gap-1"
                >
                  <span>Explore all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {topPitches.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card)]/40">
                  <Presentation className="w-10 h-10 text-[var(--smoke)] mx-auto mb-3 opacity-60" />
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] mb-1">
                    No live pitches available
                  </h3>
                  <p className="text-xs text-[var(--smoke)] max-w-sm mx-auto">
                    When founders publish live pitch decks, they will be ranked and displayed here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topPitches.map((pitch) => {
                    const cardContent = (
                      <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col justify-between gap-3 h-full transition-colors hover:border-[var(--line)]/80">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {pitch.logo_url ? (
                                <img
                                  src={pitch.logo_url}
                                  alt={pitch.title}
                                  className="w-8 h-8 rounded-lg object-cover border border-[var(--line)] shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center text-xs font-mono font-bold text-[var(--paper)] shrink-0">
                                  {pitch.title.charAt(0)}
                                </div>
                              )}
                              <h3 className="text-xs font-semibold text-[var(--paper)] truncate">
                                {pitch.title}
                              </h3>
                            </div>
                            {pitch.stage && (
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--ink)] border border-[var(--line)] text-[var(--smoke)] shrink-0">
                                {pitch.stage}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[var(--paper-dim)] line-clamp-2 leading-relaxed mb-3">
                            {pitch.tagline || 'No tagline provided.'}
                          </p>

                          {/* Scores & Ratings */}
                          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--smoke)]">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>{pitch.ai_score ? `${pitch.ai_score}/100` : 'Not scored yet'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>
                                {pitch.rating_count > 0
                                  ? `${pitch.rating_avg} (${pitch.rating_count})`
                                  : 'No ratings yet'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[var(--line)]/50 flex items-center justify-between text-[11px] font-mono text-[var(--smoke)]">
                          <span>By {pitch.founder_name || 'Founder'}</span>
                          {pitch.industry && <span>{pitch.industry}</span>}
                        </div>
                      </div>
                    );

                    if (ENABLE_PUBLIC_PITCH_PAGE) {
                      return (
                        <Link key={pitch.id} href={`/pitch/${pitch.id}`} className="block h-full cursor-pointer">
                          {cardContent}
                        </Link>
                      );
                    }
                    return <div key={pitch.id} className="h-full">{cardContent}</div>;
                  })}
                </div>
              )}
            </section>

            {/* My Funding Interests & Messages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* My Funding Interests */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-3">
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)]">
                    My Funding Interests
                  </h2>
                  <span className="text-xs font-mono text-[var(--smoke)]">
                    {interests.length} submitted
                  </span>
                </div>

                {interests.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
                    You have not expressed interest in any pitches yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interests.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-[var(--ink)]/50 border border-[var(--line)] space-y-2 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[var(--paper)]">
                            {item.pitch_title}
                          </span>
                          <span className="text-[10px] text-[var(--smoke)]">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {item.message && (
                          <p className="text-[11px] text-[var(--paper-dim)] bg-[var(--card)]/60 p-2 rounded-lg italic">
                            "{item.message}"
                          </p>
                        )}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleWithdrawInterest(item.id)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors min-h-[32px] cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            <span>Withdraw interest</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages Coming Soon Card */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-3 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--smoke)]" />
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)]">
                    Messages
                  </h2>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--line)] text-[var(--smoke)]">
                    Soon
                  </span>
                </div>
                <p className="text-xs text-[var(--smoke)] leading-relaxed">
                  Talk directly with founders. Coming soon.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
