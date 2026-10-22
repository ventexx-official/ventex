'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Presentation,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  Star,
  ShoppingBag,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import FounderGuard from '@/components/FounderGuard';
import { DashboardShell } from '@/components/ui-kit/DashboardShell';
import { ENABLE_PUBLIC_PITCH_PAGE, ENABLE_AI_MENTOR } from '@/lib/brand';
import { Pitch, PitchScore, PitchRating, FundingInterest, Product } from '@/lib/types/pitch';

function getGreeting(name?: string | null) {
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17) timeOfDay = 'evening';

  const firstName = name ? name.split(' ')[0] : 'Founder';
  return `Good ${timeOfDay}, ${firstName}`;
}

const CORE_FIELDS = [
  'title',
  'tagline',
  'industry',
  'stage',
  'problem',
  'solution',
  'target_customer',
  'market_size',
  'business_model',
  'traction',
  'team',
  'use_of_funds',
];

function calculateCompleteness(pitch: Pitch) {
  let count = 0;
  CORE_FIELDS.forEach((f) => {
    if ((pitch as any)[f] && String((pitch as any)[f]).trim().length > 0) {
      count++;
    }
  });
  return Math.round((count / CORE_FIELDS.length) * 100);
}

export default function FounderDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [scores, setScores] = useState<Record<string, PitchScore>>({});
  const [fundingInterests, setFundingInterests] = useState<any[]>([]);
  const [ratingsCount, setRatingsCount] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<{ live: number; draft: number; total: number }>({
    live: 0,
    draft: 0,
    total: 0,
  });
  const [recentVersions, setRecentVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const uid = session.user.id;

      // 1. Fetch Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      setProfile(prof);

      // 2. Fetch Pitches (newest first)
      const { data: pitchList, error: pitchErr } = await supabase
        .from('pitches')
        .select('*')
        .eq('founder_id', uid)
        .order('created_at', { ascending: false });

      if (pitchErr) throw pitchErr;
      const safePitches = pitchList || [];
      setPitches(safePitches);

      const pitchIds = safePitches.map((p) => p.id);

      if (pitchIds.length > 0) {
        // 3. Fetch Scores for pitches
        const { data: scoreList } = await supabase
          .from('pitch_scores')
          .select('*')
          .in('pitch_id', pitchIds);

        const scoreMap: Record<string, PitchScore> = {};
        (scoreList || []).forEach((s) => {
          scoreMap[s.pitch_id] = s;
        });
        setScores(scoreMap);

        // 4. Fetch Ratings on my pitches
        const { data: ratingList } = await supabase
          .from('pitch_ratings')
          .select('stars, pitch_id')
          .in('pitch_id', pitchIds);

        const safeRatings = ratingList || [];
        setRatingsCount(safeRatings.length);
        if (safeRatings.length > 0) {
          const sum = safeRatings.reduce((acc, curr) => acc + curr.stars, 0);
          setAvgRating(parseFloat((sum / safeRatings.length).toFixed(1)));
        } else {
          setAvgRating(null);
        }

        // 5. Fetch Comments Count on my pitches
        const { count: commCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .in('pitch_id', pitchIds);
        setCommentsCount(commCount || 0);

        // 6. Fetch Funding Interests on my pitches
        const { data: interests } = await supabase
          .from('funding_interests')
          .select('id, pitch_id, investor_id, message, created_at')
          .in('pitch_id', pitchIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (interests && interests.length > 0) {
          const investorIds = Array.from(new Set(interests.map((i) => i.investor_id)));
          const { data: investors } = await supabase
            .from('public_profiles')
            .select('id, display_name, avatar_url, headline')
            .in('id', investorIds);

          const invMap = new Map((investors || []).map((inv) => [inv.id, inv]));
          const pMap = new Map(safePitches.map((p) => [p.id, p.title]));

          const enriched = interests.map((item) => ({
            ...item,
            investor: invMap.get(item.investor_id),
            pitch_title: pMap.get(item.pitch_id) || 'Pitch',
          }));
          setFundingInterests(enriched);
        } else {
          setFundingInterests([]);
        }

        // 7. Recent Versions for the most recently updated pitch
        const mostRecentPitch = safePitches[0];
        if (mostRecentPitch) {
          const { data: verList } = await supabase
            .from('pitch_versions')
            .select('id, version_number, created_at')
            .eq('pitch_id', mostRecentPitch.id)
            .order('version_number', { ascending: false })
            .limit(5);

          setRecentVersions(verList || []);
        }
      } else {
        setScores({});
        setFundingInterests([]);
        setRatingsCount(0);
        setAvgRating(null);
        setCommentsCount(0);
        setRecentVersions([]);
      }

      // 8. Marketplace Products Count
      const { data: prods } = await supabase
        .from('products')
        .select('id, status')
        .eq('seller_id', uid);

      if (prods) {
        const live = prods.filter((p) => p.status === 'live').length;
        const draft = prods.filter((p) => p.status === 'draft').length;
        setProductsCount({ live, draft, total: prods.length });
      }
    } catch (err: any) {
      console.error('Error loading founder dashboard:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [router]);

  // Derived Overview Stats
  const privateCount = pitches.filter((p) => p.status === 'draft').length;
  const publicCount = pitches.filter((p) => p.status === 'live').length;
  const totalVersions = pitches.reduce((acc, p) => acc + (p.current_version || 1), 0);

  // Road to Funding Checklist for the most recent pitch
  const latestPitch = pitches[0] || null;
  const checklistSteps = [
    {
      title: 'Write the basics',
      desc: 'Title, tagline, industry and stage',
      done: !!(
        latestPitch?.title &&
        latestPitch?.tagline &&
        latestPitch?.industry &&
        latestPitch?.stage
      ),
      link: latestPitch ? `/founder/pitches/${latestPitch.id}` : '/founder/pitches/new',
    },
    {
      title: 'Complete all 12 sections',
      desc: 'Fill problem, market, business, team & use of funds',
      done: latestPitch ? calculateCompleteness(latestPitch) === 100 : false,
      link: latestPitch ? `/founder/pitches/${latestPitch.id}` : '/founder/pitches/new',
    },
    {
      title: 'Add a pitch deck',
      desc: 'Upload a PDF or PPTX deck',
      done: !!latestPitch?.pitch_deck_path,
      link: latestPitch ? `/founder/pitches/${latestPitch.id}` : '/founder/pitches/new',
    },
    {
      title: 'Add a website or demo video',
      desc: 'Provide an interactive preview',
      done: !!(latestPitch?.website_url || latestPitch?.demo_video_url),
      link: latestPitch ? `/founder/pitches/${latestPitch.id}` : '/founder/pitches/new',
    },
    {
      title: 'Publish to marketplace',
      desc: 'Make your pitch live for discovery',
      done: latestPitch?.status === 'live',
      link: latestPitch ? `/founder/pitches/${latestPitch.id}` : '/founder/pitches/new',
    },
    {
      title: 'Get your first rating',
      desc: 'Receive community & investor feedback',
      done: ratingsCount > 0,
      link: latestPitch ? `/founder/pitches/${latestPitch.id}` : '/founder/pitches/new',
    },
    {
      title: 'Get your first investor interest',
      desc: 'Receive direct funding inquiries',
      done: fundingInterests.length > 0,
      link: '#investor-interests',
    },
  ];

  const firstPendingIndex = checklistSteps.findIndex((s) => !s.done);

  return (
    <FounderGuard>
      <DashboardShell role="founder">
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-mono uppercase tracking-tight text-[var(--paper)]">
                {getGreeting(profile?.display_name)}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--smoke)] mt-1">
                Manage your pitches, track investor responses, and prepare your startup for funding.
              </p>
            </div>
            <Link
              href="/founder/pitches/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors min-h-[44px] cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Pitch
            </Link>
          </div>

          {/* Error Alert with Retry */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadDashboardData}
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
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-24 animate-pulse"
                  />
                ))}
              </div>
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-64 animate-pulse" />
            </div>
          )}

          {!loading && (
            <>
              {/* 1. Overview Tiles (2 cols on mobile) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Pitches */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
                    Pitches
                  </span>
                  <div className="mt-2">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--paper)]">
                      {pitches.length}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                      {privateCount} private, {publicCount} public
                    </span>
                  </div>
                </div>

                {/* Versions */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
                    Versions Saved
                  </span>
                  <div className="mt-2">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--paper)]">
                      {totalVersions}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                      Across all pitches
                    </span>
                  </div>
                </div>

                {/* Investor Interest */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
                    Investor Interests
                  </span>
                  <div className="mt-2">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--paper)]">
                      {fundingInterests.length}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                      Expressions received
                    </span>
                  </div>
                </div>

                {/* Ratings */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
                    Average Rating
                  </span>
                  <div className="mt-2">
                    {avgRating !== null ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--paper)]">
                          {avgRating}
                        </span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-mono text-[var(--smoke)]">
                          ({ratingsCount})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[var(--smoke)] block mt-1">
                        No ratings yet
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                      Community feedback
                    </span>
                  </div>
                </div>

                {/* Comments */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col justify-between col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
                    Comments
                  </span>
                  <div className="mt-2">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--paper)]">
                      {commentsCount}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                      Feedback received
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. My Pitches Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-[var(--red)]" />
                    My Pitches
                  </h2>
                  <Link
                    href="/founder/pitches/new"
                    className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px] flex items-center gap-1"
                  >
                    <span>Create new</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {pitches.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card)]/40">
                    <Presentation className="w-10 h-10 text-[var(--smoke)] mx-auto mb-3 opacity-60" />
                    <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] mb-1">
                      Plant your first seed
                    </h3>
                    <p className="text-xs text-[var(--smoke)] max-w-sm mx-auto mb-5 leading-relaxed">
                      Write your first pitch. Fill out the basics, build traction, and share it with investors.
                    </p>
                    <Link
                      href="/founder/pitches/new"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-mono font-medium bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors min-h-[44px]"
                    >
                      New pitch
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pitches.map((pitch) => {
                      const score = scores[pitch.id];
                      const compPercent = calculateCompleteness(pitch);
                      const savedDateStr = new Date(pitch.last_saved_at || pitch.updated_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <div
                          key={pitch.id}
                          className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col justify-between gap-4 transition-colors hover:border-[var(--line)]/80"
                        >
                          <div>
                            {/* Card Top: Logo/Initial + Status */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {pitch.logo_url ? (
                                  <img
                                    src={pitch.logo_url}
                                    alt={pitch.title}
                                    className="w-10 h-10 rounded-xl object-cover border border-[var(--line)] shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center text-sm font-mono font-bold text-[var(--paper)] shrink-0">
                                    {pitch.title ? pitch.title.charAt(0).toUpperCase() : 'P'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-[var(--paper)] truncate">
                                    {pitch.title}
                                  </h3>
                                  <span className="text-[10px] font-mono text-[var(--smoke)]">
                                    v{pitch.current_version} saved {savedDateStr}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                                  pitch.status === 'live'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : pitch.status === 'removed'
                                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                    : 'bg-line/20 text-[var(--smoke)] border-line/40'
                                }`}
                              >
                                {pitch.status === 'live'
                                  ? 'Public'
                                  : pitch.status === 'removed'
                                  ? 'Removed'
                                  : 'Private'}
                              </span>
                            </div>

                            {/* Tagline */}
                            <p className="text-xs text-[var(--paper-dim)] line-clamp-2 leading-relaxed mb-3">
                              {pitch.tagline || 'No tagline provided yet.'}
                            </p>

                            {/* Completeness Bar */}
                            <div className="space-y-1 mb-3">
                              <div className="flex justify-between text-[10px] font-mono uppercase text-[var(--smoke)]">
                                <span>Completeness</span>
                                <span>{compPercent}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[var(--ink)] overflow-hidden">
                                <div
                                  className="h-full bg-[var(--red)] rounded-full"
                                  style={{ width: `${compPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* AI Score */}
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--smoke)]">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>AI Score:</span>
                              {score ? (
                                <span className="font-semibold text-[var(--paper)]">
                                  {score.overall}/100
                                </span>
                              ) : (
                                <span>Not scored yet</span>
                              )}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--line)]/50">
                            <Link
                              href={`/founder/pitches/${pitch.id}`}
                              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[var(--paper)] hover:text-[var(--red)] transition-colors min-h-[44px]"
                            >
                              <span>Continue editing</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>

                            {ENABLE_PUBLIC_PITCH_PAGE && pitch.status === 'live' ? (
                              <Link
                                href={`/pitch/${pitch.id}`}
                                className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline min-h-[44px]"
                              >
                                <span>View public page</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-[10px] font-mono text-[var(--smoke)] italic">
                                Public page coming soon
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 3. Road to Funding Checklist (if pitch exists) */}
              {latestPitch && (
                <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)]">
                        Road to Funding: {latestPitch.title}
                      </h2>
                      <p className="text-xs text-[var(--smoke)] mt-0.5">
                        Follow the roadmap to optimize your venture for discovery and funding.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {checklistSteps.map((step, idx) => {
                      const isNextStep = idx === firstPendingIndex;

                      return (
                        <div
                          key={step.title}
                          className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs font-mono transition-colors ${
                            step.done
                              ? 'bg-[var(--ink)]/40 border-[var(--line)]/50 text-[var(--smoke)]'
                              : isNextStep
                              ? 'bg-red-500/10 border-[var(--red)]/50 text-[var(--paper)] shadow-sm'
                              : 'bg-[var(--card)] border-[var(--line)] text-[var(--smoke)]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] uppercase font-bold text-[var(--smoke)]">
                                Step {idx + 1}
                              </span>
                              {step.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : isNextStep ? (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[var(--red)] text-white font-bold">
                                  Next Step
                                </span>
                              ) : null}
                            </div>
                            <h3 className="font-semibold text-xs text-[var(--paper)] mb-1">
                              {step.title}
                            </h3>
                            <p className="text-[11px] text-[var(--smoke)] leading-relaxed">
                              {step.desc}
                            </p>
                          </div>

                          {!step.done && (
                            <Link
                              href={step.link}
                              className={`inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 min-h-[36px] ${
                                isNextStep ? 'text-[var(--red)] hover:underline' : 'text-[var(--smoke)] hover:text-[var(--paper)]'
                              }`}
                            >
                              <span>Take action</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 4. Bottom Grid: Investor Interest + Version Timeline + Marketplace + AI Mentor + Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Investor Interest Card */}
                <div
                  id="investor-interests"
                  className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-3">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Investor Interest
                    </h2>
                    <span className="text-xs font-mono text-[var(--smoke)]">
                      {fundingInterests.length} total
                    </span>
                  </div>

                  {fundingInterests.length === 0 ? (
                    <div className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
                      No investor has expressed interest yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fundingInterests.map((interest) => (
                        <div
                          key={interest.id}
                          className="p-3.5 rounded-xl bg-[var(--ink)]/50 border border-[var(--line)]/60 space-y-2 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {interest.investor?.avatar_url ? (
                                <img
                                  src={interest.investor.avatar_url}
                                  alt={interest.investor.display_name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[10px] text-[var(--paper)]">
                                  {interest.investor?.display_name ? interest.investor.display_name.charAt(0) : 'I'}
                                </div>
                              )}
                              <span className="font-semibold text-[var(--paper)]">
                                {interest.investor?.display_name || 'Anonymous Investor'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--smoke)]">
                              {new Date(interest.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--smoke)]">
                            Pitch: <span className="text-[var(--paper)]">{interest.pitch_title}</span>
                          </div>
                          {interest.message && (
                            <p className="text-[11px] text-[var(--paper-dim)] bg-[var(--card)]/60 p-2 rounded-lg italic">
                              "{interest.message}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Version Timeline Card */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-3">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--smoke)]" />
                      Version Timeline
                    </h2>
                    {latestPitch && (
                      <Link
                        href={`/founder/pitches/${latestPitch.id}`}
                        className="text-xs font-mono text-[var(--red)] hover:underline min-h-[44px] flex items-center"
                      >
                        Open history
                      </Link>
                    )}
                  </div>

                  {recentVersions.length === 0 ? (
                    <div className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
                      No versions recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentVersions.map((ver) => (
                        <div
                          key={ver.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ink)]/40 border border-[var(--line)]/40 text-xs font-mono"
                        >
                          <span className="font-semibold text-[var(--paper)]">
                            Version {ver.version_number}
                          </span>
                          <span className="text-[10px] text-[var(--smoke)]">
                            {new Date(ver.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Marketplace Card */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-3">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[var(--smoke)]" />
                      Marketplace Products
                    </h2>
                    <span className="text-xs font-mono text-[var(--smoke)]">
                      {productsCount.total} total
                    </span>
                  </div>

                  <div className="flex items-center gap-6 py-2">
                    <div>
                      <div className="text-xl font-mono font-bold text-[var(--paper)]">
                        {productsCount.live}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 uppercase">Live Listings</div>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-[var(--paper)]">
                        {productsCount.draft}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--smoke)] uppercase">Drafts</div>
                    </div>
                  </div>

                  <Link
                    href="/founder/store"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-mono font-medium bg-[var(--card)] border border-[var(--line)] hover:border-[var(--red)] transition-colors text-[var(--paper)] min-h-[44px]"
                  >
                    <span>Manage store & listings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* AI Mentor & Messages Cards */}
                <div className="space-y-4">
                  {/* Messages Card */}
                  <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-2">
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
                      Talk directly with investors. Coming soon.
                    </p>
                  </div>

                  {/* AI Mentor Card */}
                  <div className="p-5 rounded-2xl bg-[var(--card)] border border-dashed border-[var(--line)] space-y-2 text-center">
                    <Sparkles className="w-5 h-5 text-[var(--smoke)] mx-auto opacity-70" />
                    <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--smoke)]">
                      AI Mentor
                    </h2>
                    <p className="text-xs text-[var(--smoke)]">AI mentor, coming soon</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardShell>
    </FounderGuard>
  );
}
