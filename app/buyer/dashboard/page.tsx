"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Package, Star, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'buyer') {
        router.push('/dashboard');
        return;
      }

      setUserProfile(profile);
      setLoading(false);
    };

    checkUser();
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">Buyer Dashboard</h1>
          <p className="text-[var(--text2)] mt-2 text-lg">Welcome back, {userProfile?.full_name}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/marketplace" className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[24px] p-6 hover:bg-[var(--bg2)] transition-colors group">
            <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--text)] text-lg mb-1">Browse Marketplace</h3>
            <p className="text-[var(--text2)] text-sm">Discover and acquire digital products</p>
          </Link>

          <Link href="/buyer/purchases" className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[24px] p-6 hover:bg-[var(--bg2)] transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--text)] text-lg mb-1">My Purchases</h3>
            <p className="text-[var(--text2)] text-sm">Access your acquired products</p>
          </Link>

          <Link href="/saved-products" className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[24px] p-6 hover:bg-[var(--bg2)] transition-colors group">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--text)] text-lg mb-1">Saved Items</h3>
            <p className="text-[var(--text2)] text-sm">View products you've bookmarked</p>
          </Link>
        </div>

        {/* Recent Activity placeholder */}
        <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[32px] p-8 mt-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <TrendingUp className="w-12 h-12 text-[var(--text3)] mb-4" />
          <h2 className="text-xl font-bold text-[var(--text)]">Ready to acquire?</h2>
          <p className="text-[var(--text2)] mt-2 max-w-sm mx-auto">Explore the marketplace to find high-quality SaaS, AI agents, and digital products ready for handover.</p>
          <Link href="/marketplace" className="mt-6 px-6 py-3 bg-[var(--text)] text-[var(--bg)] font-bold rounded-full hover:opacity-90 transition-opacity">
            Go to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
