import { SITE_NAME } from "@/lib/brand";

export default function Loading() {
  const brandName = SITE_NAME.toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] flex flex-col justify-between p-6 sm:p-12">
      <div className="flex items-center justify-between">
        <div className="brand-lockup text-lg font-bold">
          <span>{brandName}</span>
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--smoke)]">
          LOADING
        </span>
      </div>

      <div className="max-w-xl my-auto py-12 flex flex-col items-center sm:items-start text-center sm:text-left mx-auto sm:mx-0">
        <div className="relative w-12 h-12 mb-8">
          <div className="absolute inset-0 rounded-full border border-line" />
          <div className="absolute inset-0 rounded-full border-t border-[var(--red)] animate-spin" />
          <div className="absolute inset-3 rounded-full bg-[var(--red)]/20 animate-pulse" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[var(--paper)] mb-2">
          Syncing signal...
        </h2>
        <p className="text-[var(--paper-dim)] text-sm max-w-xs">
          Loading the latest verified data from the network.
        </p>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-[var(--smoke)] uppercase border-t border-line pt-6">
        <span>{brandName}</span>
        <span className="status-dot animate-pulse" />
      </div>
    </div>
  );
}
