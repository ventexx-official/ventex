import { NextResponse } from 'next/server';
import { generateWithFallback } from '@/services/ai-orchestrator';
import { BASE_URL } from '@/lib/site';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { isUuid, requireAdmin, requireUser } from '@/lib/api-security';


async function sendEmail(type: string, recipientEmail: string, data: Record<string, any>) {
  try {
    const baseUrl = BASE_URL;
    await fetch(`${baseUrl}/api/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.INTERNAL_API_SECRET ? { 'x-internal-secret': process.env.INTERNAL_API_SECRET } : {}),
      },
      body: JSON.stringify({ type, recipientEmail, data }),
    });
  } catch (e) {
    console.error('[sendEmail]', e);
  }
}

export async function POST(request: Request) {
  const supabaseAdmin = createSupabaseAdmin();
  try {
    const body = await request.json();
    const { pitchId, title, tagline, problem, solution, unique_insight, tam, country, stage, milestones, mrr } = body;

    if (!isUuid(pitchId)) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 });
    }

    const { data: pitch, error: pitchError } = await supabaseAdmin
      .from('pitches')
      .select('id, founder_id, title, tagline, problem, solution, unique_insight, tam, country, company_stage, milestones, mrr')
      .eq('id', pitchId)
      .single();

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    const adminAuth = await requireAdmin(request);
    if (adminAuth.error) {
      const userAuth = await requireUser(request);
      if (userAuth.error || userAuth.user?.id !== pitch.founder_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    try {
      const systemPrompt = `You are summarising a startup pitch for the Ventex platform discovery feed. Be factual and specific. No hype words. Write exactly 2-3 sentences.`;
      const userPrompt = `Startup Data:
Title: ${title || pitch.title || 'N/A'}
Tagline: ${tagline || pitch.tagline || 'N/A'}
Problem: ${problem || pitch.problem || 'N/A'}
Solution: ${solution || pitch.solution || 'N/A'}
Unique Insight: ${unique_insight || pitch.unique_insight || 'N/A'}
TAM: ${tam || pitch.tam || 'N/A'}
Country: ${country || pitch.country || 'N/A'}
Stage: ${stage || pitch.company_stage || 'N/A'}
Milestones: ${milestones || pitch.milestones || 'N/A'}
MRR: ${mrr || pitch.mrr || 'N/A'}
Explain (1) what the business is/does, (2) who it serves, (3) one proof point. Maximum 60 words.`;

      const summary = await generateWithFallback({ systemPrompt, userPrompt });

      // Attempt to save summary to database
      const { data: updatedPitch, error } = await supabaseAdmin
        .from('pitches')
        .update({ ai_summary: summary })
        .eq('id', pitchId)
        .select('title, founder_id, status')
        .single();

      if (error) {
        console.error('Failed to update Supabase with AI Summary:', error);
      }

      // Send ai_summary_ready email if pitch just went live
      if (updatedPitch?.founder_id) {
        try {
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(updatedPitch.founder_id);
          if (user?.email) {
            await sendEmail('ai_summary_ready', user.email, {
              pitchName: updatedPitch.title || title,
              pitchId,
            });
          }
        } catch (emailErr) {
          console.error('[ai_summary_ready email error]', emailErr);
        }
      }

      return NextResponse.json({ summary });
    } catch (aiError) {
      console.error('AI API failed:', aiError);
      
      // Fallback: use tagline if all AIs fail so submission is never blocked
      const fallbackSummary = tagline || pitch.tagline || 'A promising new startup entering the market.';
      
      await supabaseAdmin
        .from('pitches')
        .update({ ai_summary: fallbackSummary })
        .eq('id', pitchId);
        
      return NextResponse.json({ summary: fallbackSummary });
    }
    
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
