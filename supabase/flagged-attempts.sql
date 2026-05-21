-- Create flagged_attempts table to log off-platform attempts
CREATE TABLE IF NOT EXISTS public.flagged_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content_type text, -- 'qa_question' or 'project_requirements'
  raw_content text,
  detected_patterns text[],
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flagged_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admins to read flagged attempts" ON public.flagged_attempts;
DROP POLICY IF EXISTS "Allow users to insert flagged attempts" ON public.flagged_attempts;

-- Add RLS Policies
CREATE POLICY "Allow admins to read flagged attempts" ON public.flagged_attempts FOR SELECT USING (true);
CREATE POLICY "Allow users to insert flagged attempts" ON public.flagged_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
