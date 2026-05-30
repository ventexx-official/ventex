/**
 * Applies seed data via service role (RPC/RLS SQL must be run in Supabase SQL Editor).
 * Usage: node scripts/apply-supabase-fixes.js
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}

fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimLine = line.trim();
    if (trimLine && !trimLine.startsWith('#')) {
      const i = trimLine.indexOf('=');
      if (i > -1) {
        const key = trimLine.substring(0, i).trim();
        let value = trimLine.substring(i + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIfEmpty() {
  const { count: pitchCount } = await supabase
    .from('pitches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live');

  if (!pitchCount) {
    const { error } = await supabase.from('pitches').insert({
      title: 'VentexDemo',
      tagline: 'India startup platform',
      industry: 'SaaS',
      company_stage: 'Seed',
      country: 'India',
      city: 'Kerala',
      status: 'live',
      amount_seeking: 5000000,
      equity_pct: 10,
      is_raising: true,
      ai_summary: 'Demo pitch for Ventex early access.',
    });
    if (error) console.error('Pitch seed error:', error.message);
    else console.log('Inserted VentexDemo pitch');
  } else {
    console.log(`Skipping pitch seed (${pitchCount} live pitches)`);
  }

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live');

  if ((productCount || 0) < 2) {
    const products = [
      {
        name: 'Pitch Deck Template',
        description: 'Investor-ready 12-slide template',
        price: 999,
        category: 'Templates',
        status: 'live',
        type: 'fixed_price',
      },
      {
        name: 'SaaS Financial Model',
        description: 'Excel + Google Sheets model',
        price: 1499,
        category: 'Templates',
        status: 'live',
        type: 'fixed_price',
      },
    ];
    const { error } = await supabase.from('products').insert(products);
    if (error) console.error('Product seed error:', error.message);
    else console.log('Inserted demo products');
  } else {
    console.log(`Skipping product seed (${productCount} live products)`);
  }
}

async function checkRpc() {
  const { data, error } = await supabase.rpc('get_homepage_stats');
  if (error) {
    console.warn(
      'get_homepage_stats RPC not available — run supabase/homepage-stats-rpc.sql in SQL Editor:',
      error.message
    );
    return false;
  }
  console.log('Homepage stats:', data?.[0] ?? data);
  return true;
}

async function main() {
  await seedIfEmpty();
  await checkRpc();
  console.log('\nIf RPC failed, paste and run: supabase/homepage-stats-rpc.sql in Supabase SQL Editor');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
