"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoResult, setPromoResult] = useState<{
    success: boolean;
    discountPct: number;
    codeId: string;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:product_id (
            id, name, price, discount_price, deal_end_date, images_urls, category, type,
            seller:seller_id ( full_name )
          )
        `)
        .eq('user_id', session.user.id)
        .order('added_at', { ascending: false });

      if (data) {
        setCartItems(data);
      }
      setLoading(false);
    };

    fetchCart();
  }, [router]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', id);
    if (error) alert("Could not update quantity.");
  };

  const removeItem = async (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    await supabase.from('cart_items').delete().eq('id', id);
    window.dispatchEvent(new Event('cart_updated'));
  };

  const getActivePrice = useCallback((product: any) => {
    const now = new Date();
    if (product.discount_price && product.deal_end_date && new Date(product.deal_end_date) > now) {
      return product.discount_price;
    }
    return product.price;
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + (getActivePrice(item.product) * item.quantity);
    }, 0);
  }, [cartItems, getActivePrice]);

  const discountPct = promoResult?.discountPct || 0;
  const discountAmount = useMemo(() => Math.round((subtotal * discountPct) / 100), [subtotal, discountPct]);
  const total = subtotal - discountAmount;

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Real promo validation Ã¢â€â‚¬Ã¢â€â‚¬ */
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setPromoError('');
    setPromoResult(null);

    const productIds = cartItems.map((item) => item.product?.id).filter(Boolean);

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), productIds }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setPromoError(data.error || 'Invalid promo code.');
      } else {
        setPromoResult({
          success: true,
          discountPct: data.discountPct,
          codeId: data.codeId,
          message: data.message,
        });
      }
    } catch {
      setPromoError('Could not validate promo code. Please try again.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoResult(null);
    setPromoError('');
    setPromoCode('');
  };

  /* Ã¢â€â‚¬Ã¢â€â‚¬ Checkout Ã¢â€â‚¬Ã¢â€â‚¬ */
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/cart');
        return;
      }

      const itemsPayload = cartItems.map(item => ({
        id: item.id,
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/marketplace/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          cartItems: itemsPayload,
          promoCodeId: promoResult?.codeId || null,
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
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] pb-24">
      {/* HEADER */}
      <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-[#222222] dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Your Cart
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {cartItems.length === 0 ? (
          <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[32px] p-16 text-center shadow-xl shadow-black/5">
            <div className="w-24 h-24 bg-[#F2F2F0] dark:bg-[#222222] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-[#888888]" />
            </div>
            <h2 className="text-2xl font-black text-[#222222] dark:text-white mb-2 tracking-tight">Your cart is empty</h2>
            <p className="text-[#888888] mb-8 max-w-md mx-auto">Looks like you haven't added any products, templates, or services to your cart yet.</p>
            <Link 
              href="/marketplace" 
              className="inline-flex items-center gap-2 bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/10"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* ITEMS LIST */}
            <div className="flex-grow space-y-4">
              {cartItems.map((item) => {
                const now = new Date();
                const product = item.product;
                const isHardware = product.category === 'Hardware';
                const itemPrice = getActivePrice(product);
                const isDeal = product.discount_price && product.deal_end_date && new Date(product.deal_end_date) > now;

                return (
                  <div key={item.id} className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-sm">
                    {/* Image */}
                    <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-[#F2F2F0] dark:bg-[#222222] rounded-xl overflow-hidden flex-shrink-0 relative">
                      {product.images_urls?.[0] ? (
                        <img src={product.images_urls[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#cccccc]">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                      {isDeal && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">
                          {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/marketplace/${product.id}`} className="font-bold text-lg text-[#222222] dark:text-white hover:underline decoration-2 underline-offset-2 mb-1 line-clamp-2">
                            {product.name}
                          </Link>
                          <p className="text-sm text-[#888888] flex items-center gap-1.5 mb-2">
                            By {product.seller?.full_name || 'Anonymous'} <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          </p>
                          <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#888888] dark:text-gray-300 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-[#888888] hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-6 flex items-end justify-between">
                        {/* Quantity */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#888888] uppercase tracking-widest">Qty</span>
                          {isHardware ? (
                            <div className="flex items-center bg-[#F2F2F0] dark:bg-[#222222] rounded-lg p-1 border-[0.5px] border-[#e5e5e5] dark:border-[#333333]">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-[var(--card-bg)] dark:hover:bg-[#333333] rounded transition-colors text-[#222222] dark:text-white"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="w-8 text-center text-sm font-bold text-[#222222] dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-[var(--card-bg)] dark:hover:bg-[#333333] rounded transition-colors text-[#222222] dark:text-white"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <div className="bg-[#F2F2F0] dark:bg-[#222222] rounded-lg px-4 py-1.5 border-[0.5px] border-[#e5e5e5] dark:border-[#333333]">
                              <span className="text-sm font-bold text-[#888888]">1 (Digital)</span>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {isDeal && (
                            <div className="text-xs text-[#888888] line-through font-medium mb-0.5">
                              Ã¢â€šÂ¹{(product.price * item.quantity).toLocaleString()}
                            </div>
                          )}
                          <div className="text-xl font-black text-[#222222] dark:text-white">
                            Ã¢â€šÂ¹{(itemPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[32px] p-8 sticky top-24 shadow-xl shadow-black/5">
                <h2 className="text-xl font-black text-[#222222] dark:text-white uppercase tracking-tight mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 pb-6 border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#888888] font-medium">Subtotal ({cartItems.length} items)</span>
                    <span className="text-[#222222] dark:text-white font-bold">Ã¢â€šÂ¹{subtotal.toLocaleString()}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-sm text-emerald-500">
                      <span className="font-medium flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Promo ({discountPct}% off)
                      </span>
                      <span className="font-bold">-Ã¢â€šÂ¹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#888888] font-medium">Platform Fee</span>
                    <span className="text-emerald-500 font-bold">Waived</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm font-bold text-[#222222] dark:text-white uppercase tracking-widest">Total</span>
                  <div className="text-right">
                    {discountPct > 0 && (
                      <div className="text-xs text-[#888888] line-through font-medium">Ã¢â€šÂ¹{subtotal.toLocaleString()}</div>
                    )}
                    <span className="text-3xl font-black text-[#222222] dark:text-white tracking-tight">Ã¢â€šÂ¹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="mb-6">
                  {promoResult ? (
                    /* Applied state */
                    <div className="bg-emerald-50 border-[0.5px] border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-emerald-700">{promoResult.discountPct}% off applied!</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{promoResult.codeId ? promoCode.toUpperCase() : ''}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-emerald-600 hover:text-red-500 transition-colors p-1 rounded"
                        title="Remove promo"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Input state */
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888888]" />
                          <input 
                            type="text" 
                            placeholder="Promo code" 
                            value={promoCode}
                            onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                            className="w-full pl-10 pr-4 py-3 bg-[#F2F2F0] dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white text-[#222222] dark:text-white uppercase font-bold tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                          />
                        </div>
                        <button 
                          onClick={handleApplyPromo}
                          disabled={applyingPromo || !promoCode.trim()}
                          className="px-4 py-3 bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-[var(--bg3)] transition-colors disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
                        >
                          {applyingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          {applyingPromo ? '' : 'Apply'}
                        </button>
                      </div>
                      {promoError && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 border-[0.5px] border-red-200 px-3 py-2 rounded-xl">
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          {promoError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] py-4 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/10 disabled:opacity-50"
                >
                  {checkingOut ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Session...</>
                  ) : (
                    <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#888888] font-medium">
                  <ShieldCheck className="w-4 h-4" /> Secure checkout powered by Stripe
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}