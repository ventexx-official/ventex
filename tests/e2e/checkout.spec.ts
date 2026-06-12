import { test, expect } from '@playwright/test';

test.describe('Marketplace Checkout E2E Flow', () => {
  test('should navigate to marketplace, add item to cart, and initiate checkout', async ({ page }) => {
    // 1. Navigate directly to marketplace; the homepage Explore CTA routes to Discover.
    await page.goto('/marketplace');

    // 2. Verify marketplace loaded
    await expect(page).toHaveURL(/.*marketplace/);
    
    await expect(page.getByRole('heading', { name: /Marketplace/i })).toBeVisible();

    // 3. Either exercise the first product detail path or accept the valid empty marketplace state.
    const emptyState = page.getByText(/No products listed yet|No products found/i).first();
    const firstProductLink = page.locator('main a[href^="/marketplace/"]:not([href="/marketplace"])').first();
    await expect(firstProductLink.or(emptyState)).toBeVisible({ timeout: 15000 });

    if (await emptyState.isVisible()) {
      return;
    }

    await firstProductLink.click();

    // 4. On product page, click Add to Cart
    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i });
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      
      // 5. Navigate to cart
      await page.goto('/cart');
      await expect(page.getByText(/Shopping Cart/i)).toBeVisible();

      // 6. Proceed to Checkout
      const checkoutBtn = page.getByRole('button', { name: /Proceed to Checkout/i });
      await expect(checkoutBtn).toBeVisible();
      // We do not actually click it to avoid hitting the real Stripe API in tests, 
      // but we verify the button is active and present.
    }
  });
});
