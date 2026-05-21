-- Create a function to update average_rating and review_count on the products table
CREATE OR REPLACE FUNCTION public.handle_review_changes()
RETURNS trigger AS $$
DECLARE
  target_product_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  UPDATE public.products
  SET 
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE product_id = target_product_id
    ),
    average_rating = COALESCE(
      (
        SELECT ROUND(AVG(rating)::numeric, 1) 
        FROM public.reviews 
        WHERE product_id = target_product_id
      ), 
      0
    )
  WHERE id = target_product_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after INSERT, UPDATE, or DELETE on reviews
DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_changes();
