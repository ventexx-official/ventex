"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BuyerGuard from '@/components/BuyerGuard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function SavedProducts() {
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from('saved_products')
        .select(`
          id,
          product_id,
          products ( id, name, description, price, product_type )
        `)
        .eq('user_id', session.user.id);
        
      if (data) setSavedProducts(data);
      setLoading(false);
    };
    fetchSaved();
  }, []);

  return (
    <BuyerGuard>
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <main className="max-w-[1200px] mx-auto p-6 md:p-8 mt-16">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/buyer/dashboard" className="text-sm font-bold text-[var(--text2)] hover:text-[var(--text)]">&larr; Back to Dashboard</Link>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Saved Products</h1>

          {loading ? (
             <div className="w-6 h-6 border-2 border-t-[#222] rounded-full animate-spin"></div>
          ) : savedProducts.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-12 text-center">
              <h3 className="text-lg font-bold text-[var(--text)] mb-2">No saved products yet</h3>
              <p className="text-[var(--text2)] mb-6">Products you save from the marketplace will appear here.</p>
              <Link href="/marketplace" className="bg-[var(--text)] text-[var(--bg)] px-6 py-2 rounded-full font-bold">Browse Marketplace</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProducts.map((item: any) => (
                <div key={item.id} className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-[var(--text)]">{item.products?.name}</h3>
                  <p className="text-sm text-[var(--text2)] mt-1">{item.products?.product_type}</p>
                  <p className="text-xl font-bold mt-4">${item.products?.price}</p>
                  <Link href={`/marketplace/${item.product_id}`} className="block mt-4 text-center border border-[var(--text)] text-[var(--text)] rounded-md py-2 font-bold hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
                    View Product
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </BuyerGuard>
  );
}
