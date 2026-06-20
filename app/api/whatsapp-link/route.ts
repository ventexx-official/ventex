import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    // Require authentication – seller phone numbers are private
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const { data: product } = await supabaseAuth
      .from('products')
      .select('name, product_type, user_id')
      .eq('id', productId)
      .single();

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const { data: seller } = await supabaseAuth
      .from('users')
      .select('whatsapp')
      .eq('id', product.user_id)
      .single();

    if (!seller?.whatsapp) {
      return NextResponse.json({ error: 'Seller has no WhatsApp linked' }, { status: 400 });
    }

    const message = generateWhatsAppMessage(product.name, product.product_type || 'digital');
    const encodedMessage = encodeURIComponent(message);
    const phone = seller.whatsapp.replace(/\D/g, '');

    return NextResponse.json({ url: `https://wa.me/${phone}?text=${encodedMessage}` });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
