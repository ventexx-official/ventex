-- Create kofi_donations table
CREATE TABLE IF NOT EXISTS public.kofi_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT UNIQUE,
    donor_name TEXT,
    amount TEXT,
    currency TEXT,
    email TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (we only allow service_role to insert, but let's make it secure)
ALTER TABLE public.kofi_donations ENABLE ROW LEVEL SECURITY;

-- Allow public read so we can show supporters if needed
CREATE POLICY "Public read access to donations" 
ON public.kofi_donations FOR SELECT 
USING (true);
