"use client";

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function CartPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[500px] shadow-sm text-center">
        <ShoppingBag className="w-12 h-12 text-[var(--text3)] opacity-40 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[var(--text)]">Your Cart</h1>
        <p className="mt-2 text-sm text-[var(--text2)]">Your cart is currently empty.</p>
        
        <div className="mt-8">
          <Link href="/marketplace" className="btn-primary w-full">
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
