-- Cleanup and consolidation of RLS policies to resolve "Multiple Permissive Policies" warnings

-- 1. ARTICLES
DROP POLICY IF EXISTS "Allow admins to manage articles" ON public.articles;
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Public read articles" ON public.articles;

CREATE POLICY "articles_select_policy" ON public.articles FOR SELECT USING (
  is_published = true OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

CREATE POLICY "articles_admin_policy" ON public.articles FOR ALL TO authenticated USING (
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
) WITH CHECK (
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);


-- 2. CART ITEMS
DROP POLICY IF EXISTS "Allow admins to manage cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users manage own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users read own cart" ON public.cart_items;

CREATE POLICY "cart_items_select_policy" ON public.cart_items FOR SELECT USING (
  user_id = auth.uid() OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

CREATE POLICY "cart_items_insert_policy" ON public.cart_items FOR INSERT WITH CHECK (
  user_id = auth.uid() OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

CREATE POLICY "cart_items_update_policy" ON public.cart_items FOR UPDATE USING (
  user_id = auth.uid() OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

CREATE POLICY "cart_items_delete_policy" ON public.cart_items FOR DELETE USING (
  user_id = auth.uid() OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);


-- 3. CATALYSTS
DROP POLICY IF EXISTS "Allow admins to manage catalysts" ON public.catalysts;
DROP POLICY IF EXISTS "Public read catalysts" ON public.catalysts;
DROP POLICY IF EXISTS "catalysts public read" ON public.catalysts;

CREATE POLICY "catalysts_select_policy" ON public.catalysts FOR SELECT USING (
  true
);

CREATE POLICY "catalysts_admin_policy" ON public.catalysts FOR ALL TO authenticated USING (
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
) WITH CHECK (
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);


-- 4. COMMENTS
DROP POLICY IF EXISTS "Allow admins to manage comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON public.comments;
DROP POLICY IF EXISTS "Public read comments" ON public.comments;

CREATE POLICY "comments_select_policy" ON public.comments FOR SELECT USING (
  true
);

CREATE POLICY "comments_insert_policy" ON public.comments FOR INSERT WITH CHECK (
  user_id = auth.uid() OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

CREATE POLICY "comments_update_policy" ON public.comments FOR UPDATE USING (
  user_id = auth.uid() OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

CREATE POLICY "comments_delete_policy" ON public.comments FOR DELETE USING (
  user_id = auth.uid() OR 
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);
