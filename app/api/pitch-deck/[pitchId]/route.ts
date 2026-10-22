import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-only admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { pitchId: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing auth token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Fetch user profile to check role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role;

    // Fetch pitch info
    const { data: pitch, error: pitchError } = await supabaseAdmin
      .from('pitches')
      .select('founder_id, status, pitch_deck_path')
      .eq('id', params.pitchId)
      .single();

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    if (!pitch.pitch_deck_path) {
      return NextResponse.json({ error: 'Pitch deck not available' }, { status: 404 });
    }

    // Access check: owner, admin, or investor (only when live)
    const isOwner = pitch.founder_id === user.id;
    const isAdmin = userRole === 'admin';
    const isInvestorOnLive = userRole === 'investor' && pitch.status === 'live';

    if (!isOwner && !isAdmin && !isInvestorOnLive) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view this deck' },
        { status: 403 }
      );
    }

    // Create a 60-second signed URL for the private deck
    const { data: signedData, error: storageError } = await supabaseAdmin.storage
      .from('pitch-decks')
      .createSignedUrl(pitch.pitch_deck_path, 60);

    if (storageError || !signedData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }

    return NextResponse.json({ url: signedData.signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
