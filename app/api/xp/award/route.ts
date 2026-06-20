import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { addXP, XP_EVENTS, type XpEvent } from '@/lib/xp';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // Rate limit: 10 XP awards per minute per IP
    const rl = rateLimit(req, 10, 60000);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }

    const body = await req.json();
    const { founderId, event } = body as { founderId?: string; event?: XpEvent };

    if (!founderId || !event || !(event in XP_EVENTS)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const selfEvents: XpEvent[] = ['profile_complete', 'deck_upload'];
    const investorEvents: XpEvent[] = ['first_save', 'first_interest'];

    if (selfEvents.includes(event) && user.id !== founderId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (investorEvents.includes(event) && user.id === founderId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { amount, badge } = XP_EVENTS[event];
    const admin = createSupabaseAdmin();
    const result = await addXP(admin, founderId, amount, badge);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, skipped: result.skipped });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}