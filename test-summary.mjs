import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('Fetching a pitch from Supabase...');
  const { data: pitches, error } = await supabase
    .from('pitches')
    .select('*')
    .eq('status', 'live')
    .limit(1);

  if (error || !pitches || pitches.length === 0) {
    console.error('Error fetching pitch:', error);
    return;
  }

  const pitch = pitches[0];
  console.log(`Found pitch: ${pitch.title} (ID: ${pitch.id})`);

  console.log('Calling /api/generate-summary...');
  const res = await fetch('http://localhost:3000/api/generate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pitchId: pitch.id,
      title: pitch.title,
      tagline: pitch.tagline,
      problem: pitch.problem,
      solution: pitch.solution,
      unique_insight: pitch.unique_insight,
      tam: pitch.tam,
      country: pitch.country,
      stage: pitch.stage,
      milestones: pitch.milestones,
      mrr: pitch.mrr
    })
  });

  const json = await res.json();
  console.log('API Response:', json);
  
  // Verify it was updated in DB
  const { data: updatedPitch } = await supabase
    .from('pitches')
    .select('ai_summary')
    .eq('id', pitch.id)
    .single();
    
  console.log('Database ai_summary field:', updatedPitch?.ai_summary);
}

run();
