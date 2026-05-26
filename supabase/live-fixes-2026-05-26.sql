-- Live fixes for product Q&A, founder custom Q&A, and saved pitch watchlists.
-- Paste this file into Supabase SQL Editor and run it once.

ALTER TABLE public.pitches
  ADD COLUMN IF NOT EXISTS custom_qa jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS qa_data jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.saved_pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

DELETE FROM public.saved_pitches a
USING public.saved_pitches b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id
  AND a.pitch_id = b.pitch_id;

CREATE UNIQUE INDEX IF NOT EXISTS saved_pitches_user_pitch_unique
  ON public.saved_pitches(user_id, pitch_id);

CREATE OR REPLACE FUNCTION public.append_product_question(
  target_product_id uuid,
  question jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_questions jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to ask a question.';
  END IF;

  UPDATE public.products
  SET qa_data = COALESCE(qa_data, '[]'::jsonb) || jsonb_build_array(question)
  WHERE id = target_product_id
  RETURNING qa_data INTO updated_questions;

  IF updated_questions IS NULL THEN
    RAISE EXCEPTION 'Product not found.';
  END IF;

  RETURN updated_questions;
END;
$$;

GRANT EXECUTE ON FUNCTION public.append_product_question(uuid, jsonb) TO authenticated;

ALTER TABLE public.saved_pitches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_pitches owner read" ON public.saved_pitches;
CREATE POLICY "saved_pitches owner read" ON public.saved_pitches
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_pitches owner insert" ON public.saved_pitches;
CREATE POLICY "saved_pitches owner insert" ON public.saved_pitches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_pitches owner delete" ON public.saved_pitches;
CREATE POLICY "saved_pitches owner delete" ON public.saved_pitches
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own saved pitches" ON public.saved_pitches;
CREATE POLICY "Users manage own saved pitches" ON public.saved_pitches
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
