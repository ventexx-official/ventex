const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://acjlhirytjowvnbwthvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjamxoaXJ5dGpvd3ZuYnd0aHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxMzMyMCwiZXhwIjoyMDkzMTg5MzIwfQ.QyWTaQZe27Q6Z82D5KuyGldDRAfTE7eE4SUonalyj7w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = fs.readFileSync('supabase/migrations/20260620020000_auth_rls_initplan_fix.sql', 'utf8');
  
  // Note: the execute_sql RPC was added in a previous lint fix if it exists
  const { data, error } = await supabase.rpc('execute_sql', { query: sql });
  if (error) {
    console.error('Error executing SQL:', error);
    process.exit(1);
  } else {
    console.log('SQL executed successfully:', data);
  }
}

run();
