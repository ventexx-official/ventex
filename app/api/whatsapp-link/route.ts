import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const { data: product } = await supabase
      .from('products')
      .select('name, product_type, user_id')
      .eq('id', productId)
      .single();

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const { data: seller } = await supabase
      .from('users')
      .select('whatsapp')
      .eq('id', product.user_id)
      .single();

    if (!seller || !seller.whatsapp) {
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
