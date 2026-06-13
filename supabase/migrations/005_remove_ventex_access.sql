-- Drop ventex_access column as per the mandate to remove Ventex Premium Access
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'ventex_access'
  ) THEN
    ALTER TABLE public.users DROP COLUMN ventex_access;
  END IF;
END $$;
