import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any, 
});

export async function POST(req: Request) {
  try {
    const { productId, buyerId } = await req.json();

    if (!productId || !buyerId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Since we're running without Supabase Admin to bypass RLS issues for the checkout,
    // we use standard API to fetch product details.
    // In production, ensure backend validation is secure.
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const price = product.discount_price || product.price;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: price * 100, // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${productId}`,
      client_reference_id: buyerId,
      metadata: {
        productId,
        sellerId: product.seller_id,
        buyerId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
