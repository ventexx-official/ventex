'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateDealCode, buildWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

interface BuyViaWhatsAppProps {
  product: {
    id: string;
    name: string;
    category?: string;
    type?: string;
    price: number; // in paise
    seller_id: string;
  };
  buyer: {
    id?: string;
    name: string;
    email: string;
  } | null;
}

export default function BuyViaWhatsApp({ product, buyer }: BuyViaWhatsAppProps) {
  const [loading, setLoading] = useState(false);
  const [dealCode, setDealCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noPhone, setNoPhone] = useState(false);

  const handleBuy = async () => {
    if (!buyer) return;
    setLoading(true);
    setError(null);

    try {
      const code = generateDealCode(product.id);
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/purchase-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          deal_code: code,
          product_id: product.id,
          buyer_email: buyer.email,
          buyer_name: buyer.name,
          seller_id: product.seller_id,
        }),
      });

      const data = await res.json();

      if (!data.sellerPhone) {
        setNoPhone(true);
        setLoading(false);
        return;
      }

      const message = buildWhatsAppMessage({
        productName: product.name,
        productCategory: product.category || product.type || 'Digital Product',
        priceInr: product.price,
        productId: product.id,
        dealCode: code,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
      });

      openWhatsApp(data.sellerPhone, message);
      setDealCode(code);
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!buyer) {
    return (
      <a
        href="/login"
        className="w-full flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--bg)] px-6 py-4 rounded-2xl font-bold text-sm hover:opacity-80 transition-opacity"
      >
        Login to purchase
      </a>
    );
  }

  if (noPhone) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-[var(--bg2)] text-[var(--text3)] px-6 py-4 rounded-2xl font-bold text-sm cursor-not-allowed opacity-60"
      >
        <AlertCircle className="w-4 h-4" />
        Contact Unavailable
      </button>
    );
  }

  if (dealCode) {
    return (
      <div className="space-y-3">
        <div className="w-full flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl font-bold text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>WhatsApp opened · Deal code: <span className="font-black font-mono">{dealCode}</span></span>
        </div>
        <p className="text-xs text-[var(--text2)] text-center">
          Payment arranged directly with seller. Ventexx does not process payments.
        </p>
        <button
          onClick={handleBuy}
          className="w-full flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--text2)] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[var(--bg2)] transition-colors"
        >
          Open WhatsApp again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-[#20b858] active:scale-95 transition-all shadow-lg shadow-[#25D366]/20 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
        {loading ? 'Opening WhatsApp...' : 'Buy via WhatsApp'}
      </button>
      <p className="text-xs text-[var(--text2)] text-center">
        Direct seller transaction · Ventexx verified listing
      </p>
    </div>
  );
}
