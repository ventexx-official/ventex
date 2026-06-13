"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
 CheckCircle2, 
 Download, 
 MessageSquare, 
 Star, 
 ArrowRight, 
 ShoppingBag, 
 ShieldCheck,
 ChevronRight,
 X
} from 'lucide-react';
import Link from 'next/link';

function OrderConfirmationDetails() {
 const searchParams = useSearchParams();
 const _router = useRouter();
 const sessionId = searchParams.get('session_id');

 const [loading, setLoading] = useState(true);
 const [orders, setOrders] = useState<any[]>([]);
 const [currentUser, setCurrentUser] = useState<any>(null);
 
 // Review Modal State
 const [reviewItem, setReviewItem] = useState<any | null>(null);
 const [rating, setRating] = useState(5);
 const [hoverRating, setHoverRating] = useState<number | null>(null);
 const [comment, setComment] = useState('');
 const [submittingReview, setSubmittingReview] = useState(false);
 const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>({});

 useEffect(() => {
 const fetchSessionDetails = async () => {
 if (!sessionId) {
 setLoading(false);
 return;
 }

 setLoading(true);

 // Fetch user session
 const { data: { session } } = await supabase.auth.getSession();
 if (session) {
 setCurrentUser(session.user);
 }

 // Fetch order rows that match this Stripe session ID
 const { data: orderData, error } = await supabase
 .from('orders')
 .select(`
 id,
 amount_paid,
 download_url,
 created_at,
 product:product_id (
 id,
 name,
 images_urls,
 category,
 type
 ),
 seller:seller_id (
 id,
 full_name
 )
 `)
 .eq('stripe_session_id', sessionId);

 if (error) {
 console.error('[Order Confirmation] Error fetching orders:', error);
 } else if (orderData) {
 setOrders(orderData);
 
 // Check if any reviews already exist for these orders
 const orderIds = orderData.map(o => o.id);
 const { data: existingReviews } = await supabase
 .from('reviews')
 .select('order_id')
 .in('order_id', orderIds);

 if (existingReviews) {
 const submittedMap: Record<string, boolean> = {};
 existingReviews.forEach(r => {
 submittedMap[r.order_id] = true;
 });
 setSubmittedReviews(submittedMap);
 }
 }

 setLoading(false);
 };

 fetchSessionDetails();
 }, [sessionId]);

 const handleSubmitReview = async () => {
 if (!reviewItem || submittingReview || !currentUser) return;
 setSubmittingReview(true);

 try {
 // Insert review
 const { error: reviewError } = await supabase
 .from('reviews')
 .insert({
 order_id: reviewItem.id,
 buyer_id: currentUser.id,
 product_id: reviewItem.product.id,
 seller_id: reviewItem.seller.id,
 rating,
 comment: comment.trim(),
 });

 if (reviewError) throw reviewError;

 // Mark as submitted locally
 setSubmittedReviews(prev => ({
 ...prev,
 [reviewItem.id]: true
 }));

 // Update product average rating & review count
 const { data: allReviews } = await supabase
 .from('reviews')
 .select('rating')
 .eq('product_id', reviewItem.product.id);

 if (allReviews) {
 const count = allReviews.length;
 const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
 const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;

 await supabase
 .from('products')
 .update({
 average_rating: avg,
 review_count: count
 })
 .eq('id', reviewItem.product.id);
 }

 alert('Review submitted successfully! Thank you.');
 setReviewItem(null);
 setComment('');
 setRating(5);
 } catch (err: any) {
 console.error('[Review Submit Error]', err);
 alert('Could not submit review: ' + err.message);
 } finally {
 setSubmittingReview(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] rounded-full animate-spin"></div>
 </div>
 );
 }

 // Calculate order total
 const orderTotal = orders.reduce((sum, order) => sum + order.amount_paid, 0);

 return (
 <div className="min-h-screen bg-[var(--bg)] py-16 px-6">
 <div className="max-w-3xl mx-auto">
 
 {!sessionId || orders.length === 0 ? (
 /* Empty or Invalid State */
 <div className="bg-[var(--card-bg)] rounded-[32px] p-12 text-center border-[0.5px] border-[var(--border)] shadow-xl">
 <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
 <X className="w-10 h-10 text-red-500" />
 </div>
 <h1 className="text-2xl font-black text-[var(--text)] tracking-tight mb-2 uppercase">Invalid Confirmation</h1>
 <p className="text-[var(--text2)] mb-8 max-w-sm mx-auto">We couldn't retrieve the details for this checkout session. Please check your account dashboard for order history.</p>
 <Link 
 href="/marketplace" 
 className="inline-flex items-center gap-2 bg-[var(--text)] text-[var(--bg)] px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:opacity-80 transition-colors"
 >
 Browse Marketplace <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 ) : (
 /* Success Details */
 <div className="space-y-8">
 
 {/* Header Success Card */}
 <div className="bg-[var(--card-bg)] rounded-[32px] p-10 border-[0.5px] border-[var(--border)] text-center shadow-xl relative overflow-hidden">
 <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
 
 <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
 <CheckCircle2 className="w-12 h-12 text-emerald-500" />
 </div>
 
 <h1 className="text-3xl font-black text-[var(--text)] tracking-tighter uppercase mb-2">Order Confirmed!</h1>
 <p className="text-sm text-[var(--text2)] font-medium max-w-md mx-auto mb-6">
 Thank you for your purchase. Your order was successfully processed and split payouts were distributed.
 </p>
 
 <div className="inline-flex items-center gap-4 bg-[var(--bg)] dark:bg-[var(--bg3)] px-6 py-3 rounded-2xl border-[0.5px] border-[var(--border)] ">
 <div className="text-left border-r border-[#cccccc] dark:border-[#444444] pr-4">
 <span className="text-[10px] font-black uppercase text-[var(--text2)] tracking-widest block">Session ID</span>
 <span className="text-xs font-bold text-[var(--text)] ">{sessionId.slice(0, 15)}...</span>
 </div>
 <div className="text-left">
 <span className="text-[10px] font-black uppercase text-[var(--text2)] tracking-widest block">Total Paid</span>
 <span className="text-sm font-black text-[var(--text)] ">₹{orderTotal.toLocaleString()}</span>
 </div>
 </div>
 </div>

 {/* Purchased Items & Delivery Area */}
 <div className="bg-[var(--card-bg)] rounded-[32px] p-8 border-[0.5px] border-[var(--border)] shadow-md space-y-6">
 <h2 className="text-lg font-black text-[var(--text)] uppercase tracking-tight pb-4 border-b-[0.5px] border-[var(--border)] ">Your Products</h2>
 
 <div className="divide-y-[0.5px] divide-[#e5e5e5] dark:divide-[#333333]">
 {orders.map((order) => {
 const product = order.product;
 const isDigital = product.category === 'Software' || product.category === 'Templates';
 const hasSubmitted = submittedReviews[order.id];

 return (
 <div key={order.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
 
 {/* Left: Product Info */}
 <div className="flex gap-4 items-center">
 <div className="w-16 h-16 bg-[var(--bg)] dark:bg-[var(--bg3)] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
 {product.images_urls?.[0] ? (
 <img src={product.images_urls[0]} alt="" className="w-full h-full object-cover" />
 ) : (
 <ShoppingBag className="w-6 h-6 text-[var(--text3)]" />
 )}
 </div>
 <div>
 <h3 className="font-bold text-[var(--text)] hover:underline text-sm leading-snug">
 {product.name}
 </h3>
 <p className="text-xs text-[var(--text2)] mt-0.5">
 By {order.seller?.full_name || 'Anonymous'} · <span className="font-semibold text-emerald-500 uppercase tracking-widest text-[9px] bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">{product.category}</span>
 </p>
 <p className="text-xs font-black text-[var(--text)] mt-2">
 ₹{order.amount_paid.toLocaleString()}
 </p>
 </div>
 </div>

 {/* Right: Actions */}
 <div className="flex flex-wrap items-center gap-3">
 
 {/* Digital Download Link */}
 {isDigital && order.download_url && (
 <a 
 href={order.download_url}
 className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-[var(--text)] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
 >
 <Download className="w-3.5 h-3.5" /> Download File
 </a>
 )}

 {/* Review System */}
 {hasSubmitted ? (
 <span className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1.5">
 <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> Reviewed ✓
 </span>
 ) : (
 <button 
 onClick={() => setReviewItem(order)}
 className="inline-flex items-center gap-2 border-[1.5px] border-[#222222] dark:border-white text-[var(--text)] px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[var(--bg)] dark:hover:bg-[var(--text)] transition-colors"
 >
 <MessageSquare className="w-3.5 h-3.5" /> Leave a Review
 </button>
 )}

 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Helpful Note and Next Actions */}
 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
 <div className="flex items-center gap-2 text-xs text-[var(--text2)] font-medium">
 <ShieldCheck className="w-4 h-4 text-emerald-500" /> 5% Commission Split Distributed automatically by Stripe Connect
 </div>
 <div className="flex gap-4">
 <Link 
 href="/orders" 
 className="bg-[var(--card-bg)] text-[var(--text)] border-[0.5px] border-[var(--border)] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[var(--bg)] dark:hover:bg-[var(--text)] transition-colors shadow-sm"
 >
 View Order History
 </Link>
 <Link 
 href="/marketplace" 
 className="bg-[var(--text)] text-[var(--bg)] px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:opacity-80 transition-colors shadow-md flex items-center gap-1.5"
 >
 Marketplace <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>

 </div>
 )}

 </div>

 {/* RATING & REVIEW MODAL */}
 {reviewItem && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-[var(--card-bg)] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border-[0.5px] border-[var(--border)] ">
 
 <button 
 onClick={() => {
 setReviewItem(null);
 setComment('');
 setRating(5);
 }} 
 className="absolute top-4 right-4 p-2 bg-[var(--bg)] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#444444] transition-colors"
 >
 <X className="w-4 h-4 text-[var(--text2)]" />
 </button>

 <div className="p-8">
 <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text2)] block mb-2">Verified Purchase</span>
 <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight mb-1">Leave a Product Review</h2>
 <p className="text-xs text-[var(--text2)] mb-6">Rate and review your experience with <strong>{reviewItem.product?.name}</strong>.</p>
 
 {/* Star Rating Selector */}
 <div className="flex items-center gap-2 mb-6">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setRating(star)}
 onMouseEnter={() => setHoverRating(star)}
 onMouseLeave={() => setHoverRating(null)}
 className="p-1 hover:scale-110 transition-transform text-amber-400"
 >
 <Star 
 className={`w-8 h-8 transition-colors ${
 star <= (hoverRating !== null ? hoverRating : rating) 
 ? 'fill-amber-400 text-amber-400' 
 : 'text-[var(--text2)]'
 }`} 
 />
 </button>
 ))}
 <span className="text-sm font-black text-[var(--text)] ml-2 bg-[var(--bg)] px-2.5 py-1 rounded-lg">
 {rating} / 5
 </span>
 </div>

 {/* Review Comment Textarea */}
 <label className="block text-xs font-black uppercase text-[var(--text)] tracking-wider mb-2">Review Comment</label>
 <textarea 
 rows={4}
 value={comment}
 onChange={e => setComment(e.target.value)}
 placeholder="E.g. Outstanding software layout! Very clean code structure and incredibly fast load times. Highly recommend..."
 className="w-full px-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[var(--text)] mb-6 resize-none"
 ></textarea>
 
 <button 
 onClick={handleSubmitReview}
 disabled={submittingReview || !comment.trim()}
 className="w-full bg-[var(--text)] text-[var(--bg)] py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {submittingReview ? 'Submitting Review...' : 'Submit Review'}
 </button>
 </div>

 </div>
 </div>
 )}

 </div>
 );
}

export default function OrderConfirmationPage() {
 return (
 <Suspense fallback={
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] rounded-full animate-spin"></div>
 </div>
 }>
 <OrderConfirmationDetails />
 </Suspense>
 );
}
