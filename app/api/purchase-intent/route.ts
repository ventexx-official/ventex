import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deal_code, product_id, buyer_id, buyer_email, buyer_name, seller_id } = body;

    if (!deal_code || !product_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch seller WhatsApp number server-side (never expose to client)
    const { data: sellerProfile } = await supabase
      .from('users')
      .select('whatsapp_number')
      .eq('id', seller_id)
      .single();

    if (!sellerProfile?.whatsapp_number) {
      return NextResponse.json({ error: 'Seller has no WhatsApp number', sellerPhone: null }, { status: 200 });
    }

    // Save purchase intent
    const { error } = await supabase
      .from('purchase_intents')
      .insert({
        deal_code,
        product_id,
        buyer_id: buyer_id || null,
        buyer_email,
        buyer_name,
        seller_id,
        status: 'whatsapp_initiated',
      });

    if (error && !error.message.includes('does not exist')) {
      console.error('Purchase intent error:', error);
    }

    // Return the phone number server-side only
    return NextResponse.json({ 
      success: true,
      sellerPhone: sellerProfile.whatsapp_number,
      dealCode: deal_code
    });
  } catch (err: any) {
    console.error('Purchase intent route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
