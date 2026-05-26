type InvestorResponseBadgeProps = {
  response_rate?: number | null;
};

export default function InvestorResponseBadge({ response_rate }: InvestorResponseBadgeProps) {
  const rate = Math.max(0, Math.min(100, Math.round(response_rate ?? 100)));

  if (rate >= 90) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
        Responds to {rate}% of founders ✓
      </span>
    );
  }

  if (rate >= 70) {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
        Responds to {rate}% of founders
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-black text-red-700">
      Low response rate ⚠
    </span>
  );
}
