'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';

interface MyInquiry {
  id: string;
  product_id: string;
  message: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: 'new' | 'replied' | 'closed';
  created_at: string;
  product_name?: string;
  product_status?: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    replied: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    closed: 'bg-line/20 text-[var(--smoke)] border-line/40',
  };
  const labels: Record<string, string> = {
    new: 'New',
    replied: 'Replied',
    closed: 'Closed',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
        styles[status] || styles.new
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export default function MyInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<MyInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInquiries() {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login?next=/marketplace/my-inquiries');
          return;
        }

        // 1. Fetch inquiries sent by this buyer
        const { data: inqData, error: inqErr } = await supabase
          .from('product_inquiries')
          .select('id, product_id, message, contact_email, contact_phone, status, created_at')
          .eq('buyer_id', session.user.id)
          .order('created_at', { ascending: false });

        if (inqErr) throw inqErr;
        if (!inqData || inqData.length === 0) {
          setInquiries([]);
          return;
        }

        // 2. Fetch products to get name & status
        const productIds = Array.from(new Set(inqData.map(i => i.product_id)));
        const { data: prodData } = await supabase
          .from('products')
          .select('id, name, status')
          .in('id', productIds);

        const prodMap = new Map((prodData || []).map(p => [p.id, p]));

        const combined: MyInquiry[] = inqData.map(item => {
          const prod = prodMap.get(item.product_id);
          return {
            ...item,
            product_name: prod?.name || 'Product',
            product_status: prod?.status || 'removed',
          };
        });

        setInquiries(combined);
      } catch (err: any) {
        console.error('Error fetching my inquiries:', err);
        setError(err.message || 'Failed to load inquiries');
      } finally {
        setLoading(false);
      }
    }

    loadInquiries();
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--smoke)] hover:text-[var(--paper)] mb-2 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Marketplace
        </Link>
        <h1 className="text-2xl font-mono uppercase tracking-tight text-[var(--paper)]">
          My Inquiries
        </h1>
        <p className="text-xs text-[var(--smoke)] mt-1">
          Track messages and questions you sent to sellers.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] animate-pulse space-y-3"
            >
              <div className="h-4 bg-[var(--line)] rounded w-1/3"></div>
              <div className="h-3 bg-[var(--line)] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && inquiries.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card)]/40">
          <MessageSquare className="w-10 h-10 text-[var(--smoke)] mx-auto mb-3 opacity-60" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] mb-1">
            No inquiries sent yet
          </h2>
          <p className="text-xs text-[var(--smoke)] max-w-sm mx-auto mb-5">
            You haven't contacted any sellers yet. Explore the marketplace to find tools, services, and software.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-mono font-medium bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors min-h-[44px]"
          >
            Browse Marketplace
          </Link>
        </div>
      )}

      {/* Inquiries list */}
      {!loading && inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map(inq => {
            const dateStr = new Date(inq.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const isLive = inq.product_status === 'live';

            return (
              <div
                key={inq.id}
                className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col gap-3 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isLive ? (
                      <Link
                        href={`/marketplace/${inq.product_id}`}
                        className="text-sm font-semibold text-[var(--paper)] hover:text-[var(--red)] transition-colors inline-flex items-center gap-1.5"
                      >
                        {inq.product_name}
                        <ExternalLink className="w-3 h-3 text-[var(--smoke)]" />
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-[var(--smoke)]">
                        {inq.product_name} <span className="text-xs font-normal italic">(listing no longer live)</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--smoke)] font-mono">{dateStr}</span>
                    <StatusBadge status={inq.status} />
                  </div>
                </div>

                <div className="text-xs text-[var(--paper-dim)] bg-[var(--ink)]/50 rounded-xl p-3 border border-[var(--line)]/40 leading-relaxed whitespace-pre-wrap">
                  {inq.message}
                </div>

                {(inq.contact_email || inq.contact_phone) && (
                  <div className="text-[11px] text-[var(--smoke)] flex flex-wrap gap-x-4">
                    {inq.contact_email && <span>Email provided: {inq.contact_email}</span>}
                    {inq.contact_phone && <span>Phone provided: {inq.contact_phone}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
