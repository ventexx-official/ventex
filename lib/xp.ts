import type { SupabaseClient } from '@supabase/supabase-js';

export const XP_EVENTS = {
  profile_complete: { amount: 50, badge: 'Profile Complete ✓' },
  deck_upload: { amount: 75, badge: 'Pitch Deck 📑' },
  first_save: { amount: 100, badge: 'First Save ⭐' },
  first_interest: { amount: 300, badge: 'Investor Interest 🎯' },
} as const;

export type XpEvent = keyof typeof XP_EVENTS;

export function levelFromXp(xp: number): string {
  if (xp >= 1000) return 'Series A';
  if (xp >= 500) return 'Seed';
  if (xp >= 200) return 'Pre-seed';
  return 'Idea Stage';
}

export function nextLevelThreshold(xp: number): number {
  if (xp >= 1000) return 1000;
  if (xp >= 500) return 1000;
  if (xp >= 200) return 500;
  return 200;
}

export function levelEmoji(level: string): string {
  switch (level) {
    case 'Series A':
      return '🚀';
    case 'Seed':
      return '🌱';
    case 'Pre-seed':
      return '🌿';
    default:
      return '💡';
  }
}

export function parseBadges(badges: unknown): string[] {
  if (Array.isArray(badges)) return badges.filter((b) => typeof b === 'string');
  return [];
}

export async function addXP(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  badgeName?: string
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('xp, badges')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    return { ok: false, error: fetchError?.message || 'User not found' };
  }

  const badges = parseBadges(user.badges);
  if (badgeName && badges.includes(badgeName)) {
    return { ok: true, skipped: true };
  }

  const newXp = (user.xp ?? 0) + amount;
  const newLevel = levelFromXp(newXp);
  const newBadges = badgeName ? [...badges, badgeName] : badges;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      xp: newXp,
      level: newLevel,
      badges: newBadges,
    })
    .eq('id', userId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
