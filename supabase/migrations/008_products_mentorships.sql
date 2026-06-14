-- 008_products_mentorships.sql

-- Mentorships Table
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid REFERENCES auth.users(id),
  founder_id uuid REFERENCES auth.users(id),
  pitch_id uuid REFERENCES pitches(id),
  status text DEFAULT 'active',
  terms text, 
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mentorships" ON mentorships FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = founder_id);

-- Products Additions
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_type text
  CHECK (delivery_type IN ('digital','physical','service','hybrid'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_address boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_info text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_delivery text;
