import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey.includes('placeholder')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is a placeholder or not set. Admin features are disabled.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );
}
