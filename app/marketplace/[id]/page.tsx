"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
 Star, 
 Clock, 
 Tag,
 ArrowRight,
 ShoppingBag,
 User,
 ShieldCheck,
 CheckCircle2,
 X
} from 'lucide-react';
import Link from 'next/link';

const MOCK_REVIEWS = [
 {
 id: "mock-1",
 buyer: {
 full_name: "Sarah Jenkins",
 avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
 },
 rating: 5,
 comment: "This template is absolutely stunning! The clean architecture and smooth tailwind styling saved me over 40 hours of setup. Integration with Supabase auth was flawless.",
 seller_reply: "Thank you Sarah! Glad you loved the Supabase setup. Let me know if you need help with deployment.",
 created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
 },
 {
 id: "mock-2",
 buyer: {
 full_name: "Developer Dan",
 avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dan"
 },
 rating: 4,
 comment: "Excellent documentation and great code structure. Had a minor issue with the Stripe webhook routing initially, but the creator responded within an hour and helped me resolve it.",
 seller_reply: "Appreciate the feedback, Dan! Yes, Stripe webhooks can sometimes be tricky. I updated the docs to make that step clearer for others.",
 created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
 },
 {
 id: "mock-3",
 buyer: {
 full_name: "Elena Rostova",
 avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
 },
 rating: 5,
 comment: "The UI design alone is worth the price. I've bought three other starter kits before but this is by far the most premium-feeling and responsive one. Highly recommended!",
 seller_reply: null,
 created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
 }
];

export default function ProductDetailPage() {
 const { id } = useParams();
 const router = useRouter();

 const [product, setProduct] = useState<any>(null);
 const [reviews, setReviews] = useState<any[]>([]);
 const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState<'description'|'reviews'|'qa'>('description');
 const [mainImage, setMainImage] = useState<string>('');
 
 const [currentUser, setCurrentUser] = useState<any>(null);
 const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
 const [requirements, setRequirements] = useState('');
 const [requestName, setRequestName] = useState('');
 const [requestBudget, setRequestBudget] = useState('');
 const [requestTimeline, setRequestTimeline] = useState('');
 const [requestEmail, setRequestEmail] = useState('');
 const [submittingRequest, setSubmittingRequest] = useState(false);

 const [newQuestion, setNewQuestion] = useState('');
 const [submittingQuestion, setSubmittingQuestion] = useState(false);

 const [isAddingToCart, setIsAddingToCart] = useState(false);
 const [addedToCart, setAddedToCart] = useState(false);
 const [isCheckingOut, setIsCheckingOut] = useState(false);

 // New review state variables
 const [unreviewedOrders, setUnreviewedOrders] = useState<any[]>([]);
 const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
 const [reviewRating, setReviewRating] = useState<number>(0);
 const [reviewComment, setReviewComment] = useState('');
 const [hoverRating, setHoverRating] = useState<number>(0);
 const [submittingReview, setSubmittingReview] = useState(false);
 const [isDemoMode, setIsDemoMode] = useState(false);

 // Load product data
 useEffect(() => {
 const fetchData = async () => {
 setLoading(true);

 const { data: { session } } = await supabase.auth.getSession();
 if (session) {
 const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
 setCurrentUser(profile);

 // Fetch fulfilled orders by this buyer for this product
 const { data: oData } = await supabase
 .from('orders')
 .select('*')
 .eq('product_id', id)
 .eq('buyer_id', session.user.id)
 .eq('status', 'fulfilled');

 // Fetch user reviews
 const { data: userRevs } = await supabase
 .from('reviews')
 .select('order_id')
 .eq('product_id', id)
 .eq('buyer_id', session.user.id);

 const reviewedIds = new Set(userRevs?.map(r => r.order_id) || []);
 if (oData) {
 const eligible = oData.filter(o => !reviewedIds.has(o.id));
 setUnreviewedOrders(eligible);
 }
 }

 // Fetch Product
 const { data: pData, error } = await supabase
 .from('products')
 .select(`
 *,
 seller:seller_id ( id, full_name, avatar_url ),
 pitch:pitch_id ( id, title )
 `)
 .eq('id', id)
 .single();

 if (error || !pData) {
 router.push('/marketplace');
 return;
 }

 setProduct(pData);
 if (pData.images_urls && pData.images_urls.length > 0) {
 setMainImage(pData.images_urls[0]);
 }

 // Fetch Reviews
 const { data: rData } = await supabase
 .from('reviews')
 .select(`*, buyer:buyer_id ( full_name, avatar_url )`)
 .eq('product_id', id)
 .order('created_at', { ascending: false });
 
 if (rData) setReviews(rData);

 // Fetch Related
 const { data: relatedData } = await supabase
 .from('products')
 .select(`*, seller:seller_id ( full_name ), pitch:pitch_id ( title )`)
 .eq('category', pData.category)
 .eq('status', 'live')
 .neq('id', id)
 .limit(4);

 if (relatedData) setRelatedProducts(relatedData);

 setLoading(false);
 };

 if (id) fetchData();
 }, [id, router]);


 // Derived Values
 const now = new Date();
 const isDeal = product?.discount_price && product?.deal_end_date && new Date(product.deal_end_date) > now;
 const isCustom = product?.type === 'custom_work' || product?.is_custom_build || product?.listing_type === 'freelance';

 const handleRequestWork = async () => {
 if (!currentUser) {
 router.push('/login');
 return;
 }

 setIsRequestModalOpen(true);
 };

 const scanOffPlatformAttempt = async (text: string, contentType: string): Promise<string[] | null> => {
 const detected: string[] = [];
 
 // 1. Phone number pattern (10 digits)
 const phoneRegex = /\b\d{10}\b/;
 const formatPhoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
 if (phoneRegex.test(text) || formatPhoneRegex.test(text)) {
 detected.push('Phone Number');
 }

 // 2. UPI handles
 const upiRegex = /[a-zA-Z0-9.-]+@(oksbi|paytm|ybl|upi|apl|axl|sbi|icici|ybp|postbank)/i;
 if (upiRegex.test(text)) {
 detected.push('UPI Handle');
 }

 // 3. WhatsApp & external payment links
 const externalLinksRegex = /(wa\.me|whatsapp\.com|paypal\.me|razorpay|paytm\.me)/i;
 if (externalLinksRegex.test(text)) {
 detected.push('External Contact/Payment URL');
 }

 if (detected.length > 0) {
 // Log to public.flagged_attempts
 try {
 await supabase.from('flagged_attempts').insert({
 user_id: currentUser?.id,
 content_type: contentType,
 raw_content: text,
 detected_patterns: detected
 });
 } catch (err) {
 console.warn("Failed to log flagged attempt to DB (schema might not exist yet):", err);
 }
 return detected;
 }

 return null;
 };

 const submitRequest = async () => {
 if (!requirements.trim()) return;

 // Scan for off-platform contact/payment patterns
 const flagged = await scanOffPlatformAttempt(requirements, 'project_requirements');
 if (flagged) {
 alert("âš ï¸ Access Blocked: All transactions must go through Ventex. Sharing contact details, UPI handles, or external links is strictly prohibited.");
 return;
 }

 setSubmittingRequest(true);

 try {
 const { error: reqError } = await supabase.from('build_requests').insert({
 buyer_id: currentUser.id,
 seller_id: product.seller_id,
 product_id: product.id,
 name: requestName,
 project_description: requirements,
 budget_range: requestBudget,
 timeline_needed: requestTimeline,
 contact_email: requestEmail,
 status: 'pending'
 });

 if (reqError) throw reqError;

 // Notify seller
 await supabase.from('notifications').insert({
 user_id: product.seller_id,
 type: 'new_request',
 message: `New custom build request for ${product.name} from ${currentUser.full_name || requestName || 'a buyer'}`,
 link: `/founder/dashboard`
 });

 setIsRequestModalOpen(false);
 setRequirements('');
 setRequestName('');
 setRequestBudget('');
 setRequestTimeline('');
 setRequestEmail('');
 alert("This is a product inquiry, not an investment discussion. The founder will respond to your project request.");
 } catch (err: any) {
 alert("Error: " + err.message);
 } finally {
 setSubmittingRequest(false);
 }
 };

 const toggleDemoMode = () => {
 if (isDemoMode) {
 setIsDemoMode(false);
 
 const refreshRealData = async () => {
 setLoading(true);
 const { data: { session } } = await supabase.auth.getSession();
 if (session) {
 const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
 setCurrentUser(profile);

 const { data: oData } = await supabase
 .from('orders')
 .select('*')
 .eq('product_id', id)
 .eq('buyer_id', session.user.id)
 .eq('status', 'fulfilled');

 const { data: userRevs } = await supabase
 .from('reviews')
 .select('order_id')
 .eq('product_id', id)
 .eq('buyer_id', session.user.id);

 const reviewedIds = new Set(userRevs?.map(r => r.order_id) || []);
 if (oData) {
 const eligible = oData.filter(o => !reviewedIds.has(o.id));
 setUnreviewedOrders(eligible);
 }
 } else {
 setCurrentUser(null);
 setUnreviewedOrders([]);
 }

 const { data: rData } = await supabase
 .from('reviews')
 .select(`*, buyer:buyer_id ( full_name, avatar_url )`)
 .eq('product_id', id)
 .order('created_at', { ascending: false });
 
 if (rData) setReviews(rData);

 const { data: pData } = await supabase.from('products').select('*').eq('id', id).single();
 if (pData) setProduct(pData);

 setLoading(false);
 };
 refreshRealData();
 } else {
 setIsDemoMode(true);
 
 setProduct((prev: any) => ({
 ...prev,
 average_rating: 4.7,
 review_count: 3
 }));

 setReviews(MOCK_REVIEWS);

 setCurrentUser({
 id: "mock-user-id",
 full_name: "Jane Dev",
 avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
 });

 setUnreviewedOrders([
 {
 id: "mock-order-id",
 product_id: id,
 buyer_id: "mock-user-id",
 status: "fulfilled"
 }
 ]);
 }
 };

 const submitReview = async () => {
 if (reviewRating === 0 || reviewComment.trim().length < 10 || reviewComment.length > 500) return;
 setSubmittingReview(true);

 try {
 if (isDemoMode) {
 await new Promise(resolve => setTimeout(resolve, 800));

 const newReviewObj = {
 id: `mock-review-${Date.now()}`,
 order_id: unreviewedOrders[0]?.id || "mock-order-id",
 buyer_id: currentUser?.id || "mock-user-id",
 product_id: product.id,
 rating: reviewRating,
 comment: reviewComment,
 seller_reply: null,
 created_at: new Date().toISOString(),
 buyer: {
 full_name: currentUser?.full_name || "Jane Dev",
 avatar_url: currentUser?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
 }
 };

 const updatedReviews = [newReviewObj, ...reviews];
 setReviews(updatedReviews);

 const newCount = updatedReviews.length;
 const newAvg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newCount;
 
 setProduct((prev: any) => ({
 ...prev,
 average_rating: parseFloat(newAvg.toFixed(1)),
 review_count: newCount
 }));

 setUnreviewedOrders([]);
 setIsReviewModalOpen(false);
 setReviewRating(0);
 setReviewComment('');
 alert("Success (Demo Mode): Your verified review was posted!");
 } else {
 if (!currentUser || unreviewedOrders.length === 0) {
 throw new Error("No eligible order to review.");
 }

 const targetOrder = unreviewedOrders[0];

 const { data: newReview, error: insertError } = await supabase
 .from('reviews')
 .insert({
 order_id: targetOrder.id,
 buyer_id: currentUser.id,
 product_id: product.id,
 seller_id: product.seller_id,
 rating: reviewRating,
 comment: reviewComment
 })
 .select(`*, buyer:buyer_id ( full_name, avatar_url )`)
 .single();

 if (insertError) throw insertError;

 const updatedReviews = [newReview, ...reviews];
 setReviews(updatedReviews);

 const newCount = updatedReviews.length;
 const newAvg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newCount;
 
 setProduct((prev: any) => ({
 ...prev,
 average_rating: parseFloat(newAvg.toFixed(1)),
 review_count: newCount
 }));

 try {
 await supabase
 .from('products')
 .update({
 review_count: newCount,
 average_rating: parseFloat(newAvg.toFixed(1))
 })
 .eq('id', product.id);
 } catch (dbUpdateErr) {
 console.warn("Failed to update products stats (likely RLS). Trigger will recalculate on server.", dbUpdateErr);
 }

 setUnreviewedOrders(prev => prev.filter(o => o.id !== targetOrder.id));

 setIsReviewModalOpen(false);
 setReviewRating(0);
 setReviewComment('');
 alert("Your verified review has been submitted successfully!");
 }
 } catch (err: any) {
 alert("Error submitting review: " + err.message);
 } finally {
 setSubmittingReview(false);
 }
 };

 const ratingsBreakdown = useMemo(() => {
 const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
 reviews.forEach((r) => {
 const rVal = Math.round(r.rating);
 if (rVal >= 1 && rVal <= 5) {
 counts[rVal as 1|2|3|4|5]++;
 }
 });
 return counts;
 }, [reviews]);

 const getPercentage = (stars: 1|2|3|4|5) => {
 if (reviews.length === 0) return 0;
 return Math.round((ratingsBreakdown[stars] / reviews.length) * 100);
 };

 const submitQuestion = async () => {
 if (!newQuestion.trim()) return;

 // Scan for off-platform contact/payment patterns
 const flagged = await scanOffPlatformAttempt(newQuestion, 'qa_question');
 if (flagged) {
 alert("âš ï¸ Access Blocked: All transactions must go through Ventex. Sharing contact details, UPI handles, or external links is strictly prohibited.");
 return;
 }

 setSubmittingQuestion(true);

 try {
 const qObj = {
 id: crypto.randomUUID(),
 user_name: currentUser.full_name || 'Anonymous',
 question: newQuestion,
 answer: null,
 date: new Date().toISOString()
 };

 const currentQa = Array.isArray(product.qa_data) ? product.qa_data : [];
 const fallbackQa = [...currentQa, qObj];

 const { data: savedQa, error } = await supabase.rpc('append_product_question', {
 target_product_id: product.id,
 question: qObj
 });

 if (error) throw error;

 const updatedQa = Array.isArray(savedQa) ? savedQa : fallbackQa;
 setProduct({ ...product, qa_data: updatedQa });
 setNewQuestion('');
 } catch (err: any) {
 const message = err?.message || "Please try again after the database update is applied.";
 alert("Error submitting question: " + message);
 } finally {
 setSubmittingQuestion(false);
 }
 };

 const handleAddToCart = async () => {
 if (!currentUser) {
 router.push('/login');
 return;
 }
 
 setIsAddingToCart(true);
 
 try {
 const { error } = await supabase.from('cart_items').insert({
 user_id: currentUser.id,
 product_id: product.id,
 quantity: 1
 });

 if (error) throw error;
 
 setAddedToCart(true);
 window.dispatchEvent(new Event('cart_updated'));
 
 // Reset the success state after 3 seconds
 setTimeout(() => setAddedToCart(false), 3000);
 } catch (err: any) {
 alert("Error adding to cart: " + err.message);
 } finally {
 setIsAddingToCart(false);
 }
 };

 const handleBuyNow = async () => {
 const { data: { session } } = await supabase.auth.getSession();

 if (!session) {
 router.push('/login');
 return;
 }

 setIsCheckingOut(true);

 try {
 const res = await fetch('/api/marketplace/create-checkout', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${session.access_token}`,
 },
 body: JSON.stringify({
 cartItems: [{ product_id: product.id, quantity: 1 }],
 promoCodeId: null,
 }),
 });

 if (!res.ok) {
 const errText = await res.text();
 throw new Error(errText || 'Failed to create checkout session');
 }

 const data = await res.json();
 if (data.url) {
 window.location.href = data.url;
 } else {
 throw new Error('No checkout URL returned from Stripe');
 }
 } catch (err: any) {
 console.error('[Buy Now] Error:', err);
 alert(err.message || 'Checkout failed. Please try again.');
 } finally {
 setIsCheckingOut(false);
 }
 };

 if (loading || !product) {
 return (
 <div className="min-h-screen bg-[var(--bg)] py-8 px-4">
 <div className="max-w-6xl mx-auto">
 {/* Breadcrumb skeleton */}
 <div className="h-4 w-48 bg-[#e5e5e5] rounded-full mb-8 animate-pulse" />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left: Images + tabs skeleton */}
 <div className="lg:col-span-2 space-y-5">
 {/* Main image */}
 <div className="w-full aspect-video bg-[#e5e5e5] rounded-[28px] animate-pulse" />
 {/* Thumbnail strip */}
 <div className="flex gap-2">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="w-16 h-16 bg-[#e5e5e5] rounded-xl flex-shrink-0 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
 ))}
 </div>
 {/* Tab bar skeleton */}
 <div className="flex gap-3 border-b border-[var(--border)] dark:border-[#2a2a2a] pb-4">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="h-8 w-24 bg-[#e5e5e5] rounded-xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
 ))}
 </div>
 {/* Description lines */}
 <div className="space-y-3 pt-2">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-3.5 bg-[#e5e5e5] rounded-full animate-pulse" style={{ width: `${85 - i * 7}%`, animationDelay: `${i * 50}ms` }} />
 ))}
 </div>
 </div>

 {/* Right: Purchase card skeleton */}
 <div className="space-y-5">
 {/* Seller chip */}
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-[#e5e5e5] rounded-full animate-pulse" />
 <div className="space-y-1.5">
 <div className="h-3 w-28 bg-[#e5e5e5] rounded-full animate-pulse" />
 <div className="h-2.5 w-16 bg-[#e5e5e5] rounded-full animate-pulse" />
 </div>
 </div>
 {/* Title */}
 <div className="h-7 w-full bg-[#e5e5e5] rounded-xl animate-pulse" />
 <div className="h-5 w-3/4 bg-[#e5e5e5] rounded-xl animate-pulse" />
 {/* Price */}
 <div className="h-10 w-32 bg-[#e5e5e5] rounded-2xl animate-pulse" />
 {/* CTA buttons */}
 <div className="space-y-3 pt-2">
 <div className="h-14 w-full bg-[#e5e5e5] rounded-2xl animate-pulse" />
 <div className="h-12 w-full bg-[#e5e5e5] rounded-2xl animate-pulse" />
 </div>
 {/* Trust badges */}
 <div className="space-y-2 pt-2">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="flex items-center gap-2">
 <div className="w-4 h-4 bg-[#e5e5e5] rounded-full animate-pulse" />
 <div className="h-3 w-40 bg-[#e5e5e5] rounded-full animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 const productQa = Array.isArray(product.qa_data) ? product.qa_data : [];

 return (
 <div className="min-h-screen bg-[var(--bg)] pb-24">
 {product && (
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
 "@context": "https://schema.org",
 "@type": "Product",
 name: product.name,
 description: product.description || product.name,
 offers: {
 "@type": "Offer",
 price: product.discount_price || product.price,
 priceCurrency: "INR"
 }
 })
 }}
 />
 )}
 <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 space-y-12">
 
 {/* TOP SECTION: Two Columns */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
 
 {/* Left: Image Gallery */}
 <div className="space-y-4">
 <div className="aspect-video bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[24px] border-[0.5px] border-[var(--border)] overflow-hidden flex items-center justify-center relative">
 {isDeal && (
 <span className="absolute top-4 left-4 bg-[var(--text)] text-[var(--bg)] text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full z-10 shadow-lg flex items-center gap-1">
 <Tag className="w-3.5 h-3.5" /> {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
 </span>
 )}
 {mainImage ? (
 <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
 ) : (
 <ShoppingBag className="w-16 h-16 text-[var(--text3)] dark:text-[var(--text)]" />
 )}
 </div>
 
 {product.images_urls && product.images_urls.length > 1 && (
 <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
 {product.images_urls.map((img: string, idx: number) => (
 <button 
 key={idx} 
 onClick={() => setMainImage(img)}
 className={`w-20 h-16 rounded-xl border-[2px] overflow-hidden flex-shrink-0 transition-all ${mainImage === img ? 'border-[#222222] dark:border-white' : 'border-transparent hover:border-[#cccccc]'}`}
 >
 <img src={img} alt="" className="w-full h-full object-cover" />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Right: Details & Actions */}
 <div className="flex flex-col">
 <div className="mb-2 flex items-center gap-2">
 <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text2)]">{product.category}</span>
 <span className="w-1 h-1 rounded-full bg-[#cccccc]"></span>
 <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text2)]">{product.sector}</span>
 </div>
 
 <h1 className="text-3xl md:text-4xl font-black text-[var(--text)] tracking-tight mb-6">
 {product.name}
 </h1>

 {/* Seller Row */}
 <div className="flex items-center gap-4 bg-[var(--card-bg)] bg-[var(--card-bg)] p-4 rounded-2xl border-[0.5px] border-[var(--border)] mb-8">
 <div className="w-12 h-12 bg-[var(--bg)] dark:bg-[var(--text)] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
 {product.seller?.avatar_url ? (
 <img src={product.seller.avatar_url} alt="" className="w-full h-full object-cover" />
 ) : (
 <User className="w-5 h-5 text-[var(--text2)]" />
 )}
 </div>
 <div className="flex-grow">
 <p className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5">
 {product.seller?.full_name || 'Anonymous'}
 <ShieldCheck className="w-4 h-4 text-emerald-500" />
 </p>
 <p className="text-xs text-[var(--text2)]">Verified Founder</p>
 </div>
 {product.pitch && (
 <Link href={`/pitch/${product.pitch.id}`} className="text-xs font-bold text-[var(--text)] hover:underline flex items-center gap-1">
 View their startup <ArrowRight className="w-3 h-3" />
 </Link>
 )}
 </div>

 {/* Price Area */}
 <div className="mb-8">
 {isCustom ? (
 <div>
 <p className="text-[var(--text2)] text-[11px] font-bold uppercase tracking-widest mb-1">Custom Project Starts From</p>
 <span className="text-4xl font-black text-[var(--text)] ">â‚¹{product.price?.toLocaleString()}</span>
 </div>
 ) : (
 <div className="flex items-end gap-3">
 <span className="text-4xl font-black text-[var(--text)] ">
 â‚¹{(product.discount_price || product.price)?.toLocaleString()}
 </span>
 {isDeal && (
 <span className="text-lg text-[var(--text2)] line-through font-medium mb-1">
 â‚¹{product.price?.toLocaleString()}
 </span>
 )}
 </div>
 )}

 {isDeal && !isCustom && (
 <div className="mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-bold bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl inline-flex">
 <Clock className="w-4 h-4" /> Deal Ends Soon!
 </div>
 )}
 </div>

 {/* Buttons */}
 <div className="mt-auto space-y-3">
 {isCustom ? (
 <>
 <button onClick={handleRequestWork} className="w-full bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/10">
 Request Work
 </button>
 </>
 ) : (
 <div className="flex gap-3">
 <button 
 onClick={handleAddToCart}
 disabled={isAddingToCart || addedToCart}
 className="flex-1 border-[1.5px] border-[#222222] dark:border-white text-[var(--text)] py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-[var(--bg)] dark:hover:bg-[var(--text)] transition-colors disabled:opacity-50"
 >
 {addedToCart ? 'Added âœ“' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
 </button>
 <button 
 onClick={handleBuyNow}
 disabled={isAddingToCart || addedToCart || isCheckingOut}
 className="flex-1 bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/10 disabled:opacity-50"
 >
 {isCheckingOut ? 'Checking out...' : 'Buy Now'}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* TABS */}
 <div className="bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[24px] border-[0.5px] border-[var(--border)] overflow-hidden">
 <div className="flex border-b-[0.5px] border-[var(--border)] overflow-x-auto hide-scrollbar">
 {['description', 'reviews', 'qa'].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab as any)}
 className={`px-8 py-5 text-sm font-bold capitalize whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-[#222222] dark:border-white text-[var(--text)] ' : 'border-transparent text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)]'}`}
 >
 {tab === 'qa' ? 'Q&A' : tab} 
 {tab === 'reviews' && reviews.length > 0 && ` (${reviews.length})`}
 </button>
 ))}
 </div>

 <div className="p-8">
 {/* Description Tab */}
 {activeTab === 'description' && (
 <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
 <div className="whitespace-pre-wrap text-[var(--text2)] leading-relaxed">
 {product.description || 'No description provided.'}
 </div>
 {product.category === 'Software' && (
 <div className="mt-8 pt-8 border-t-[0.5px] border-[var(--border)] ">
 <h3 className="font-bold text-[var(--text)] mb-4">Tech Stack</h3>
 <div className="flex gap-2 flex-wrap">
 <span className="bg-[var(--bg)] text-[var(--text2)] px-3 py-1.5 rounded-lg text-xs font-bold">Next.js</span>
 <span className="bg-[var(--bg)] text-[var(--text2)] px-3 py-1.5 rounded-lg text-xs font-bold">Supabase</span>
 <span className="bg-[var(--bg)] text-[var(--text2)] px-3 py-1.5 rounded-lg text-xs font-bold">Tailwind CSS</span>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Reviews Tab */}
 {activeTab === 'reviews' && (
 <div className="space-y-8">
 {/* Developer Sandbox Control Banner */}
 <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
 <div className="space-y-1">
 <p className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-tight flex items-center gap-1.5">
 ðŸ”§ Review System Demo Sandbox
 </p>
 <p className="text-xs text-amber-700 dark:text-amber-500 font-medium">
 Simulate a mock purchaser account and seeded verified reviews to test the interface without database setups.
 </p>
 </div>
 <button
 onClick={() => toggleDemoMode()}
 className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex-shrink-0 ${
 isDemoMode 
 ? 'bg-amber-600 text-[var(--text)] hover:bg-amber-700' 
 : 'bg-[var(--card-bg)] dark:bg-[var(--text)] border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40'
 }`}
 >
 {isDemoMode ? 'Deactivate Demo' : 'Activate Demo'}
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b-[0.5px] border-[var(--border)] items-center">
 {/* Big Rating Summary */}
 <div className="text-center md:border-r-[0.5px] border-[var(--border)] py-2">
 <p className="text-6xl font-black text-[var(--text)] ">
 {product.average_rating > 0 ? product.average_rating.toFixed(1) : '0'}
 </p>
 <div className="flex items-center justify-center gap-1 my-2 text-amber-400">
 {[1,2,3,4,5].map(star => (
 <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.average_rating || 0) ? 'fill-current' : 'text-gray-200 dark:text-[var(--text)]'}`} />
 ))}
 </div>
 <p className="text-xs text-[var(--text2)] font-bold uppercase tracking-wider">
 {product.review_count || 0} reviews
 </p>
 </div>

 {/* Rating Breakdown Bar Chart */}
 <div className="space-y-2">
 {[5, 4, 3, 2, 1].map((stars) => {
 const pct = getPercentage(stars as any);
 return (
 <div key={stars} className="flex items-center gap-3 text-xs">
 <span className="w-8 text-right font-bold text-[var(--text3)] ">{stars}â˜…</span>
 <div className="flex-grow h-2 bg-[var(--bg)] rounded-full overflow-hidden">
 <div 
 className="h-full bg-amber-400 rounded-full transition-all duration-500" 
 style={{ width: `${pct}%` }}
 ></div>
 </div>
 <span className="w-8 text-right font-bold text-gray-400 dark:text-[var(--text3)]">{pct}%</span>
 </div>
 );
 })}
 </div>

 {/* Actions Column: Write Review Button or Eligibility Note */}
 <div className="flex flex-col items-center justify-center p-4">
 {unreviewedOrders.length > 0 ? (
 <div className="text-center space-y-2 w-full">
 <button
 onClick={() => {
 setReviewRating(0);
 setReviewComment('');
 setIsReviewModalOpen(true);
 }}
 className="w-full bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-md"
 >
 Write a Review
 </button>
 <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
 âœ“ Fulfilled Order Available
 </p>
 </div>
 ) : (
 <div className="text-center space-y-1.5 max-w-[200px]">
 <p className="text-xs text-[var(--text2)] font-bold">
 Only customers with a fulfilled order for this product can write a review.
 </p>
 {currentUser && (
 <p className="text-[10px] text-[#aaaaaa] font-medium">
 No unreviewed orders found.
 </p>
 )}
 </div>
 )}
 </div>
 </div>

 <div className="space-y-6">
 {reviews.length === 0 ? (
 <p className="text-[var(--text2)] text-center py-8">No reviews yet.</p>
 ) : (
 reviews.map(review => (
 <div key={review.id} className="space-y-3 p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)]/40 /40 shadow-sm">
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-[var(--bg)] rounded-full flex items-center justify-center overflow-hidden">
 {review.buyer?.avatar_url ? <img src={review.buyer.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[var(--text2)]" />}
 </div>
 <div>
 <p className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
 {review.buyer?.full_name || 'Anonymous'}
 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3" /> Verified Purchase âœ“
 </span>
 </p>
 <p className="text-xs text-[var(--text2)]">{new Date(review.created_at).toLocaleDateString()}</p>
 </div>
 </div>
 <div className="flex items-center gap-0.5 text-amber-400">
 {[1,2,3,4,5].map(star => <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'text-gray-200 dark:text-[var(--text)]'}`} />)}
 </div>
 </div>
 <p className="text-sm text-[var(--text2)] ">{review.comment}</p>
 
 {review.seller_reply && (
 <div className="ml-8 mt-3 bg-[var(--bg)] dark:bg-[var(--text)] p-4 rounded-xl border-l-2 border-[#222222] dark:border-white">
 <p className="text-xs font-bold text-[var(--text)] mb-1">Reply from Founder</p>
 <p className="text-sm text-[var(--text2)] ">{review.seller_reply}</p>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>
 )}


 {/* Q&A Tab */}
 {activeTab === 'qa' && (
 <div className="space-y-8">
 {currentUser ? (
 <div className="bg-[var(--bg)] dark:bg-[var(--text)] p-6 rounded-2xl">
 <h3 className="font-bold text-[var(--text)] mb-4">Ask a question</h3>
 <div className="flex gap-3">
 <input 
 type="text" 
 value={newQuestion}
 onChange={(e) => setNewQuestion(e.target.value)}
 placeholder="What would you like to know about this product?" 
 className="flex-grow px-4 py-2.5 rounded-xl border-[0.5px] border-[var(--border)] dark:border-[#444444] text-sm bg-[var(--card-bg)] focus:outline-none focus:ring-1 focus:ring-[#222222] "
 />
 <button 
 onClick={submitQuestion}
 disabled={!newQuestion.trim() || submittingQuestion}
 className="bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
 >
 {submittingQuestion ? 'Posting...' : 'Ask'}
 </button>
 </div>
 </div>
 ) : (
 <div className="bg-[var(--bg)] dark:bg-[var(--text)] p-6 rounded-2xl text-center">
 <p className="text-sm text-[var(--text2)] mb-3">Please log in to ask a question.</p>
 <Link href="/login" className="inline-block bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] dark:border-[#444444] px-6 py-2 rounded-xl text-sm font-bold text-[var(--text)] ">
 Login
 </Link>
 </div>
 )}

 <div className="space-y-6">
 {productQa.length === 0 ? (
 <p className="text-[var(--text2)] text-center py-8">No questions asked yet. Be the first!</p>
 ) : (
 productQa.map((qa: any, idx: number) => (
 <div key={idx} className="border-b-[0.5px] border-[var(--border)] pb-6 last:border-0 last:pb-0">
 <div className="flex gap-3 mb-3">
 <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">Q</div>
 <div>
 <p className="text-sm font-bold text-[var(--text)] ">{qa.question}</p>
 <p className="text-xs text-[var(--text2)] mt-0.5">Asked by {qa.user_name} on {new Date(qa.date).toLocaleDateString()}</p>
 </div>
 </div>
 {qa.answer && (
 <div className="flex gap-3 ml-6">
 <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">A</div>
 <div>
 <p className="text-sm text-[var(--text2)] ">{qa.answer}</p>
 <p className="text-xs text-[var(--text2)] mt-0.5">Founder Reply</p>
 </div>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* RELATED PRODUCTS */}
 {relatedProducts.length > 0 && (
 <div>
 <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight mb-6">More in {product.category}</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
 {relatedProducts.map(rel => (
 <Link href={`/marketplace/${rel.id}`} key={rel.id} className="bg-[var(--card-bg)] bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[24px] overflow-hidden group hover:shadow-xl transition-all flex flex-col relative">
 <div className="aspect-video bg-[var(--bg)] dark:bg-[var(--text)] relative overflow-hidden">
 {rel.images_urls?.[0] ? (
 <img src={rel.images_urls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[var(--text3)] dark:text-[var(--text2)]">
 <ShoppingBag className="w-8 h-8" />
 </div>
 )}
 </div>
 <div className="p-4 flex flex-col flex-grow">
 <h3 className="font-bold text-[var(--text)] text-sm mb-1 line-clamp-1">{rel.name}</h3>
 <p className="text-xs text-[var(--text2)] mb-3 line-clamp-1">By {rel.seller?.full_name}</p>
 <div className="mt-auto flex items-baseline gap-2">
 <span className="font-black text-[var(--text)] ">â‚¹{(rel.discount_price || rel.price).toLocaleString()}</span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 )}

 </div>

 {/* REQUEST MODAL */}
 {isRequestModalOpen && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
 <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 p-2 bg-[var(--bg)] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#444444] transition-colors">
 <X className="w-4 h-4 text-[var(--text2)]" />
 </button>
 <div className="p-8">
 <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight mb-2">Request Custom Build</h2>
 <p className="text-sm text-[var(--text2)] mb-6">This is a product inquiry, not an investment discussion. The founder will respond to your project request.</p>
 <input value={requestName} onChange={(e) => setRequestName(e.target.value)} placeholder="Your name" className="mb-3 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none " />
 
 <textarea 
 rows={5}
 value={requirements}
 onChange={e => setRequirements(e.target.value)}
 placeholder="Project description"
 className="w-full px-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[var(--text)] mb-3 resize-none"
 ></textarea>
 <input value={requestBudget} onChange={(e) => setRequestBudget(e.target.value)} placeholder="Budget range (â‚¹ / $)" className="mb-3 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none " />
 <input value={requestTimeline} onChange={(e) => setRequestTimeline(e.target.value)} placeholder="Timeline needed" className="mb-3 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none " />
 <input value={requestEmail} onChange={(e) => setRequestEmail(e.target.value)} placeholder="Contact email" type="email" className="mb-6 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none " />
 
 <button 
 onClick={submitRequest}
 disabled={submittingRequest || !requirements.trim()}
 className="w-full bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
 >
 {submittingRequest ? 'Sending...' : 'Send Request'}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* REVIEW MODAL */}
 {isReviewModalOpen && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl relative border-[0.5px] border-[var(--border)] animate-in fade-in zoom-in-95 duration-200">
 <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4 p-2 bg-[var(--bg)] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#444444] transition-colors">
 <X className="w-4 h-4 text-[var(--text2)]" />
 </button>
 <div className="p-8">
 <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight mb-2">Write a Review</h2>
 <p className="text-sm text-[var(--text2)] mb-6">Share your experience with <strong>{product.name}</strong>. Your feedback helps other buyers make informed decisions.</p>
 
 {/* Star Selector */}
 <div className="mb-6 text-center">
 <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest mb-2">Your Rating</p>
 <div className="flex justify-center gap-2">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setReviewRating(star)}
 onMouseEnter={() => setHoverRating(star)}
 onMouseLeave={() => setHoverRating(0)}
 className="p-1 hover:scale-110 transition-transform focus:outline-none"
 >
 <Star 
 className={`w-10 h-10 transition-colors ${
 star <= (hoverRating || reviewRating) 
 ? 'text-amber-400 fill-current' 
 : 'text-gray-200 dark:text-[var(--text)]'
 }`}
 />
 </button>
 ))}
 </div>
 </div>

 {/* Text Area */}
 <div className="mb-6">
 <div className="flex justify-between items-center mb-1.5">
 <label className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest">Review Comments</label>
 <span className={`text-xs font-medium ${
 reviewComment.trim().length < 10 || reviewComment.length > 500
 ? 'text-amber-500' 
 : 'text-emerald-500'
 }`}>
 {reviewComment.length} / 500 chars (min 10)
 </span>
 </div>
 <textarea 
 rows={4}
 value={reviewComment}
 onChange={e => setReviewComment(e.target.value)}
 placeholder="Tell us what you liked or disliked about the product... (10-500 characters)"
 className="w-full px-4 py-3 bg-[var(--bg)] border-[0.5px] border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[var(--text)] resize-none"
 ></textarea>
 </div>
 
 <button 
 onClick={submitReview}
 disabled={submittingReview || reviewRating === 0 || reviewComment.trim().length < 10 || reviewComment.length > 500}
 className="w-full bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
 >
 {submittingReview ? 'Submitting...' : 'Submit Review'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}