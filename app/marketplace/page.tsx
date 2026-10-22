import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Product type badge colors
function getTypeBadge(type: string) {
  if (type === 'software') return { label: 'Software', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  if (type === 'hardware') return { label: 'Hardware', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  return { label: type, cls: 'bg-line/20 text-[var(--paper-dim)] border-line' };
}

function formatPrice(price: number | null, currency: string) {
  if (price === null || price === undefined) return 'Contact seller';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price);
}

// ─── Skeleton component (server-renderable via CSS) ───────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-line rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-[var(--ink)]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-[var(--ink)] rounded w-2/3" />
        <div className="h-4 bg-[var(--ink)] rounded w-full" />
        <div className="h-3 bg-[var(--ink)] rounded w-1/2" />
      </div>
    </div>
  );
}

export const revalidate = 60; // ISR: rebuild page every 60 seconds

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; category?: string; page?: string };
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const q = searchParams.q?.trim() || '';
  const typeFilter = searchParams.type || '';
  const categoryFilter = searchParams.category || '';
  const page = parseInt(searchParams.page || '1', 10);
  const PER_PAGE = 12;
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let query = supabase
    .from('products')
    .select('id, name, description, product_type, category, price, currency, image_urls, seller_id, created_at', { count: 'exact' })
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  if (typeFilter && typeFilter !== 'all') query = query.eq('product_type', typeFilter);
  if (categoryFilter && categoryFilter !== 'all') query = query.eq('category', categoryFilter);

  const { data: products, count } = await query;

  // Get distinct categories for filter pills
  const { data: catRows } = await supabase
    .from('products')
    .select('category')
    .eq('status', 'live')
    .not('category', 'is', null);

  const categories: string[] = Array.from(new Set((catRows || []).map((r: any) => r.category).filter(Boolean))).sort();

  // Get seller names from public_profiles
  const sellerIds = Array.from(new Set((products || []).map((p: any) => p.seller_id)));
  let sellersMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
  if (sellerIds.length > 0) {
    const { data: sellers } = await supabase
      .from('public_profiles')
      .select('id, display_name, avatar_url')
      .in('id', sellerIds);
    (sellers || []).forEach((s: any) => { sellersMap[s.id] = s; });
  }

  const totalPages = count ? Math.ceil(count / PER_PAGE) : 1;
  const productList = products || [];

  return (
    <div className="inner-page inner-page--red min-h-screen">
      {/* HERO */}
      <section className="inner-hero page-padding">
        <div className="inner-hero__meta">
          <span className="status-dot" /> THE FOUNDER MARKETPLACE
          <span> / VENTEX / 2026</span>
        </div>
        <h1>
          Things worth<br />
          <em>putting to work.</em>
        </h1>
        <p>
          Founders list software and hardware products. Browse, discover, and contact sellers directly.
        </p>
        <div className="inner-hero__line" aria-hidden="true">
          <span>SCROLL TO EXPLORE</span>
          <span />
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="page-padding py-6 border-b border-line">
        <form method="GET" action="/marketplace" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="w-full bg-[var(--card)] border border-line rounded-2xl pl-10 pr-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px]"
              aria-label="Search products"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--smoke)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            name="type"
            defaultValue={typeFilter}
            className="bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] min-h-[44px]"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="software">Software</option>
            <option value="hardware">Hardware</option>
          </select>
          {categories.length > 0 && (
            <select
              name="category"
              defaultValue={categoryFilter}
              className="bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] min-h-[44px]"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className="bg-[var(--red)] text-[var(--paper)] px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-colors min-h-[44px] whitespace-nowrap"
          >
            Search
          </button>
          {(q || typeFilter || categoryFilter) && (
            <a
              href="/marketplace"
              className="px-6 py-3 rounded-2xl text-sm font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] border border-line transition-colors min-h-[44px] flex items-center whitespace-nowrap"
            >
              Clear
            </a>
          )}
        </form>
      </section>

      {/* PRODUCTS GRID */}
      <section className="page-padding py-10">
        {productList.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-line rounded-3xl bg-[var(--card)]">
            <svg className="w-12 h-12 mx-auto mb-4 text-[var(--smoke)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-display uppercase text-[var(--paper)]">No products found</p>
            <p className="text-sm font-mono text-[var(--smoke)] mt-2">
              {q || typeFilter || categoryFilter ? 'Try different search terms or filters.' : 'Be the first to list a product.'}
            </p>
            {(q || typeFilter || categoryFilter) && (
              <a href="/marketplace" className="mt-6 inline-block bg-[var(--red)] text-[var(--paper)] px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider">
                Clear filters
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-mono text-[var(--smoke)] uppercase tracking-wider">
                {count} product{count !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {productList.map((product: any) => {
                const seller = sellersMap[product.seller_id];
                const badge = getTypeBadge(product.product_type);
                const img = product.image_urls?.[0];

                return (
                  <Link
                    key={product.id}
                    href={`/marketplace/${product.id}`}
                    className="group bg-[var(--card)] border border-line rounded-2xl overflow-hidden hover:border-[var(--red)]/40 hover:shadow-lg transition-all duration-200 flex flex-col"
                  >
                    <div className="h-48 bg-[var(--ink)] relative overflow-hidden flex-shrink-0">
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--smoke)]">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {product.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-line/10 text-[var(--smoke)] border border-line/30">
                            {product.category}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-display uppercase text-[var(--paper)] text-sm font-medium leading-snug mb-2 line-clamp-2 group-hover:text-[var(--red)] transition-colors">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <p className="text-sm font-bold text-[var(--paper)] mt-auto pt-2">
                        {formatPrice(product.price, product.currency)}
                      </p>

                      {/* Seller */}
                      {seller?.display_name && (
                        <p className="text-[11px] font-mono text-[var(--smoke)] mt-1">
                          by {seller.display_name}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-3 mt-10" aria-label="Pagination">
                {page > 1 && (
                  <a
                    href={`/marketplace?${new URLSearchParams({ ...(q && { q }), ...(typeFilter && { type: typeFilter }), ...(categoryFilter && { category: categoryFilter }), page: String(page - 1) })}`}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-[var(--paper)] border border-line hover:border-[var(--red)] transition-colors min-h-[44px] flex items-center"
                  >
                    ← Previous
                  </a>
                )}
                <span className="text-xs font-mono text-[var(--smoke)]">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <a
                    href={`/marketplace?${new URLSearchParams({ ...(q && { q }), ...(typeFilter && { type: typeFilter }), ...(categoryFilter && { category: categoryFilter }), page: String(page + 1) })}`}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-[var(--paper)] border border-line hover:border-[var(--red)] transition-colors min-h-[44px] flex items-center"
                  >
                    Next →
                  </a>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
