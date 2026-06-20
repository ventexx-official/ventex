import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { generateWithFallback } from '@/services/ai-orchestrator';
import { rateLimit } from '@/lib/rate-limit';

function fallbackScore(pitch: any) {
  const traction = pitch.mrr || pitch.arr || pitch.users_count ? 72 : 48;
  const market = pitch.industry ? 68 : 50;
  const model = pitch.revenue_model || pitch.business_type ? 66 : 50;
  const problem = pitch.problem || pitch.short_description ? 70 : 52;
  const team = pitch.team_data?.length ? 68 : 50;
  const overall = Math.round((traction + market + model + problem + team) / 5);

  return {
    overall,
    problem_clarity: problem,
    market_size: market,
    team_strength: team,
    traction,
    business_model: model,
    feedback: 'Add sharper traction proof, a crisp customer segment, and one investor-grade reason this market wins now.',
  };
}

export async function POST(req: Request) {
  try {
    // Rate limit: 3 AI score requests per minute per IP (cost-bearing endpoint)
    const rl = rateLimit(req, 3, 60000);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests. Please wait before scoring again.' }, {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }

    const { pitchId } = await req.json();
    if (!pitchId) {
      return NextResponse.json({ error: 'pitchId is required' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();
    const { data: pitch, error } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitchId)
      .single();

    if (error || !pitch) {
      return NextResponse.json({ error: error?.message || 'Pitch not found' }, { status: 404 });
    }

    if (pitch.founder_id !== authData.user.id) {
      return NextResponse.json({ error: 'Only the pitch founder can score this pitch' }, { status: 403 });
    }

    let score = fallbackScore(pitch);

    try {
      const systemPrompt = 'You are a startup investor. Return ONLY valid JSON, no markdown.';
      const userPrompt = `Score this pitch out of 100: {overall, problem_clarity, market_size, team_strength, traction, business_model, feedback (max 40 words)}. Pitch: ${pitch.title || ''} ${pitch.tagline || ''} ${pitch.industry || ''} ${pitch.company_stage || ''} ${pitch.amount_seeking || ''}`;
      
      const aiResponse = await generateWithFallback({
        systemPrompt,
        userPrompt,
        responseFormat: 'json_object'
      });
      score = JSON.parse(aiResponse);
    } catch (e) {
      console.error('[Score Pitch] AI generation failed, using fallback score:', e);
      // fallbackScore is already applied above
    }

    const { data: saved, error: saveError } = await supabase
      .from('pitch_scores')
      .insert({ pitch_id: pitchId, ...score })
      .select()
      .single();

    if (saveError) {
      return NextResponse.json({ score, warning: saveError.message });
    }

    return NextResponse.json({ score: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to score pitch' }, { status: 500 });
  }
}