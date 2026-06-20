-- Migration to fix auth_rls_initplan warnings by wrapping auth.uid() in a subquery

-- Fix for conversations - participant view convos
DROP POLICY IF EXISTS "participant view convos" ON public.conversations;
CREATE POLICY "participant view convos" ON public.conversations FOR SELECT
  USING ((select auth.uid()) = participant_a OR (select auth.uid()) = participant_b);

-- Fix for conversations - participant insert convos
DROP POLICY IF EXISTS "participant insert convos" ON public.conversations;
CREATE POLICY "participant insert convos" ON public.conversations FOR INSERT
  WITH CHECK ((select auth.uid()) = participant_a OR (select auth.uid()) = participant_b);

-- Fix for conversations - participant update convos
DROP POLICY IF EXISTS "participant update convos" ON public.conversations;
CREATE POLICY "participant update convos" ON public.conversations FOR UPDATE
  USING ((select auth.uid()) = participant_a OR (select auth.uid()) = participant_b);

-- Fix for messages - participant view msgs
DROP POLICY IF EXISTS "participant view msgs" ON public.messages;
CREATE POLICY "participant view msgs" ON public.messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE participant_a = (select auth.uid()) OR participant_b = (select auth.uid())
  ));

-- Fix for messages - participant send
DROP POLICY IF EXISTS "participant send" ON public.messages;
CREATE POLICY "participant send" ON public.messages FOR INSERT
  WITH CHECK (sender_id = (select auth.uid()) AND conversation_id IN (
    SELECT id FROM conversations WHERE participant_a = (select auth.uid()) OR participant_b = (select auth.uid())
  ));

-- Fix for purchase_intents - buyer sees own
DROP POLICY IF EXISTS "buyer sees own" ON public.purchase_intents;
CREATE POLICY "buyer sees own" ON public.purchase_intents FOR SELECT
  USING ((select auth.uid()) = buyer_id);

-- Fix for purchase_intents - seller sees theirs
DROP POLICY IF EXISTS "seller sees theirs" ON public.purchase_intents;
CREATE POLICY "seller sees theirs" ON public.purchase_intents FOR SELECT
  USING ((select auth.uid()) = seller_id);

-- Fix for purchase_intents - buyer inserts
DROP POLICY IF EXISTS "buyer inserts" ON public.purchase_intents;
CREATE POLICY "buyer inserts" ON public.purchase_intents FOR INSERT
  WITH CHECK ((select auth.uid()) = buyer_id OR buyer_id IS NULL);

-- Fix for feature_flags - Admins insert feature flags
DROP POLICY IF EXISTS "Admins insert feature flags" ON public.feature_flags;
CREATE POLICY "Admins insert feature flags"
      ON public.feature_flags
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.users
          WHERE users.id = (select auth.uid())
            AND users.role = 'admin'
        )
      );

-- Fix for feature_flags - Admins update feature flags
DROP POLICY IF EXISTS "Admins update feature flags" ON public.feature_flags;
CREATE POLICY "Admins update feature flags"
      ON public.feature_flags
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.users
          WHERE users.id = (select auth.uid())
            AND users.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.users
          WHERE users.id = (select auth.uid())
            AND users.role = 'admin'
        )
      );

-- Fix for buyer_addresses - own addresses
DROP POLICY IF EXISTS "own addresses" ON public.buyer_addresses;
CREATE POLICY "own addresses" ON public.buyer_addresses FOR ALL USING ((select auth.uid()) = user_id);

-- Fix for mentorships - own mentorships
DROP POLICY IF EXISTS "own mentorships" ON public.mentorships;
CREATE POLICY "own mentorships" ON public.mentorships FOR SELECT
  USING ((select auth.uid()) = mentor_id OR (select auth.uid()) = founder_id);

-- Fix for saved_products - Users can view their own saved products
DROP POLICY IF EXISTS "Users can view their own saved products" ON public.saved_products;
CREATE POLICY "Users can view their own saved products" ON public.saved_products FOR SELECT USING ((select auth.uid()) = user_id);

-- Fix for saved_products - Users can insert their own saved products
DROP POLICY IF EXISTS "Users can insert their own saved products" ON public.saved_products;
CREATE POLICY "Users can insert their own saved products" ON public.saved_products FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Fix for saved_products - Users can delete their own saved products
DROP POLICY IF EXISTS "Users can delete their own saved products" ON public.saved_products;
CREATE POLICY "Users can delete their own saved products" ON public.saved_products FOR DELETE USING ((select auth.uid()) = user_id);

-- Fix for investor_interests - Investors can insert their own interests
DROP POLICY IF EXISTS "Investors can insert their own interests" ON public.investor_interests;
CREATE POLICY "Investors can insert their own interests" 
ON public.investor_interests 
FOR INSERT 
WITH CHECK ((select auth.uid()) = investor_id);

-- Fix for investor_interests - Users can view related interests
DROP POLICY IF EXISTS "Users can view related interests" ON public.investor_interests;
CREATE POLICY "Users can view related interests" 
ON public.investor_interests 
FOR SELECT 
USING (
  (select auth.uid()) = investor_id 
  OR 
  (select auth.uid()) IN (SELECT founder_id FROM public.pitches WHERE id = pitch_id)
);

-- Fix for investor_interests - Investors can update their own interests
DROP POLICY IF EXISTS "Investors can update their own interests" ON public.investor_interests;
CREATE POLICY "Investors can update their own interests" 
ON public.investor_interests 
FOR UPDATE 
USING ((select auth.uid()) = investor_id);

-- Fix for deal_room_messages - Users can view deal room messages
DROP POLICY IF EXISTS "Users can view deal room messages" ON public.deal_room_messages;
CREATE POLICY "Users can view deal room messages"
ON public.deal_room_messages
FOR SELECT
USING (
  (select auth.uid()) IN (
    SELECT investor_id FROM public.investor_interests WHERE id = interest_id
  )
  OR
  (select auth.uid()) IN (
    SELECT p.founder_id 
    FROM public.investor_interests i 
    JOIN public.pitches p ON p.id = i.pitch_id 
    WHERE i.id = public.deal_room_messages.interest_id
  )
);

-- Fix for deal_room_messages - Users can send deal room messages
DROP POLICY IF EXISTS "Users can send deal room messages" ON public.deal_room_messages;
CREATE POLICY "Users can send deal room messages"
ON public.deal_room_messages
FOR INSERT
WITH CHECK (
  (select auth.uid()) = sender_id
  AND
  (
    (select auth.uid()) IN (
      SELECT investor_id FROM public.investor_interests WHERE id = interest_id
    )
    OR
    (select auth.uid()) IN (
      SELECT p.founder_id 
      FROM public.investor_interests i 
      JOIN public.pitches p ON p.id = i.pitch_id 
      WHERE i.id = interest_id
    )
  )
);

-- Fix for cart_items - Users manage own cart items
DROP POLICY IF EXISTS "Users manage own cart items" ON public.cart_items;
CREATE POLICY "Users manage own cart items"
  ON public.cart_items FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix for notifications - Users read own notifications
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING ((select auth.uid()) = user_id);

-- Fix for project_requests - Users manage own project requests
DROP POLICY IF EXISTS "Users manage own project requests" ON public.project_requests;
CREATE POLICY "Users manage own project requests"
  ON public.project_requests FOR ALL
  USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

-- Fix for saved_pitches - Users manage own saved pitches
DROP POLICY IF EXISTS "Users manage own saved pitches" ON public.saved_pitches;
CREATE POLICY "Users manage own saved pitches"
  ON public.saved_pitches FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix for pitch_scores - Founders read pitch scores
DROP POLICY IF EXISTS "Founders read pitch scores" ON public.pitch_scores;
CREATE POLICY "Founders read pitch scores"
  ON public.pitch_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = pitch_id
        AND p.founder_id = (select auth.uid())
    )
  );

-- Fix for investor_interests - Investors read own interests
DROP POLICY IF EXISTS "Investors read own interests" ON public.investor_interests;
CREATE POLICY "Investors read own interests"
  ON public.investor_interests FOR SELECT
  USING ((select auth.uid()) = investor_id);

-- Fix for users - Allow admins to manage all users
DROP POLICY IF EXISTS "Allow admins to manage all users" ON public.users;
CREATE POLICY "Allow admins to manage all users"
  ON public.users FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for pitches - Allow admins to manage all pitches
DROP POLICY IF EXISTS "Allow admins to manage all pitches" ON public.pitches;
CREATE POLICY "Allow admins to manage all pitches"
  ON public.pitches FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for deals - Allow admins to manage all deals
DROP POLICY IF EXISTS "Allow admins to manage all deals" ON public.deals;
CREATE POLICY "Allow admins to manage all deals"
  ON public.deals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for blacklist - Allow admins to manage blacklist
DROP POLICY IF EXISTS "Allow admins to manage blacklist" ON public.blacklist;
CREATE POLICY "Allow admins to manage blacklist"
  ON public.blacklist FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for sponsorships - Allow admins to manage sponsorships
DROP POLICY IF EXISTS "Allow admins to manage sponsorships" ON public.sponsorships;
CREATE POLICY "Allow admins to manage sponsorships"
  ON public.sponsorships FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for feature_flags - Allow admins to manage feature flags
DROP POLICY IF EXISTS "Allow admins to manage feature flags" ON public.feature_flags;
CREATE POLICY "Allow admins to manage feature flags"
  ON public.feature_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for articles - Allow admins to manage articles
DROP POLICY IF EXISTS "Allow admins to manage articles" ON public.articles;
CREATE POLICY "Allow admins to manage articles"
  ON public.articles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for pitch_scores - Allow admins to manage pitch scores
DROP POLICY IF EXISTS "Allow admins to manage pitch scores" ON public.pitch_scores;
CREATE POLICY "Allow admins to manage pitch scores"
  ON public.pitch_scores FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for comments - Allow admins to manage comments
DROP POLICY IF EXISTS "Allow admins to manage comments" ON public.comments;
CREATE POLICY "Allow admins to manage comments"
  ON public.comments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

-- Fix for promo_codes - Allow admins to manage promo codes
DROP POLICY IF EXISTS "Allow admins to manage promo codes" ON public.promo_codes;
CREATE POLICY "Allow admins to manage promo codes"
  ON public.promo_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin'));

