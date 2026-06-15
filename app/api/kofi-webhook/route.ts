import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { addXP } from '@/lib/xp';

export async function POST(req: Request) {
  try {
    // Ko-fi usually sends application/x-www-form-urlencoded
    // where the key 'data' contains the JSON string
    const contentType = req.headers.get('content-type') || '';
    
    let kofiData: any = null;
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const dataStr = formData.get('data') as string;
      if (dataStr) {
        kofiData = JSON.parse(dataStr);
      }
    } else if (contentType.includes('application/json')) {
      kofiData = await req.json();
    }

    if (!kofiData) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Verify token
    const token = process.env.KOFI_API_TOKEN;
    if (kofiData.verification_token !== token) {
      console.error('Ko-fi token mismatch');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdmin();

    // Log the donation
    const { error: insertError } = await admin
      .from('kofi_donations')
      .insert({
        message_id: kofiData.message_id,
        donor_name: kofiData.from_name,
        amount: kofiData.amount,
        currency: kofiData.currency,
        email: kofiData.email,
        message: kofiData.message
      });

    // If message_id already exists, it might be a duplicate webhook trigger, ignore safely
    if (insertError && insertError.code !== '23505') {
      console.error('Error logging Ko-fi donation:', insertError);
    }

    // Award XP if email matches a Ventex user
    if (kofiData.email) {
      const { data: user } = await admin
        .from('users')
        .select('id')
        .eq('email', kofiData.email)
        .single();

      if (user?.id) {
        // Award XP and Supporter badge
        await addXP(admin, user.id, 500, 'Supporter ☕');
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Ko-fi webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
