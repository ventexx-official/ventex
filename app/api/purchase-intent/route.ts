import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit } from '@/lib/rate-limit';
import { isUuid, requireUser } from '@/lib/api-security';


export async function POST(req: NextRequest) {
  const supabase = createSupabaseAdmin();
  const { success, remaining } = rateLimit(req, 8, 60_000);
  if (!success) {
    return new NextResponse('Too many requests. Please try again later.', {
      status: 429,
      headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(remaining) },
    });
  }

  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error;

    const body = await req.json();
    const { deal_code, product_id, buyer_email, buyer_name, seller_id } = body;

    if (!deal_code || !isUuid(product_id) || !isUuid(seller_id)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: product } = await supabase
      .from('products')
      .select('id, seller_id, status')
      .eq('id', product_id)
      .eq('seller_id', seller_id)
      .single();

    if (!product || !['live', 'published'].includes(product.status)) {
      return NextResponse.json({ error: 'Product not available' }, { status: 404 });
    }

    if (seller_id === auth.user.id) {
      return NextResponse.json({ error: 'You cannot purchase your own product' }, { status: 400 });
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
        buyer_id: auth.user.id,
        buyer_email: buyer_email || auth.user.email,
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
