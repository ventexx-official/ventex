"use client";
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="text-center w-full max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-black text-[var(--text)] mb-2">Access Restricted</h1>
        <p className="text-[var(--text2)] mb-8">This area is restricted to a different account role or you do not have permission to view this page.</p>
        <Link href="/auth/callback" className="bg-[var(--text)] text-[var(--bg)] px-8 py-3 rounded-md font-bold hover:opacity-80 transition-colors inline-block">
          Go to my dashboard &rarr;
        </Link>
      </div>
    </div>
  );
}
