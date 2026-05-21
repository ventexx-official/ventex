"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  AlertTriangle, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  MessageSquare,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function OrderDisputePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [reason, setReason] = useState('Not delivered');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchOrderAndUser = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      setCurrentUser(session.user);

      // Fetch the order details
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:product_id (
            id,
            name,
            images_urls,
            category
          ),
          seller:seller_id (
            id,
            full_name
          )
        `)
        .eq('id', id)
        .single();

      if (error || !orderData) {
        setOrder(null);
        setLoading(false);
        return;
      }

      // Check if current user is the buyer
      if (orderData.buyer_id !== session.user.id) {
        setOrder(null);
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setLoading(false);
    };

    if (id) fetchOrderAndUser();
  }, [id, router]);

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !currentUser || description.length < 20 || description.length > 1000) return;
    setSubmitting(true);

    try {
      // 1. Transactionally update order status to 'disputed'
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'disputed' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // 2. Create row in public.disputes
      const { error: disputeError } = await supabase
        .from('disputes')
        .insert({
          order_id: order.id,
          buyer_id: currentUser.id,
          seller_id: order.seller_id,
          reason,
          description: description.trim(),
          status: 'open'
        });

      if (disputeError) throw disputeError;

      // 3. Notify the seller in-app
      await supabase.from('notifications').insert({
        user_id: order.seller_id,
        type: 'order_disputed',
        message: `Dispute opened by buyer for product "${order.product?.name || 'purchased item'}". Payout frozen.`,
        link: `/founder/dashboard`
      });

      // 4. Create an admin alert log in notifications (system broadcast placeholder)
      await supabase.from('notifications').insert({
        user_id: order.seller_id, // we notify the seller of the system alert too
        type: 'admin_dispute_notice',
        message: `System Alert: Order ${order.id} has been flagged for admin review under dispute reason: "${reason}".`,
        link: `/founder/dashboard`
      });

      setIsSuccess(true);
    } catch (err: any) {
      alert("Error submitting dispute: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] py-16 px-6">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 border-[0.5px] border-[#e5e5e5] dark:border-[#333333] text-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-black text-[#222222] dark:text-white uppercase tracking-tight mb-2">Invalid Access</h1>
          <p className="text-[#888888] text-sm mb-6 leading-relaxed">
            We couldn't retrieve this order. Please verify that the URL is correct and that you are logged in to the account that purchased this item.
          </p>
          <Link href="/marketplace" className="inline-block bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black dark:hover:bg-gray-200 transition-colors">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isAlreadyDisputed = order.status === 'disputed';

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Link */}
        <Link href={`/marketplace/${order.product?.id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#888888] hover:text-[#222222] dark:hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Product
        </Link>

        {isSuccess ? (
          /* Success Screen */
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-10 border-[0.5px] border-[#e5e5e5] dark:border-[#333333] text-center shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-amber-500"></div>
            
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-red-500" />
            </div>

            <h1 className="text-2xl font-black text-[#222222] dark:text-white uppercase tracking-tight mb-2">Dispute Filed</h1>
            <p className="text-sm text-[#888888] max-w-md mx-auto mb-8 leading-relaxed">
              Your dispute for <strong>{order.product?.name}</strong> has been successfully submitted and logged. The seller's payout is frozen, and our team has been notified to conduct an admin review.
            </p>

            <div className="bg-[#F2F2F0] dark:bg-[#222222] p-5 rounded-2xl border-[0.5px] border-[#e5e5e5] dark:border-[#333333] text-left mb-8 space-y-2">
              <p className="text-xs font-bold text-[#888888] uppercase tracking-wider">Dispute Summary</p>
              <p className="text-sm text-[#222222] dark:text-white"><strong>Reason:</strong> {reason}</p>
              <p className="text-sm text-[#555555] dark:text-gray-300 italic">"{description}"</p>
            </div>

            <Link href="/marketplace" className="inline-block bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-md">
              Go to Marketplace
            </Link>
          </div>
        ) : isAlreadyDisputed ? (
          /* Already Disputed State */
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-10 border-[0.5px] border-[#e5e5e5] dark:border-[#333333] text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500"></div>
            
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>

            <h1 className="text-xl font-black text-[#222222] dark:text-white uppercase tracking-tight mb-2">Order Already Disputed</h1>
            <p className="text-sm text-[#888888] max-w-sm mx-auto mb-8 leading-relaxed">
              This purchase is already marked as disputed. The payout is frozen and is currently under review by our administration team.
            </p>

            <Link href="/marketplace" className="inline-block bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black dark:hover:bg-gray-200 transition-colors">
              Return to Marketplace
            </Link>
          </div>
        ) : (
          /* Dispute Form */
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
            
            <div className="p-8 md:p-10">
              
              {/* Product Info Block */}
              <div className="flex gap-4 items-center pb-6 border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] mb-8">
                <div className="w-14 h-14 bg-[#F2F2F0] dark:bg-[#222222] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {order.product?.images_urls?.[0] ? (
                    <img src={order.product.images_urls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-[#cccccc]" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">Dispute File</span>
                  <h2 className="font-bold text-[#222222] dark:text-white text-base leading-snug mt-1">{order.product?.name}</h2>
                  <p className="text-xs text-[#888888] mt-0.5">Seller: {order.seller?.full_name || 'Anonymous'}</p>
                </div>
              </div>

              {/* Warning Alert Banner */}
              <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex gap-3 items-start">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Freeze & Hold Warning</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
                    Initiating a dispute immediately freezes the payout distribution for this transaction. Both parties will have a chance to state their cases. Abuse of this mechanism may lead to account suspension.
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmitDispute} className="space-y-6">
                
                {/* Dispute Reason */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#888888] mb-2.5">Reason for Dispute</label>
                  <div className="relative">
                    <select
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F2F2F0] dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[#222222] dark:text-white cursor-pointer appearance-none"
                    >
                      <option value="Not delivered">Product Not Delivered</option>
                      <option value="Not as described">Product Not As Described / Broken</option>
                      <option value="Seller unresponsive">Seller Completely Unresponsive</option>
                      <option value="Other">Other Issues</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-[#cccccc] dark:border-[#444444] pl-3">
                      <ChevronRight className="w-4 h-4 text-[#888888] rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#888888]">Detailed Explanation</label>
                    <span className={`text-xs font-bold ${
                      description.length < 20 || description.length > 1000 
                        ? 'text-amber-500' 
                        : 'text-emerald-500'
                    }`}>
                      {description.length} / 1000 chars (min 20)
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a clear, detailed explanation of what went wrong, including what you expected, what you received, and any attempts to communicate with the seller..."
                    className="w-full px-4 py-3 bg-[#F2F2F0] dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[#222222] dark:text-white resize-none leading-relaxed"
                  ></textarea>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting || description.length < 20 || description.length > 1000}
                  className="w-full bg-[#222222] dark:bg-white text-white dark:text-[#222222] py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Initiating Dispute...' : 'File Dispute'}
                </button>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
