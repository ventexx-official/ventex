"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Heart, ExternalLink, ArrowRight, Activity, Coffee } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function BuyerDashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUserProfile(profile);

      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`*, product:product_id (name, images_urls, type)`)
        .eq('buyer_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentOrders) setOrders(recentOrders);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--text)] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--card-bg)] flex flex-col hidden md:flex sticky top-0 h-screen shrink-0">
        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[var(--text)] leading-tight">Buyer Portal</h1>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider font-bold">Ventexx</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <Link href="/buyer/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--text)] text-[var(--bg)] font-medium transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/discover" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] font-medium transition-colors">
            <Activity className="w-4 h-4" />
            Discover Startups
          </Link>
          <Link href="/marketplace" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] font-medium transition-colors">
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] font-medium transition-colors">
            <ShoppingBag className="w-4 h-4" />
            My Purchases
          </Link>
          <div className="pt-4 mt-4 border-t border-[var(--border)]">
            <p className="px-3 mb-2 text-xs font-bold text-[var(--text3)] uppercase tracking-wider">Account</p>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] font-medium transition-colors">
              <Heart className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </nav>

        {/* Buy Me A Coffee Widget */}
        <div className="p-4 border-t border-[var(--border)]">
          <a 
            href="https://buymeacoffee.com/ventexx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#FFDD00] text-black font-bold hover:brightness-95 transition-all text-sm shadow-sm"
          >
            <Coffee className="w-4 h-4" />
            Support Ventex
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--card-bg)] p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-[var(--text)]">Buyer Portal</h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="p-6 md:p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-[var(--text)]">Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Buyer'}!</h2>
              <p className="text-[var(--text2)] mt-2">Discover, manage, and engage with your startup purchases.</p>
            </div>
            <div className="hidden md:block"><ThemeToggle /></div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/marketplace" className="group card p-6 flex items-start gap-4 hover:border-[var(--text)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)] group-hover:text-blue-500 transition-colors">Explore Marketplace</h3>
                <p className="text-sm text-[var(--text2)] mt-1">Find new software, services, and digital products from top startups.</p>
              </div>
            </Link>
            
            <Link href="/discover" className="group card p-6 flex items-start gap-4 hover:border-[var(--text)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)] group-hover:text-purple-500 transition-colors">Discover Startups</h3>
                <p className="text-sm text-[var(--text2)] mt-1">See who's building what and engage directly with the founders.</p>
              </div>
            </Link>
          </div>

          {/* Recent Purchases */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text)]">Recent Purchases</h3>
              <Link href="/orders" className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="card p-8 text-center flex flex-col items-center">
                <ShoppingBag className="w-12 h-12 text-[var(--text3)] mb-4" />
                <h3 className="font-bold text-[var(--text)] mb-2">No purchases yet</h3>
                <p className="text-sm text-[var(--text2)] max-w-md mb-6">When you buy products or services from startups on Ventexx, they will appear here.</p>
                <Link href="/marketplace" className="btn-primary">Browse Marketplace</Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map(order => (
                  <div key={order.id} className="card p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-[var(--bg2)] overflow-hidden shrink-0">
                      {order.product?.images_urls?.[0] ? (
                        <img src={order.product.images_urls[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text3)]">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[var(--text)] truncate">{order.product?.name || 'Unknown Product'}</h4>
                      <p className="text-sm text-[var(--text2)] capitalize">{order.product?.type || 'Product'}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--text)]">${order.amount}</div>
                      <div className="text-xs text-[var(--text3)]">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <Link href={`/orders`} className="p-2 hover:bg-[var(--bg2)] rounded-lg transition-colors ml-2">
                      <ExternalLink className="w-5 h-5 text-[var(--text2)]" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
