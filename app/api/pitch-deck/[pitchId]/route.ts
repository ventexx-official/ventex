import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role to bypass RLS for fetching pitch_deck_url if protected
);

export async function GET(req: Request, { params }: { params: { pitchId: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    // In development/review mode, if not authenticated, we can mock user verification
    const isDev = process.env.NODE_ENV === 'development';
    
    let verified = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (!authError && user) {
        const { data: profile } = await supabaseAdmin
          .from('users')
          .select('investor_premium, subscription_end_date')
          .eq('id', user.id)
          .single();

        if (profile) {
          const isPremium = profile.investor_premium;
          const hasValidSubscription = profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date();
          if (isPremium && hasValidSubscription) {
            verified = true;
          }
        }
      }
    }

    // In Dev Mode/Review Mode, we allow viewing even if auth check fails to facilitate testing and validation of the viewer watermark
    if (!verified && !isDev) {
      return new NextResponse('Forbidden: Investor Premium required', { status: 403 });
    }

    // Get Pitch Deck Path
    const { data: pitch, error: pitchError } = await supabaseAdmin
      .from('pitches')
      .select('pitch_deck_url')
      .eq('id', params.pitchId)
      .single();

    // If deck url exists, generate signed URL
    if (pitch && pitch.pitch_deck_url) {
      const { data, error: storageError } = await supabaseAdmin
        .storage
        .from('pitch_decks')
        .createSignedUrl(pitch.pitch_deck_url, 1800);

      if (!storageError && data?.signedUrl) {
        return NextResponse.json({ url: data.signedUrl });
      }
    }

    // Fallback PDF for testing and demo purposes in development/review mode
    if (isDev) {
      return NextResponse.json({ 
        url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' 
      });
    }

    return new NextResponse('Pitch deck not found', { status: 404 });

  } catch (error: any) {
    console.error('Error fetching pitch deck:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
