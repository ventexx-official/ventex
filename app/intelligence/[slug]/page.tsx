import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const supabase = createSupabaseAdmin();
    const { data: article } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (!article) return { title: 'Article Not Found | Ventex Intelligence' };

    return {
      title: `${article.title} | Ventex Intelligence`,
      description: article.summary,
      openGraph: {
        title: article.title,
        description: article.summary,
        type: 'article',
        publishedTime: article.published_at,
        authors: [article.source_name || 'Ventex'],
      }
    };
  } catch {
    return { title: 'Ventex Intelligence' };
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  let article: any = null;

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error || !data) {
      notFound();
    }
    article = data;
  } catch {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            image: [
              article.image_url || "https://www.ventexx.com/logo.png"
            ],
            datePublished: article.published_at,
            author: [{
                "@type": "Organization",
                name: article.source_name || "Ventex",
                url: article.source_url || "https://www.ventexx.com"
            }],
            publisher: {
              "@type": "Organization",
              name: "Ventex Intelligence",
              logo: {
                "@type": "ImageObject",
                url: "https://www.ventexx.com/logo.png"
              }
            }
          })
        }}
      />
      <Link href="/intelligence" className="text-blue-400 hover:text-blue-300 text-sm mb-8 inline-flex items-center">
        &larr; Back to Intelligence Hub
      </Link>
      
      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 font-space leading-tight">{article.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 border-b border-neutral-800 pb-6">
          <span className="font-medium text-neutral-200">{article.source_name || 'Ventex Curated'}</span>
          <span>&bull;</span>
          <time dateTime={article.published_at}>
            {new Date(article.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          
          {article.source_url && (
            <>
              <span>&bull;</span>
              <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Original Article
              </a>
            </>
          )}
        </div>
      </header>

      <div className="prose prose-invert prose-lg max-w-none prose-a:text-blue-400 hover:prose-a:text-blue-300">
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <p className="text-xl text-neutral-300 italic">{article.summary}</p>
        )}
      </div>

      {article.tags?.length > 0 && (
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-wrap gap-2">
          {article.tags.map((tag: string) => (
            <span key={tag} className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-neutral-400">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
