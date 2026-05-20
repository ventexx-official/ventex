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
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Load product data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setCurrentUser(profile);
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
  const isCustom = product?.type === 'custom_work';

  const handleRequestWork = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // Check Ventex Access
    const hasAccess = currentUser.ventex_access || currentUser.investor_premium;
    const hasValidSub = currentUser.subscription_end_date && new Date(currentUser.subscription_end_date) > now;
    
    if (!hasAccess || !hasValidSub) {
      if (confirm("Ventex Access or Premium is required to request custom work. Upgrade now?")) {
        router.push('/pricing');
      }
      return;
    }

    setIsRequestModalOpen(true);
  };

  const submitRequest = async () => {
    if (!requirements.trim()) return;
    setSubmittingRequest(true);

    try {
      const { error: reqError } = await supabase.from('project_requests').insert({
        buyer_id: currentUser.id,
        seller_id: product.seller_id,
        product_id: product.id,
        requirements,
        status: 'pending'
      });

      if (reqError) throw reqError;

      // Notify seller
      await supabase.from('notifications').insert({
        user_id: product.seller_id,
        type: 'new_request',
        message: `New custom work request for ${product.name} from ${currentUser.full_name}`,
        link: `/founder/dashboard` // placeholder link
      });

      setIsRequestModalOpen(false);
      setRequirements('');
      alert("Request sent successfully! The founder has been notified.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;
    setSubmittingQuestion(true);

    try {
      const qObj = {
        id: crypto.randomUUID(),
        user_name: currentUser.full_name || 'Anonymous',
        question: newQuestion,
        answer: null,
        date: new Date().toISOString()
      };

      const currentQa = product.qa_data || [];
      const updatedQa = [...currentQa, qObj];

      const { error } = await supabase
        .from('products')
        .update({ qa_data: updatedQa })
        .eq('id', product.id);

      if (error) throw error;

      setProduct({ ...product, qa_data: updatedQa });
      setNewQuestion('');
    } catch (err: any) {
      alert("Error submitting question. (Ensure the qa_data column exists in the products table).");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 space-y-12">
        
        {/* TOP SECTION: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-video bg-white dark:bg-[#1a1a1a] rounded-[24px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] overflow-hidden flex items-center justify-center relative">
              {isDeal && (
                <span className="absolute top-4 left-4 bg-[#222222] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full z-10 shadow-lg flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                </span>
              )}
              {mainImage ? (
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-16 h-16 text-[#cccccc] dark:text-[#333333]" />
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
              <span className="text-[11px] font-black uppercase tracking-widest text-[#888888]">{product.category}</span>
              <span className="w-1 h-1 rounded-full bg-[#cccccc]"></span>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#888888]">{product.sector}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-[#222222] dark:text-white tracking-tight mb-6">
              {product.name}
            </h1>

            {/* Seller Row */}
            <div className="flex items-center gap-4 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border-[0.5px] border-[#e5e5e5] dark:border-[#333333] mb-8">
              <div className="w-12 h-12 bg-[#F2F2F0] dark:bg-[#222222] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.seller?.avatar_url ? (
                  <img src={product.seller.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#888888]" />
                )}
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold text-[#222222] dark:text-white flex items-center gap-1.5">
                  {product.seller?.full_name || 'Anonymous'}
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </p>
                <p className="text-xs text-[#888888]">Verified Founder</p>
              </div>
              {product.pitch && (
                <Link href={`/pitch/${product.pitch.id}`} className="text-xs font-bold text-[#222222] dark:text-white hover:underline flex items-center gap-1">
                  View their startup <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Price Area */}
            <div className="mb-8">
              {isCustom ? (
                <div>
                  <p className="text-[#888888] text-[11px] font-bold uppercase tracking-widest mb-1">Custom Project Starts From</p>
                  <span className="text-4xl font-black text-[#222222] dark:text-white">₹{product.price?.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black text-[#222222] dark:text-white">
                    ₹{(product.discount_price || product.price)?.toLocaleString()}
                  </span>
                  {isDeal && (
                    <span className="text-lg text-[#888888] line-through font-medium mb-1">
                      ₹{product.price?.toLocaleString()}
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
                  <button onClick={handleRequestWork} className="w-full bg-[#222222] dark:bg-white text-white dark:text-[#222222] py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/10">
                    Request Work
                  </button>
                  <p className="text-xs text-center text-[#888888] font-medium">Ventex Access required to discuss requirements.</p>
                </>
              ) : (
                <div className="flex gap-3">
                  <button className="flex-1 border-[1.5px] border-[#222222] dark:border-white text-[#222222] dark:text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-[#F2F2F0] dark:hover:bg-[#222222] transition-colors">
                    Add to Cart
                  </button>
                  <button className="flex-1 bg-[#222222] dark:bg-white text-white dark:text-[#222222] py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/10">
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] overflow-hidden">
          <div className="flex border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] overflow-x-auto hide-scrollbar">
            {['description', 'reviews', 'qa'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-5 text-sm font-bold capitalize whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-[#222222] dark:border-white text-[#222222] dark:text-white' : 'border-transparent text-[#888888] hover:text-[#222222] dark:hover:text-white'}`}
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
                <div className="whitespace-pre-wrap text-[#555555] dark:text-gray-300 leading-relaxed">
                  {product.description || 'No description provided.'}
                </div>
                {product.category === 'Software' && (
                  <div className="mt-8 pt-8 border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333]">
                    <h3 className="font-bold text-[#222222] dark:text-white mb-4">Tech Stack</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#555555] dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold">Next.js</span>
                      <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#555555] dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold">Supabase</span>
                      <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#555555] dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold">Tailwind CSS</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333]">
                  <div className="text-center">
                    <p className="text-5xl font-black text-[#222222] dark:text-white">{product.average_rating > 0 ? product.average_rating.toFixed(1) : '0'}</p>
                    <div className="flex items-center justify-center gap-1 my-2 text-amber-400">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= (product.average_rating || 0) ? 'fill-current' : 'text-gray-300 dark:text-[#444444]'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-[#888888] font-medium">{product.review_count || 0} reviews</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-[#888888] text-center py-8">No reviews yet.</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F2F2F0] rounded-full flex items-center justify-center overflow-hidden">
                              {review.buyer?.avatar_url ? <img src={review.buyer.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[#888888]" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#222222] dark:text-white flex items-center gap-2">
                                {review.buyer?.full_name || 'Anonymous'}
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                                </span>
                              </p>
                              <p className="text-xs text-[#888888]">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1,2,3,4,5].map(star => <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                          </div>
                        </div>
                        <p className="text-sm text-[#555555] dark:text-gray-300">{review.comment}</p>
                        
                        {review.seller_reply && (
                          <div className="ml-8 mt-3 bg-[#F2F2F0] dark:bg-[#222222] p-4 rounded-xl border-l-2 border-[#222222] dark:border-white">
                            <p className="text-xs font-bold text-[#222222] dark:text-white mb-1">Reply from Founder</p>
                            <p className="text-sm text-[#555555] dark:text-gray-300">{review.seller_reply}</p>
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
                  <div className="bg-[#F2F2F0] dark:bg-[#222222] p-6 rounded-2xl">
                    <h3 className="font-bold text-[#222222] dark:text-white mb-4">Ask a question</h3>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="What would you like to know about this product?" 
                        className="flex-grow px-4 py-2.5 rounded-xl border-[0.5px] border-[#e5e5e5] dark:border-[#444444] text-sm bg-white dark:bg-[#111111] focus:outline-none focus:ring-1 focus:ring-[#222222] dark:text-white"
                      />
                      <button 
                        onClick={submitQuestion}
                        disabled={!newQuestion.trim() || submittingQuestion}
                        className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                      >
                        {submittingQuestion ? 'Posting...' : 'Ask'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F2F2F0] dark:bg-[#222222] p-6 rounded-2xl text-center">
                    <p className="text-sm text-[#888888] mb-3">Please log in to ask a question.</p>
                    <Link href="/login" className="inline-block bg-white dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#444444] px-6 py-2 rounded-xl text-sm font-bold text-[#222222] dark:text-white">
                      Login
                    </Link>
                  </div>
                )}

                <div className="space-y-6">
                  {(!product.qa_data || product.qa_data.length === 0) ? (
                    <p className="text-[#888888] text-center py-8">No questions asked yet. Be the first!</p>
                  ) : (
                    product.qa_data.map((qa: any, idx: number) => (
                      <div key={idx} className="border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] pb-6 last:border-0 last:pb-0">
                        <div className="flex gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">Q</div>
                          <div>
                            <p className="text-sm font-bold text-[#222222] dark:text-white">{qa.question}</p>
                            <p className="text-xs text-[#888888] mt-0.5">Asked by {qa.user_name} on {new Date(qa.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {qa.answer && (
                          <div className="flex gap-3 ml-6">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">A</div>
                            <div>
                              <p className="text-sm text-[#555555] dark:text-gray-300">{qa.answer}</p>
                              <p className="text-xs text-[#888888] mt-0.5">Founder Reply</p>
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
            <h2 className="text-xl font-black text-[#222222] dark:text-white uppercase tracking-tight mb-6">More in {product.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <Link href={`/marketplace/${rel.id}`} key={rel.id} className="bg-white dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] overflow-hidden group hover:shadow-xl transition-all flex flex-col relative">
                  <div className="aspect-video bg-[#F2F2F0] dark:bg-[#222222] relative overflow-hidden">
                    {rel.images_urls?.[0] ? (
                      <img src={rel.images_urls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#cccccc] dark:text-[#444444]">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-[#222222] dark:text-white text-sm mb-1 line-clamp-1">{rel.name}</h3>
                    <p className="text-xs text-[#888888] mb-3 line-clamp-1">By {rel.seller?.full_name}</p>
                    <div className="mt-auto flex items-baseline gap-2">
                      <span className="font-black text-[#222222] dark:text-white">₹{(rel.discount_price || rel.price).toLocaleString()}</span>
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
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 p-2 bg-[#F2F2F0] dark:bg-[#333333] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#444444] transition-colors">
              <X className="w-4 h-4 text-[#888888]" />
            </button>
            <div className="p-8">
              <h2 className="text-xl font-black text-[#222222] dark:text-white uppercase tracking-tight mb-2">Request Custom Work</h2>
              <p className="text-sm text-[#888888] mb-6">Describe your requirements for <strong>{product.name}</strong>. The founder will review and reply with a formal quote.</p>
              
              <textarea 
                rows={5}
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="E.g., I need a custom payment gateway integration and a redesigned dashboard layout..."
                className="w-full px-4 py-3 bg-[#F2F2F0] dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[#222222] dark:text-white mb-6 resize-none"
              ></textarea>
              
              <button 
                onClick={submitRequest}
                disabled={submittingRequest || !requirements.trim()}
                className="w-full bg-[#222222] dark:bg-white text-white dark:text-[#222222] py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {submittingRequest ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
