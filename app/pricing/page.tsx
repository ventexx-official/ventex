"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Check, Star, Zap, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login?redirect=/pricing');
        return;
      }

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Checkout failed: Please check your API keys and configuration.');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      name: 'Free',
      description: 'Perfect for exploring the ecosystem',
      price: '₹0',
      period: 'forever',
      features: [
        'Browse public startup pitches',
        'View product marketplace',
        'Join community discussions',
        'Create a basic profile',
      ],
      buttonText: 'Get started free',
      buttonAction: () => router.push('/signup'),
      recommended: false,
      icon: Shield,
    },
    {
      name: 'Ventex Access',
      description: 'For active community members',
      price: '₹149',
      period: 'per month',
      plan: 'ventex_access',
      features: [
        'Everything in Free',
        'Discuss products directly',
        'Express investment interest',
        'Priority support',
        'Access to founder Q&As',
      ],
      buttonText: 'Get access',
      buttonAction: () => handleCheckout('ventex_access'),
      recommended: true,
      icon: Zap,
    },
    {
      name: 'Investor Premium',
      description: 'For serious angel investors',
      price: '₹1,499',
      period: 'per month',
      plan: 'investor_premium',
      features: [
        'Everything in Ventex Access',
        'Full financial teardowns',
        'Downloadable pitch decks',
        'Advanced deal flow tools',
        'Direct founder introductions',
      ],
      buttonText: 'Go Premium',
      buttonAction: () => handleCheckout('investor_premium'),
      recommended: false,
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F0] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#222222] tracking-tighter uppercase mb-4">
            Choose your access level
          </h1>
          <p className="text-lg text-[#888888] font-medium max-w-2xl mx-auto">
            Whether you're just exploring or ready to invest, we have a plan designed to help you succeed in the Ventex ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {tiers.map((tier, idx) => (
            <div 
              key={tier.name}
              className={`relative bg-white rounded-[32px] p-8 border-[0.5px] ${
                tier.recommended 
                  ? 'border-[#222222] shadow-2xl scale-100 md:scale-105 z-10' 
                  : 'border-[#e5e5e5] shadow-sm scale-100'
              } transition-all duration-300 flex flex-col h-full`}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#222222] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  Recommended
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  tier.recommended ? 'bg-[#222222] text-white' : 'bg-[#F2F2F0] text-[#222222]'
                }`}>
                  <tier.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-[#222222] mb-2">{tier.name}</h3>
                <p className="text-sm text-[#888888] font-medium h-10">{tier.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-[#222222]">{tier.price}</span>
                  <span className="text-sm text-[#888888] font-medium mb-2">/ {tier.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tier.recommended ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F2F2F0] text-[#222222]'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium text-[#222222] leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={tier.buttonAction}
                disabled={loading === tier.plan}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  tier.recommended
                    ? 'bg-[#222222] text-white hover:bg-black hover:shadow-lg'
                    : 'bg-[#F2F2F0] text-[#222222] hover:bg-[#e5e5e5]'
                } ${loading === tier.plan ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {loading === tier.plan ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {tier.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-[#888888] font-medium">
            Have questions about our plans? <Link href="/contact" className="text-[#222222] underline underline-offset-4 font-bold hover:text-black">Contact our support team</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
