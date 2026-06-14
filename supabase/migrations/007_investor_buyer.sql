-- 007_investor_buyer.sql

-- Investor Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS investor_type text
  CHECK (investor_type IN ('investor','investor_mentor','mentor'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS investor_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS investment_thesis text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mentorship_areas text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS mentorship_terms text;

-- Buyer Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS buyer_interests text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS budget_range text;

-- Buyer Addresses Table
CREATE TABLE IF NOT EXISTS buyer_addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  label text DEFAULT 'Default',
  address_line1 text NOT NULL, 
  address_line2 text,
  city text NOT NULL, 
  state text NOT NULL,
  postal_code text NOT NULL, 
  country text NOT NULL,
  is_default boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE buyer_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addresses" ON buyer_addresses FOR ALL USING (auth.uid() = user_id);
