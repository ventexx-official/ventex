import { supabase } from '@/lib/supabase';
import type { XpEvent } from '@/lib/xp';

export async function awardXp(event: XpEvent, founderId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  try {
    await fetch('/api/xp/award', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ founderId, event }),
    });
  } catch (e) {
    console.error('[awardXp]', e);
  }
}
