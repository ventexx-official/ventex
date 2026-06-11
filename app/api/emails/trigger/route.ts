import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BASE_URL } from '@/lib/site';

/**
 * Server-side trigger endpoint for emailing founders/investors.
 * Requires a shared TRIGGER_SECRET to prevent abuse.
 * 
 * Called by client-side handlers after DB inserts when they can't
 * access auth.users emails directly (due to RLS).
 * 
 * POST body: { secret, event, payload }
 * 
 * Supported events:
 *   - new_comment     → emails pitch founder
 *   - investor_interest → emails pitch founder
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendEmail(type: string, recipientEmail: string, data: Record<string, any>) {
  const baseUrl = BASE_URL;
  await fetch(`${baseUrl}/api/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, recipientEmail, data }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, payload } = body;

    switch (event) {
      case 'new_comment': {
        // payload: { pitchId, pitchName, pitchFounderId, commenterName, commentText }
        const { pitchFounderId, pitchName, pitchId, commenterName, commentText } = payload;
        if (!pitchFounderId) break;

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(pitchFounderId);
        if (user?.email) {
          await sendEmail('new_comment', user.email, {
            pitchId,
            pitchName,
            commenterName,
            commentText: commentText?.slice(0, 200),
          });
          console.warn(`[EMAIL TRIGGER] new_comment → ${user.email}`);
        }
        break;
      }

      case 'investor_interest': {
        // payload: { pitchFounderId, startupName, investorName, message }
        const { pitchFounderId, startupName, investorName, message } = payload;
        if (!pitchFounderId) break;

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(pitchFounderId);
        if (user?.email) {
          await sendEmail('investor_interest', user.email, {
            startupName,
            investorName,
            message: message?.slice(0, 300),
          });
          console.warn(`[EMAIL TRIGGER] investor_interest → ${user.email}`);
        }
        break;
      }

      case 'order_created': {
        // payload: { sellerId, buyerId, productName, amount, payout, orderId }
        const { sellerId, buyerId, productName, amount, payout, orderId } = payload;

        const [sellerResult, buyerResult] = await Promise.all([
          supabaseAdmin.auth.admin.getUserById(sellerId),
          supabaseAdmin.auth.admin.getUserById(buyerId),
        ]);

        if (sellerResult.data.user?.email) {
          await sendEmail('product_sold', sellerResult.data.user.email, {
            productName, amount, payout, orderId,
          });
        }
        if (buyerResult.data.user?.email) {
          await sendEmail('order_confirmation', buyerResult.data.user.email, {
            productName, amount, orderId,
          });
        }
        console.warn(`[EMAIL TRIGGER] order_created seller=${sellerResult.data.user?.email} buyer=${buyerResult.data.user?.email}`);
        break;
      }

      default:
        console.warn('[email-trigger] Unknown event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[email-trigger error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
