import { NextResponse } from 'next/server';
import { generatePitchSummary } from '@/lib/claude';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { BASE_URL } from '@/lib/site';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendEmail(type: string, recipientEmail: string, data: Record<string, any>) {
  try {
    const baseUrl = BASE_URL;
    await fetch(`${baseUrl}/api/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 });
    }

    try {
      const summary = await generatePitchSummary({
        title, tagline, problem, solution, unique_insight, tam, country, stage, milestones, mrr
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
      const fallbackSummary = tagline || 'A promising new startup entering the market.';
      
      await supabase
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