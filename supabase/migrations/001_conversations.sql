-- Conversations & Messages Schema

CREATE TABLE IF NOT EXISTS conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_a uuid REFERENCES auth.users(id) NOT NULL,
  participant_b uuid REFERENCES auth.users(id) NOT NULL,
  context_type text, -- 'pitch_inquiry' | 'marketplace_purchase' | 'general'
  context_id uuid,
  context_title text,
  last_message text,
  last_message_at timestamptz,
  unread_a int DEFAULT 0,
  unread_b int DEFAULT 0,
  deal_status text DEFAULT 'initial_contact',
  deal_status_updated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_a, participant_b, context_type, context_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text', -- 'text' | 'deal_update' | 'system'
  deal_code text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participant view convos" ON conversations FOR SELECT
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "participant insert convos" ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "participant update convos" ON conversations FOR UPDATE
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "participant view msgs" ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE participant_a = auth.uid() OR participant_b = auth.uid()
  ));

CREATE POLICY "participant send" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND conversation_id IN (
    SELECT id FROM conversations WHERE participant_a = auth.uid() OR participant_b = auth.uid()
  ));
