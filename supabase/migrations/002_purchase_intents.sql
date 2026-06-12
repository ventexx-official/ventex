-- Purchase Intents (WhatsApp P2P)

CREATE TABLE IF NOT EXISTS purchase_intents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_code text UNIQUE NOT NULL,
  product_id uuid REFERENCES products(id),
  buyer_id uuid REFERENCES auth.users(id),
  buyer_email text,
  buyer_name text,
  seller_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'whatsapp_initiated',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- status values: whatsapp_initiated | in_negotiation | payment_sent | delivered | completed | disputed

ALTER TABLE purchase_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyer sees own" ON purchase_intents FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "seller sees theirs" ON purchase_intents FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "buyer inserts" ON purchase_intents FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR buyer_id IS NULL);
