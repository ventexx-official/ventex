'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  ShoppingBag,
  Sparkles,
  Star,
  ArrowRight,
  Shield,
  Layers,
  AlertCircle,
  RefreshCw,
  Presentation,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/ui-kit/DashboardShell';
import { ENABLE_PUBLIC_PITCH_PAGE } from '@/lib/brand';

interface PitchItem {
  id: string;
  title: string;
  tagline: string | null;
  stage: string | null;
  logo_url: string | null;
  founder_name: string | null;
  ai_score: number | null;
  rating_avg: number;
  rating_count: number;
  combined_score: number;
}

interface ProductItem {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  product_type: string;
  image_urls: string[];
}

export default function ExplorerHomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [pitches, setPitches] = useState<PitchItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?next=/explorer');
        return;
      }
      const uid = session.user.id;

      // 1. Fetch Profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (profErr) throw profErr;
      if (prof.role !== 'visitor' && prof.role !== 'admin') {
        // Redirection to assigned dashboard
        router.replace('/discover');
        return;
      }
      setProfile(prof);

      // 2. Fetch Trending Pitches (up to 6 from discover_pitches)
      const { data: pData } = await supabase
        .from('discover_pitches')
        .select('id, title, tagline, stage, logo_url, founder_name, ai_score, rating_avg, rating_count, combined_score')
        .order('combined_score', { ascending: false })
        .limit(6);

      setPitches(pData || []);

      // 3. Fetch Fresh Products (up to 4 live)
      const { data: prodData } = await supabase
        .from('products')
        .select('id, name, price, currency, product_type, image_urls')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(4);

      setProducts(prodData || []);
    } catch (err: any) {
      console.error('Error loading explorer home:', err);
      setError(err.message || 'Failed to load explorer home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const firstName = profile?.display_name ? profile.display_name.split(' ')[0] : 'Explorer';

  return (
    <DashboardShell role="visitor">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-[var(--line)]/50 pb-6">
          <h1 className="text-2xl sm:text-3xl font-mono uppercase tracking-tight text-[var(--paper)]">
            Welcome, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--smoke)] mt-1">
            Discover emerging startups, track top-ranked concepts, and explore new tools in the ecosystem.
          </p>
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

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-44 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Ready to Build, Back or Buy? (Role Upgrade explanation card) */}
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--red)]" />
                  Ready to build, back or buy?
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--line)]/30 text-[var(--smoke)]">
                  Role upgrades are coming soon
                </span>
              </div>
              <p className="text-xs text-[var(--smoke)] leading-relaxed max-w-2xl">
                As an Explorer, you can freely browse live pitches and marketplace assets. When role upgrades open, you will be able to switch into dedicated workspaces:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[var(--ink)]/40 border border-[var(--line)]/50 space-y-1.5 text-xs font-mono">
                  <div className="font-semibold text-[var(--paper)]">Founder</div>
                  <p className="text-[11px] text-[var(--smoke)] leading-relaxed">
                    Pitch ideas, build traction, generate AI scores, and raise funding from angels.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--ink)]/40 border border-[var(--line)]/50 space-y-1.5 text-xs font-mono">
                  <div className="font-semibold text-[var(--paper)]">Investor</div>
                  <p className="text-[11px] text-[var(--smoke)] leading-relaxed">
                    Access deep pitch decks, review metrics, and initiate funding expressions.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--ink)]/40 border border-[var(--line)]/50 space-y-1.5 text-xs font-mono">
                  <div className="font-semibold text-[var(--paper)]">Buyer</div>
                  <p className="text-[11px] text-[var(--smoke)] leading-relaxed">
                    Source developer tools, acquire startup assets, and coordinate delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Trending Pitches */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Trending Pitches
                </h2>
                <Link
                  href="/discover"
                  className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px] flex items-center gap-1"
                >
                  <span>Explore all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {pitches.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card)]/40">
                  <Presentation className="w-10 h-10 text-[var(--smoke)] mx-auto mb-3 opacity-60" />
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] mb-1">
                    No trending pitches yet
                  </h3>
                  <p className="text-xs text-[var(--smoke)] max-w-sm mx-auto">
                    Live pitches will show here as soon as founders publish them.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pitches.map((pitch) => {
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

                          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--smoke)]">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>{pitch.ai_score ? `${pitch.ai_score}/100` : 'Not scored'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>
                                {pitch.rating_count > 0 ? `${pitch.rating_avg}` : 'No ratings'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[var(--line)]/50 text-[11px] font-mono text-[var(--smoke)]">
                          Founder: {pitch.founder_name || 'Founder'}
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

            {/* Fresh in Marketplace */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[var(--smoke)]" />
                  Fresh in the Marketplace
                </h2>
                <Link
                  href="/marketplace"
                  className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px] flex items-center gap-1"
                >
                  <span>View marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/marketplace/${prod.id}`}
                    className="p-4 rounded-xl bg-[var(--card)] border border-[var(--line)] hover:border-[var(--red)] transition-colors flex flex-col justify-between gap-3"
                  >
                    {prod.image_urls?.[0] ? (
                      <img
                        src={prod.image_urls[0]}
                        alt={prod.name}
                        className="w-full h-32 rounded-lg object-cover border border-[var(--line)]"
                      />
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-mono text-sm font-bold text-[var(--paper)]">
                        {prod.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--paper)] truncate">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] font-mono text-[var(--smoke)] uppercase block mt-0.5">
                        {prod.product_type}
                      </span>
                      <div className="text-xs font-mono font-bold text-[var(--paper)] mt-1">
                        {prod.price ? `$${prod.price}` : 'Contact for pricing'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
