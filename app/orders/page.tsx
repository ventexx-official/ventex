"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ShoppingBag,
  Search,
  Download,
  Star,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  User,
  MessageSquare,
  X,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function OrdersDashboard() {
  const router = useRouter();

  const [loading, setLoading]           = useState(true);
  const [orders, setOrders]             = useState<any[]>([]);
  const [currentUser, setCurrentUser]   = useState<any>(null);
  const [fetchError, setFetchError]     = useState<string | null>(null);

  // Navigation & filter tabs
  const [activeTab, setActiveTab]       = useState<'all' | 'downloads' | 'disputes'>('all');
  const [searchQuery, setSearchQuery]   = useState('');

  // Rating/Review Modal State
  const [reviewOrder, setReviewOrder]   = useState<any | null>(null);
  const [rating, setRating]             = useState(5);
  const [hoverRating, setHoverRating]   = useState<number | null>(null);
  const [comment, setComment]           = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOrdersAndUser = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        setCurrentUser(session.user);

        const { data: orderData, error } = await supabase
          .from('orders')
          .select(`
            *,
            product:product_id (
              id,
              name,
              images_urls,
              category,
              type
            ),
            seller:seller_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('buyer_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Orders Page] Error fetching orders:', error);
          setFetchError('Could not load your orders. Please refresh.');
          return;
        }

        setOrders(orderData ?? []);

        // Check which orders already have reviews
        if (orderData && orderData.length > 0) {
          const orderIds = orderData.map(o => o.id);
          const { data: existingReviews } = await supabase
            .from('reviews')
            .select('order_id')
            .eq('buyer_id', session.user.id)
            .in('order_id', orderIds);

          if (existingReviews) {
            const submittedMap: Record<string, boolean> = {};
            existingReviews.forEach(r => { submittedMap[r.order_id] = true; });
            setSubmittedReviews(submittedMap);
          }
        }
      } catch (err: any) {
        console.error('[Orders Page] Fetch error:', err);
        setFetchError(err?.message || 'Something went wrong loading your orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndUser();
  }, [router]);

  const handleSubmitReview = async () => {
    if (!reviewOrder || submittingReview || !currentUser) return;
    setSubmittingReview(true);
    try {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          order_id:   reviewOrder.id,
          buyer_id:   currentUser.id,
          product_id: reviewOrder.product.id,
          seller_id:  reviewOrder.seller.id,
          rating,
          comment: comment.trim(),
        });

      if (reviewError) throw reviewError;

      setSubmittedReviews(prev => ({ ...prev, [reviewOrder.id]: true }));

      // Recalculate product rating
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', reviewOrder.product.id);

      if (allReviews) {
        const count = allReviews.length;
        const avg   = count > 0 ? parseFloat((allReviews.reduce((a, r) => a + r.rating, 0) / count).toFixed(2)) : 0;
        await supabase
          .from('products')
          .update({ average_rating: avg, review_count: count })
          .eq('id', reviewOrder.product.id);
      }

      alert('Review submitted! Thank you.');
      setReviewOrder(null);
      setComment('');
      setRating(5);
    } catch (err: any) {
      console.error('[Review Submit Error]', err);
      alert('Could not submit review: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const product = order.product;
      if (!product) return false;

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.seller?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'downloads') {
        return (product.category === 'Software' || product.category === 'Templates') && order.status === 'paid';
      }
      if (activeTab === 'disputes') {
        return order.status === 'disputed';
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] rounded-full animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-[24px] p-8 border border-[var(--border)] text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-[var(--text)]">Could Not Load Orders</h2>
          <p className="text-sm text-[var(--text2)]">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--text)] text-[var(--bg)] px-6 py-2 rounded-xl font-bold text-sm hover:opacity-80 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--text2)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Marketplace
        </Link>

        {/* Header */}
        <div className="bg-[var(--card-bg)] rounded-[32px] p-8 md:p-10 border-[0.5px] border-[var(--border)] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[var(--text)] uppercase tracking-tighter flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-violet-600" /> My Purchases
            </h1>
            <p className="text-[var(--text2)] text-sm font-medium">
              Manage your purchases, download digital resources, and leave reviews.
            </p>
          </div>
          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
            <input
              type="text"
              placeholder="Search products or sellers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#222222] dark:focus:border-white transition-all text-[var(--text)] placeholder-[#888888]"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar tabs */}
          <aside className="w-full md:w-56 flex-shrink-0 flex md:flex-col gap-2 p-1 bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border-[0.5px] border-[var(--border)]">
            {([
              { id: 'all',       label: 'All Purchases', count: orders.length },
              { id: 'downloads', label: 'Downloads',     count: orders.filter(o => (o.product?.category === 'Software' || o.product?.category === 'Templates') && o.status === 'paid').length },
              { id: 'disputes',  label: 'Disputes',      count: orders.filter(o => o.status === 'disputed').length },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[var(--bg)] text-[var(--text2)]'
                }`}>{tab.count}</span>
              </button>
            ))}
          </aside>

          {/* Order grid */}
          <main className="flex-1 w-full space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-[var(--card-bg)] rounded-[32px] p-12 text-center border-[0.5px] border-[var(--border)]">
                <ShoppingBag className="w-12 h-12 text-[var(--text2)] mx-auto mb-4" />
                <h3 className="text-lg font-black text-[var(--text)] uppercase tracking-tight mb-1">No purchases found</h3>
                <p className="text-xs text-[var(--text2)] mb-6 max-w-xs mx-auto leading-relaxed">
                  {searchQuery ? 'Try adjusting your search.' : "You haven't purchased anything yet."}
                </p>
                {!searchQuery && (
                  <Link href="/marketplace" className="inline-block bg-[var(--text)] text-[var(--bg)] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-80 transition">
                    Browse Marketplace
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOrders.map((order) => {
                  const product    = order.product;
                  if (!product) return null;
                  const isDigital  = product.category === 'Software' || product.category === 'Templates';
                  const isReviewed = submittedReviews[order.id];
                  const dateStr    = new Date(order.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

                  const statusInfo = (() => {
                    switch (order.status) {
                      case 'paid':     return { label: 'Paid',     cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
                      case 'disputed': return { label: 'Disputed', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
                      case 'refunded': return { label: 'Refunded', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
                      default:         return { label: order.status, cls: 'bg-[var(--bg)] text-[var(--text2)] border-[var(--border)]' };
                    }
                  })();

                  return (
                    <div key={order.id} className="bg-[var(--card-bg)] rounded-[24px] border-[0.5px] border-[var(--border)] p-5 flex flex-col justify-between hover:shadow-lg transition-all">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-[var(--bg)] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border-[0.5px] border-[var(--border)]">
                            {product.images_urls?.[0]
                              ? <img src={product.images_urls[0]} alt="" className="w-full h-full object-cover" />
                              : <ShoppingBag className="w-6 h-6 text-[var(--text2)]" />}
                          </div>
                          <div className="space-y-1">
                            <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusInfo.cls}`}>
                              {statusInfo.label}
                            </span>
                            <h3 className="font-bold text-[var(--text)] text-sm leading-snug">{product.name}</h3>
                            <p className="text-[10px] text-[var(--text2)] font-medium flex items-center gap-1">
                              <User className="w-3 h-3" /> By {order.seller?.full_name || 'Anonymous'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-[var(--border)] text-[10px] text-[var(--text2)] font-bold uppercase tracking-wider">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-medium block">Purchased On</span>
                            <span className="text-[var(--text)] flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-medium block">Total Paid</span>
                            <span className="text-xs font-black text-[var(--text)]">${order.amount_paid?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2">
                          {isDigital && order.download_url && order.status === 'paid' && (
                            <a href={order.download_url} className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition">
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                          )}
                          {order.status === 'paid' && (isReviewed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 font-bold">
                              <Star className="w-3 h-3 fill-emerald-400" /> Reviewed ✓
                            </span>
                          ) : (
                            <button onClick={() => setReviewOrder(order)} className="inline-flex items-center gap-1.5 border border-[var(--border)] text-[var(--text)] px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-[var(--bg)] transition">
                              <MessageSquare className="w-3.5 h-3.5" /> Review
                            </button>
                          ))}
                        </div>
                        {order.status === 'paid' && (
                          <Link href={`/orders/${order.id}/dispute`} className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)] hover:text-red-400 transition ml-auto">
                            File Dispute
                          </Link>
                        )}
                        {order.status === 'disputed' && (
                          <span className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-1 ml-auto">
                            <ShieldAlert className="w-3.5 h-3.5" /> Under Review
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl relative border-[0.5px] border-[var(--border)]">
            <button
              onClick={() => { setReviewOrder(null); setComment(''); setRating(5); }}
              className="absolute top-4 right-4 p-2 bg-[var(--bg)] rounded-full hover:bg-[var(--border)] transition"
            >
              <X className="w-4 h-4 text-[var(--text2)]" />
            </button>
            <div className="p-8">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text2)] block mb-2">Verified Purchase</span>
              <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight mb-1">Leave a Review</h2>
              <p className="text-xs text-[var(--text2)] mb-6">Rating <strong>{reviewOrder.product?.name}</strong></p>

              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-110 transition-transform">
                    <Star className={`w-8 h-8 transition-colors ${star <= (hoverRating ?? rating) ? 'fill-amber-400 text-amber-400' : 'text-[var(--text2)]'}`} />
                  </button>
                ))}
                <span className="text-sm font-black text-[var(--text)] ml-2 bg-[var(--bg)] px-2.5 py-1 rounded-lg">{rating} / 5</span>
              </div>

              <label className="block text-xs font-black uppercase text-[var(--text)] tracking-wider mb-2">Comment</label>
              <textarea
                rows={4} value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[var(--text)] mb-6 resize-none"
              />
              <button
                onClick={handleSubmitReview} disabled={submittingReview || !comment.trim()}
                className="w-full bg-[var(--text)] text-[var(--bg)] py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:opacity-80 transition disabled:opacity-50"
              >
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
