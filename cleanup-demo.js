const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://acjlhirytjowvnbwthvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjamxoaXJ5dGpvd3ZuYnd0aHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTMzMjAsImV4cCI6MjA5MzE4OTMyMH0.3MmL6M__Lp4ca8rHV9cnNe3IXV1MfuD6zTW63eOjwX8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanup() {
  console.log('Cleaning up dummy pitches...');
  const { data: pData, error: pErr } = await supabase
    .from('pitches')
    .delete()
    .is('title', null);
    
  if (pErr) console.error('Error deleting pitches:', pErr.message);
  else console.log('Successfully deleted empty pitches.');

  console.log('Cleaning up demo products...');
  const { data: prData, error: prErr } = await supabase
    .from('products')
    .delete()
    .in('name', ['SaaS Financial Model', 'Pitch Deck Template']);

  if (prErr) console.error('Error deleting products:', prErr.message);
  else console.log('Successfully deleted demo products.');

  console.log('Done.');
}

cleanup();
