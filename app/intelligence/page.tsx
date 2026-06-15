import Link from 'next/link';
import { createSupabaseAdmin } from '@/lib/supabase-admin';

export const metadata = {
  title: 'Ventex Intelligence | Startup News & Insights',
  description: 'Curated news, founder stories, and insights for the startup ecosystem.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function IntelligencePage() {
  const supabase = createSupabaseAdmin();
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-space">Ventex Intelligence</h1>
        <p className="text-xl text-neutral-400">Curated news, founder stories, and insights for the startup ecosystem.</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8">
          Unable to load recent articles.
        </div>
      )}

      {!articles?.length && !error ? (
        <div className="text-center py-20 text-neutral-500">
          <p>No articles available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.map((article) => (
            <Link 
              href={`/intelligence/${article.slug}`} 
              key={article.id}
              className="group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-300 flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono px-2 py-1 bg-neutral-800 rounded text-neutral-300">
                    {article.source_name || 'Ventex'}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-neutral-400 line-clamp-3 mb-4 flex-1">
                  {article.summary}
                </p>
                
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {article.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs text-neutral-500">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
