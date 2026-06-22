"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Package, Download, ExternalLink, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

export default function BuyerPurchases() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // In a real implementation, you would query an orders/purchases table.
      // For now, we will query orders where the user is the buyer.
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(*)')
        .eq('buyer_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPurchases(data);
      }
      setLoading(false);
    };

    fetchPurchases();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--text3)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">My Purchases</h1>
          <p className="text-[var(--text2)] mt-2">Access and manage the products you've acquired.</p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[32px] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Package className="w-16 h-16 text-[var(--text3)] mb-4" />
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">No purchases yet</h2>
            <p className="text-[var(--text2)] max-w-md mx-auto">When you buy digital products, SaaS templates, or agent codebases from the marketplace, they will appear here.</p>
            <Link href="/marketplace" className="mt-8 px-8 py-3 bg-[var(--text)] text-[var(--bg)] font-bold rounded-full hover:opacity-90 transition-opacity">
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {purchases.map((order) => (
              <div key={order.id} className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[24px] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-16 h-16 rounded-xl bg-[var(--bg2)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {order.products?.images_urls?.[0] ? (
                    <img src={order.products.images_urls[0]} alt={order.products.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-[var(--text3)]" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--text)]">{order.products?.name || 'Unknown Product'}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[var(--text2)]">
                    <span>Order #{order.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-bold text-[var(--text)]">${(order.amount / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-[var(--bg2)] text-[var(--text)] font-semibold rounded-xl hover:bg-[var(--bg3)] transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-[var(--text)] text-[var(--bg)] font-semibold rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2">
                    Details <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
