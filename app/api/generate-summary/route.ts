import { NextResponse } from 'next/server';
import { generatePitchSummary } from '@/lib/claude';
import { BASE_URL } from '@/lib/site';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { isUuid, requireAdmin, requireUser } from '@/lib/api-security';

const supabaseAdmin = createSupabaseAdmin();

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
      const summary = await generatePitchSummary({
        title: title || pitch.title,
        tagline: tagline || pitch.tagline,
        problem: problem || pitch.problem,
        solution: solution || pitch.solution,
        unique_insight: unique_insight || pitch.unique_insight,
        tam: tam || pitch.tam,
        country: country || pitch.country,
        stage: stage || pitch.company_stage,
        milestones: milestones || pitch.milestones,
        mrr: mrr || pitch.mrr,
      });

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
    } catch (claudeError) {
      console.error('Claude API failed:', claudeError);
      
      // Fallback: use tagline if Claude fails so submission is never blocked
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
