-- Add whatsapp_number to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS whatsapp_number text;
