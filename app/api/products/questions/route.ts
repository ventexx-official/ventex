import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { isUuid, jsonError, requireUser } from '@/lib/api-security';
import { rateLimit } from '@/lib/rate-limit';


export async function POST(req: Request) {
  const supabase = createSupabaseAdmin();
  const { success, remaining } = rateLimit(req, 12, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many question submissions. Please try again shortly.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  const auth = await requireUser(req);
  if (auth.error || !auth.user) return auth.error;

  try {
    const body = await req.json();
    const productId = body?.productId;
    const questionText = typeof body?.question === 'string' ? body.question.trim() : '';

    if (!isUuid(productId)) return jsonError('Invalid product id', 400);
    if (questionText.length < 3) return jsonError('Question must be at least 3 characters.', 400);
    if (questionText.length > 1000) return jsonError('Question must be 1000 characters or less.', 400);

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, status, qa_data')
      .eq('id', productId)
      .single();

    if (productError || !product) return jsonError('Product not found', 404);
    if (!['live', 'published'].includes(product.status)) return jsonError('Product is not accepting questions', 403);

    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', auth.user.id)
      .maybeSingle();

    const question = {
      id: crypto.randomUUID(),
      user_id: auth.user.id,
      user_name: profile?.full_name || auth.user.email?.split('@')[0] || 'Anonymous',
      question: questionText,
      answer: null,
      date: new Date().toISOString(),
    };

    const currentQa = Array.isArray(product.qa_data) ? product.qa_data : [];
    const updatedQa = [...currentQa, question];

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ qa_data: updatedQa })
      .eq('id', productId)
      .select('qa_data')
      .single();

    if (updateError) {
      console.error('[products/questions] update failed', updateError);
      return jsonError('Could not save question', 500);
    }

    return NextResponse.json({ qa_data: updatedProduct.qa_data || updatedQa });
  } catch (error) {
    console.error('[products/questions] unexpected error', error);
    return jsonError('Invalid request', 400);
  }
}
