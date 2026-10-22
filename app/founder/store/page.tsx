'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, AlertCircle, Package } from 'lucide-react';
import FounderGuard from '@/components/FounderGuard';

interface Product {
  id: string;
  name: string;
  status: 'draft' | 'live' | 'removed';
  product_type: string;
  image_urls: string[];
  updated_at: string;
  removed_reason: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    draft: 'bg-line/20 text-[var(--smoke)] border-line/40',
    removed: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  const labels: Record<string, string> = {
    live: 'Public',
    draft: 'Private',
    removed: 'Removed',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

export default function FounderStorePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      setUserId(session.user.id);

      const { data, error: err } = await supabase
        .from('products')
        .select('id, name, status, product_type, image_urls, updated_at, removed_reason')
        .eq('seller_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (err) setError(err.message);
      else setProducts(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft? This action cannot be undone.')) return;
    setDeletingId(id);
    const { error: err } = await supabase.from('products').delete().eq('id', id);
    if (err) {
      setError(err.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <FounderGuard>
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-line border-t-[var(--red)] rounded-full animate-spin" />
        </div>
      </FounderGuard>
    );
  }

  return (
    <FounderGuard>
      <div className="inner-page min-h-screen">
        <div className="page-padding py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                {'//'} MY STORE
              </span>
              <h1 className="font-display text-2xl md:text-3xl uppercase text-[var(--paper)]">Products</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/founder/store/inquiries"
                className="px-4 py-2.5 rounded-xl border border-line text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] hover:border-[var(--red)] transition-colors min-h-[44px] flex items-center"
              >
                Inquiries inbox
              </Link>
              <Link
                href="/founder/store/new"
                className="flex items-center gap-2 bg-[var(--red)] text-[var(--paper)] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> New product
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs font-mono text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-line rounded-3xl bg-[var(--card)] space-y-4">
              <Package className="w-12 h-12 mx-auto text-[var(--smoke)]" />
              <p className="font-display text-xl uppercase text-[var(--paper)]">No products yet</p>
              <p className="text-sm font-mono text-[var(--smoke)]">List your first software or hardware product to start selling.</p>
              <Link
                href="/founder/store/new"
                className="inline-flex items-center gap-2 bg-[var(--red)] text-[var(--paper)] px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> Add first product
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-[var(--card)] border border-line rounded-2xl hover:border-line/60 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--ink)] flex-shrink-0">
                    {product.image_urls?.[0] ? (
                      <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--smoke)]">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm text-[var(--paper)] truncate">{product.name}</p>
                      <StatusBadge status={product.status} />
                    </div>
                    <p className="text-[11px] font-mono text-[var(--smoke)]">
                      {product.product_type === 'software' ? 'Software' : 'Hardware'} · Updated {new Date(product.updated_at).toLocaleDateString()}
                    </p>
                    {product.removed_reason && (
                      <p className="text-[11px] font-mono text-red-400 mt-1">Removed: {product.removed_reason}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/founder/store/${product.id}`}
                      className="w-9 h-9 rounded-xl border border-line flex items-center justify-center text-[var(--smoke)] hover:text-[var(--paper)] hover:border-[var(--red)] transition-colors"
                      aria-label="Edit product"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {product.status === 'draft' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="w-9 h-9 rounded-xl border border-line flex items-center justify-center text-[var(--smoke)] hover:text-red-400 hover:border-red-500/40 transition-colors disabled:opacity-40"
                        aria-label="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FounderGuard>
  );
}
