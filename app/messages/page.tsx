'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { DashboardShell } from '@/components/ui-kit/DashboardShell';

export default function MessagesPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--smoke)] mb-4 shadow-sm">
          <MessageSquare className="w-8 h-8 text-[var(--smoke)]" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] mb-2 font-semibold px-2 py-0.5 rounded bg-[var(--red)]/10 border border-[var(--red)]/20">
          Coming Soon
        </span>
        <h1 className="text-xl sm:text-2xl font-mono uppercase tracking-tight text-[var(--paper)] mb-2">
          Messaging is coming soon
        </h1>
        <p className="text-xs sm:text-sm text-[var(--smoke)] max-w-md mx-auto mb-6 leading-relaxed">
          Direct messaging between founders, investors, and prospective buyers will be available in an upcoming release.
        </p>
        <Link
          href="/founder/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium bg-[var(--card)] border border-[var(--line)] text-[var(--paper)] hover:border-[var(--red)] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>
    </DashboardShell>
  );
}
