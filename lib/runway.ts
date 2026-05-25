export function getRunwayDays(roundClosesAt: string | null | undefined): number | null {
  if (!roundClosesAt) return null;
  const closes = new Date(roundClosesAt).getTime();
  const now = Date.now();
  if (closes <= now) return null;
  return Math.ceil((closes - now) / 86400000);
}

export function getRunwayCountdown(roundClosesAt: string | null | undefined): {
  days: number;
  hours: number;
} | null {
  if (!roundClosesAt) return null;
  const closes = new Date(roundClosesAt).getTime();
  const now = Date.now();
  if (closes <= now) return null;
  const diff = closes - now;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
  };
}

export function getRunwayProgress(
  createdAt: string | null | undefined,
  roundClosesAt: string | null | undefined
): number {
  if (!createdAt || !roundClosesAt) return 0;
  const start = new Date(createdAt).getTime();
  const end = new Date(roundClosesAt).getTime();
  const now = Date.now();
  if (end <= start) return 0;
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}

export function shouldShowRunway(
  isRaising: boolean | null | undefined,
  roundClosesAt: string | null | undefined
): boolean {
  if (!isRaising || !roundClosesAt) return false;
  return new Date(roundClosesAt).getTime() > Date.now();
}
