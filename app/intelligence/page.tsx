import Link from 'next/link';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { TrendingUp, Sparkles, Newspaper, Rocket, Target, Zap } from 'lucide-react';

export const metadata = {
  title: 'Ventex Intelligence | Startup News, Funding & Insights',
  description: 'Curated news, founder stories, funding rounds, and growth insights for the startup ecosystem.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IntelligencePage() {
  let articles: any[] = [];

  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(30);
    articles = data || [];
  } catch (e) {
    // Admin client unavailable (placeholder key) — render empty state gracefully
    console.warn('[intelligence] Admin client unavailable, rendering empty state');
  }

  const heroArticle = articles[0];
  const trendingArticles = articles.slice(1, 5);
  const latestFunding = articles.filter(a => a.tags?.includes('funding')).slice(0, 4);
  const otherArticles = articles.filter(a => a.id !== heroArticle?.id && !trendingArticles.find((t: any) => t.id === a.id));

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Premium Hero Header */}
      <header className="border-b bg-[var(--bg2)] py-16" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">
              Ventex Hub
            </div>
          </div>
          <h1 className="text-[clamp(40px,5vw,72px)] font-black tracking-tighter text-[var(--text)] mb-6">
            Ventex <span className="text-[var(--text2)]">Intelligence</span>
          </h1>
          <p className="max-w-2xl text-xl text-[var(--text2)] leading-relaxed">
            The single source of truth for global startup funding, operator insights, product launches, and founder stories.
          </p>
        </div>
      </header>

      {articles.length === 0 && (
        <div className="mx-auto max-w-7xl px-4 mt-8">
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-semibold">
            Unable to connect to the Intelligence Database.
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-12 space-y-20">
        
        {/* Top Story & Trending Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {heroArticle ? (
            <div className="lg:col-span-2">
              <div className="mono text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Top Story
              </div>
              <Link href={`/intelligence/${heroArticle.slug}`} className="group block">
                <div className="aspect-video bg-[var(--bg2)] rounded-3xl border mb-6 overflow-hidden relative" style={{ borderColor: 'var(--border)' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  {heroArticle.image_url ? (
                    <img src={heroArticle.image_url} alt={heroArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text3)]">
                      <Newspaper className="w-16 h-16 opacity-20" />
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="flex gap-2 mb-3">
                      {heroArticle.tags?.slice(0,2).map((t: string) => (
                        <span key={t} className="text-[10px] font-bold uppercase tracking-widest bg-[var(--bg)]/80 backdrop-blur text-[var(--text)] px-3 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">
                      {heroArticle.title}
                    </h2>
                  </div>
                </div>
                <p className="text-lg text-[var(--text2)] line-clamp-2 leading-relaxed">
                  {heroArticle.summary}
                </p>
              </Link>
            </div>
          ) : null}

          <div>
            <div className="mono text-[11px] font-bold uppercase tracking-widest text-[var(--text3)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Trending Now
            </div>
            <div className="flex flex-col gap-6">
              {trendingArticles.map((article, i) => (
                <Link href={`/intelligence/${article.slug}`} key={article.id} className="group flex gap-4 items-start">
                  <div className="text-3xl font-black text-[var(--border)] group-hover:text-[var(--text3)] transition-colors">
                    0{i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--text2)] transition-colors leading-snug mb-2">
                      {article.title}
                    </h3>
                    <div className="text-xs font-semibold text-[var(--text3)]">
                      {new Date(article.published_at).toLocaleDateString()} · {article.source_name || 'Ventex'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Funding Rounds */}
        {latestFunding.length > 0 && (
          <section className="bg-[var(--bg2)] rounded-3xl border p-8" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Latest Funding</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestFunding.map(article => (
                <Link href={`/intelligence/${article.slug}`} key={article.id} className="block group">
                  <div className="text-sm font-bold text-[var(--text2)] mb-2">{new Date(article.published_at).toLocaleDateString()}</div>
                  <h3 className="font-bold text-[var(--text)] group-hover:text-blue-500 transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* The Feed */}
        <section>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3">
            <Target className="w-6 h-6 text-[var(--text3)]" /> The Feed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((article) => (
              <Link 
                href={`/intelligence/${article.slug}`} 
                key={article.id}
                className="group flex flex-col"
              >
                <div className="aspect-[4/3] rounded-2xl bg-[var(--bg2)] border mb-4 overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {article.image_url ? (
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text3)]">
                      <Rocket className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] bg-[var(--bg2)] px-2 py-1 rounded">
                    {article.source_name || 'Ventex'}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text3)]">
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--text2)] transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-[var(--text2)] line-clamp-2 flex-1">
                  {article.summary}
                </p>
              </Link>
            ))}
          </div>
          
          {otherArticles.length === 0 && (
             <div className="text-center py-20 text-[var(--text3)] font-semibold text-sm">
               You're all caught up! No more articles available.
             </div>
          )}
        </section>

      </main>
    </div>
  );
}
