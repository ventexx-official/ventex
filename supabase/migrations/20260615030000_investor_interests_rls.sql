-- Enable RLS for investor_interests
ALTER TABLE public.investor_interests ENABLE ROW LEVEL SECURITY;

-- Policy: Investors can insert their own interests
CREATE POLICY "Investors can insert their own interests" 
ON public.investor_interests 
FOR INSERT 
WITH CHECK (auth.uid() = investor_id);

-- Policy: Users can view interests related to them
-- (Either they are the investor, or they are the founder of the pitch)
CREATE POLICY "Users can view related interests" 
ON public.investor_interests 
FOR SELECT 
USING (
  auth.uid() = investor_id 
  OR 
  auth.uid() IN (SELECT founder_id FROM public.pitches WHERE id = pitch_id)
);

-- Policy: Investors can update their own interests (e.g. if they want to withdraw)
CREATE POLICY "Investors can update their own interests" 
ON public.investor_interests 
FOR UPDATE 
USING (auth.uid() = investor_id);

-- Enable RLS for deal_room_messages
ALTER TABLE public.deal_room_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in deal rooms they are part of
CREATE POLICY "Users can view deal room messages"
ON public.deal_room_messages
FOR SELECT
USING (
  auth.uid() IN (
    SELECT investor_id FROM public.investor_interests WHERE id = interest_id
  )
  OR
  auth.uid() IN (
    SELECT p.founder_id 
    FROM public.investor_interests i 
    JOIN public.pitches p ON p.id = i.pitch_id 
    WHERE i.id = public.deal_room_messages.interest_id
  )
);

-- Policy: Senders can insert messages in deal rooms they are part of
CREATE POLICY "Users can send deal room messages"
ON public.deal_room_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND
  (
    auth.uid() IN (
      SELECT investor_id FROM public.investor_interests WHERE id = interest_id
    )
    OR
    auth.uid() IN (
      SELECT p.founder_id 
      FROM public.investor_interests i 
      JOIN public.pitches p ON p.id = i.pitch_id 
      WHERE i.id = interest_id
    )
  )
);
