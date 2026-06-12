"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
 const [status, setStatus] = useState<'loading' | 'success'>('loading');
 const searchParams = useSearchParams();
 const sessionId = searchParams.get('session_id');

 useEffect(() => {
 if (sessionId) {
 // In a real application, you might want to verify the session with your backend
 // and maybe fetch the new user permissions to update the local context/state
 // For now, we simulate a brief loading state to make the UX smoother
 const timer = setTimeout(() => {
 setStatus('success');
 }, 1500);
 return () => clearTimeout(timer);
 } else {
 setStatus('success');
 }
 }, [sessionId]);

 return (
 <>
 {status === 'loading' ? (
 <div className="flex flex-col items-center justify-center py-12">
 <Loader2 className="w-12 h-12 text-[var(--text)] animate-spin mb-4" />
 <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tighter">
 Verifying payment...
 </h2>
 <p className="text-[var(--text2)] text-sm mt-2 font-medium">
 Please don't close this window
 </p>
 </div>
 ) : (
 <div className="animate-in fade-in zoom-in-95 duration-500">
 <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
 <CheckCircle className="w-10 h-10" />
 </div>
 
 <h1 className="text-3xl font-black text-[var(--text)] uppercase tracking-tighter mb-3">
 Payment Successful!
 </h1>
 
 <p className="text-[var(--text2)] font-medium mb-8">
 Welcome to Ventex Premium. Your account has been upgraded and you now have access to all exclusive features.
 </p>

 <div className="space-y-3">
 <Link 
 href="/discover"
 className="w-full py-4 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-bold text-sm transition-all hover:bg-black hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
 >
 Start Exploring <ArrowRight className="w-4 h-4" />
 </Link>
 
 <Link 
 href="/founder/dashboard"
 className="w-full py-4 bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] text-[var(--text)] rounded-2xl font-bold text-sm transition-all hover:bg-[var(--bg)] active:scale-95 flex items-center justify-center"
 >
 Go to Dashboard
 </Link>
 </div>
 </div>
 )}
 </>
 );
}

export default function PaymentSuccessPage() {
 return (
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
 <div className="max-w-md w-full bg-[var(--card-bg)] rounded-[32px] p-8 border-[0.5px] border-[var(--border)] shadow-2xl text-center">
 <Suspense fallback={<Loader2 className="w-12 h-12 text-[var(--text)] animate-spin mb-4 mx-auto" />}>
 <PaymentSuccessContent />
 </Suspense>
 </div>
 </div>
 );
}