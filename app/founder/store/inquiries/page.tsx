'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, MessageSquare, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import FounderGuard from '@/components/FounderGuard';

interface InquiryItem {
  id: string;
  product_id: string;
  buyer_id: string;
  message: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: 'new' | 'replied' | 'closed';
  created_at: string;
  product_name?: string;
  buyer_name?: string;
  buyer_avatar?: string | null;
}

export default function FounderInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInquiries() {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login?next=/founder/store/inquiries');
          return;
        }

        // 1. Fetch inquiries for this seller
        const { data: inqData, error: inqErr } = await supabase
          .from('product_inquiries')
          .select('id, product_id, buyer_id, message, contact_email, contact_phone, status, created_at')
          .eq('seller_id', session.user.id)
          .order('created_at', { ascending: false });

        if (inqErr) throw inqErr;
        if (!inqData || inqData.length === 0) {
          setInquiries([]);
          return;
        }

        // 2. Fetch products for product names
        const productIds = Array.from(new Set(inqData.map(i => i.product_id)));
        const { data: prodData } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);

        const prodMap = new Map((prodData || []).map(p => [p.id, p.name]));

        // 3. Fetch buyer public profiles
        const buyerIds = Array.from(new Set(inqData.map(i => i.buyer_id)));
        const { data: profData } = await supabase
          .from('public_profiles')
          .select('id, display_name, avatar_url')
          .in('id', buyerIds);

        const profMap = new Map((profData || []).map(p => [p.id, p]));

        const combined: InquiryItem[] = inqData.map(item => ({
          ...item,
          product_name: prodMap.get(item.product_id) || 'Untitled Product',
          buyer_name: profMap.get(item.buyer_id)?.display_name || 'Anonymous User',
          buyer_avatar: profMap.get(item.buyer_id)?.avatar_url || null,
        }));

        setInquiries(combined);
      } catch (err: any) {
        console.error('Error fetching inquiries:', err);
        setError(err.message || 'Failed to load inquiries');
      } finally {
        setLoading(false);
      }
    }

    loadInquiries();
  }, [router]);

  async function handleStatusChange(inquiryId: string, nextStatus: 'new' | 'replied' | 'closed') {
    try {
      setUpdatingId(inquiryId);
      const { error: updErr } = await supabase
        .from('product_inquiries')
        .update({ status: nextStatus })
        .eq('id', inquiryId);

      if (updErr) throw updErr;

      setInquiries(prev =>
        prev.map(item => (item.id === inquiryId ? { ...item, status: nextStatus } : item))
      );
    } catch (err: any) {
      alert(err.message || 'Could not update status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <FounderGuard>
      <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] py-8 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/founder/store"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--smoke)] hover:text-[var(--paper)] mb-2 transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Products
            </Link>
            <h1 className="text-2xl font-mono uppercase tracking-tight text-[var(--paper)]">
              Product Inquiries
            </h1>
            <p className="text-xs text-[var(--smoke)] mt-1">
              Messages and contact requests from prospective buyers.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] animate-pulse space-y-3"
              >
                <div className="h-4 bg-[var(--line)] rounded w-1/4"></div>
                <div className="h-3 bg-[var(--line)] rounded w-3/4"></div>
                <div className="h-3 bg-[var(--line)] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && inquiries.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card)]/40">
            <MessageSquare className="w-10 h-10 text-[var(--smoke)] mx-auto mb-3 opacity-60" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] mb-1">
              No inquiries yet
            </h2>
            <p className="text-xs text-[var(--smoke)] max-w-sm mx-auto">
              When prospective buyers submit an inquiry regarding your marketplace products, their messages will appear here.
            </p>
          </div>
        )}

        {/* List of inquiries */}
        {!loading && inquiries.length > 0 && (
          <div className="space-y-4">
            {inquiries.map(inq => {
              const dateStr = new Date(inq.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={inq.id}
                  className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col gap-4 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--line)]/50 pb-3">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--smoke)] mb-0.5">
                        Product
                      </div>
                      <Link
                        href={`/marketplace/${inq.product_id}`}
                        className="text-sm font-semibold text-[var(--paper)] hover:text-[var(--red)] transition-colors underline-offset-2 hover:underline"
                      >
                        {inq.product_name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--smoke)] font-mono">{dateStr}</span>
                      <div className="flex items-center gap-1.5">
                        <label htmlFor={`status-${inq.id}`} className="sr-only">Status</label>
                        <select
                          id={`status-${inq.id}`}
                          value={inq.status}
                          disabled={updatingId === inq.id}
                          onChange={e =>
                            handleStatusChange(
                              inq.id,
                              e.target.value as 'new' | 'replied' | 'closed'
                            )
                          }
                          className="h-9 px-2.5 rounded-lg text-xs font-mono bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)] cursor-pointer"
                        >
                          <option value="new">Status: New</option>
                          <option value="replied">Status: Replied</option>
                          <option value="closed">Status: Closed</option>
                        </select>
                        {updatingId === inq.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--smoke)]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buyer & Message */}
                  <div className="flex items-start gap-3">
                    {inq.buyer_avatar ? (
                      <img
                        src={inq.buyer_avatar}
                        alt={inq.buyer_name || 'Buyer'}
                        className="w-9 h-9 rounded-full object-cover border border-[var(--line)]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[var(--paper-dim)]/10 text-[var(--paper)] font-mono text-xs flex items-center justify-center border border-[var(--line)] flex-shrink-0">
                        {inq.buyer_name ? inq.buyer_name.charAt(0).toUpperCase() : 'B'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[var(--paper)]">
                        {inq.buyer_name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--smoke)] mt-0.5">
                        {inq.contact_email && (
                          <span>
                            Email:{' '}
                            <a
                              href={`mailto:${inq.contact_email}`}
                              className="text-[var(--paper)] hover:underline"
                            >
                              {inq.contact_email}
                            </a>
                          </span>
                        )}
                        {inq.contact_phone && (
                          <span>
                            Phone:{' '}
                            <a
                              href={`tel:${inq.contact_phone}`}
                              className="text-[var(--paper)] hover:underline"
                            >
                              {inq.contact_phone}
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="bg-[var(--ink)]/60 rounded-xl p-3 border border-[var(--line)]/50 text-xs text-[var(--paper-dim)] leading-relaxed whitespace-pre-wrap">
                    {inq.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FounderGuard>
  );
}
