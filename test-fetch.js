import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://acjlhirytjowvnbwthvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjamxoaXJ5dGpvd3ZuYnd0aHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTMzMjAsImV4cCI6MjA5MzE4OTMyMH0.3MmL6M__Lp4ca8rHV9cnNe3IXV1MfuD6zTW63eOjwX8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data, error } = await supabase
    .from('pitches')
    .select('id, title, is_raising, industry, company_stage, round_closes_at, tagline, ai_summary, short_description, amount_seeking, state, country, created_at, views, likes')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching pitches:', error);
  } else {
    console.log('Successfully fetched pitches:', data);
  }
}

testFetch();
