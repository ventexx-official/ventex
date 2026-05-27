import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BASE_URL } from '@/lib/site';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    // 1. Fetch order details from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        product:product_id (
          id,
          name,
          category,
          type
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Download API] Order not found:', orderError);
      return new NextResponse('Order not found', { status: 404 });
    }

    // 2. Validate expiration (expires 48h)
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 48) {
      return new NextResponse(
        'Download link expired. Digital product download links are valid for 48 hours from the time of purchase.',
        { status: 403 }
      );
    }

    // 3. Validate download limit (max 3 downloads)
    const downloadCount = order.download_count || 0;
    if (downloadCount >= 3) {
      return new NextResponse(
        'Download limit reached. You can download this file up to 3 times.',
        { status: 403 }
      );
    }

    // 4. Increment download count in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ download_count: downloadCount + 1 })
      .eq('id', orderId);

    if (updateError) {
      console.error('[Download API] Error updating download count:', updateError);
    }

    // 5. Package dummy digital delivery file for download
    const fileContent = `=========================================
VENTEX DIGITAL MARKETPLACE DELIVERY
=========================================
Thank you for your purchase on Ventex!

Product: ${order.product?.name || 'Digital Resource'}
Order ID: ${order.id}
Purchased At: ${order.created_at}
Stripe Payment ID: ${order.stripe_payment_id || 'N/A'}
Downloads Remaining: ${2 - downloadCount}

-----------------------------------------
YOUR ACCESS KEY / RESOURCE LINK:
-----------------------------------------
${BASE_URL}/secure/vault/access-${order.id.slice(0, 8)}

Please save this file. The link in this document is active, 
but this text delivery can only be downloaded 3 times.
=========================================`;

    // 6. Return response with download headers
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="Ventex_Download_${orderId.slice(0, 8)}.txt"`,
      },
    });

  } catch (error: any) {
    console.error('Error handling digital product download:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
