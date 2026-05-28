export type DealEnforcementState = {
  overdueDays: number;
  isSevenDayOverdue: boolean;
  isFourteenDayOverdue: boolean;
  isPartialUnlock: boolean;
  isLocked: boolean;
  isBanned: boolean;
  label: string;
};

export function getDealEnforcementState(deal: any, now = new Date()): DealEnforcementState {
  const dueAt = deal?.due_date ? new Date(deal.due_date) : null;
  const overdueDays = dueAt && !deal?.paid_at
    ? Math.max(0, Math.floor((now.getTime() - dueAt.getTime()) / 86400000))
    : 0;
  const partialUnlockUntil = deal?.partial_unlock_until ? new Date(deal.partial_unlock_until) : null;
  const isPartialUnlock = deal?.status === "partial_50_paid" && !!partialUnlockUntil && partialUnlockUntil > now;
  const isBanned = deal?.status === "banned" || overdueDays >= 14;
  const isSevenDayOverdue = overdueDays >= 7;
  const isFourteenDayOverdue = overdueDays >= 14;
  const isLocked = !isPartialUnlock && !deal?.paid_at && (isSevenDayOverdue || deal?.status === "fee_overdue" || deal?.status === "locked");

  return {
    overdueDays,
    isSevenDayOverdue,
    isFourteenDayOverdue,
    isPartialUnlock,
    isLocked,
    isBanned,
    label: isBanned
      ? "Full account ban pending post early access."
      : isPartialUnlock
        ? "Partial payment received. Conversation unlocks for 3 more days."
        : isLocked
          ? "Conversation paused — pending platform fee settlement."
          : "Fee collection activates post early access.",
  };
}
