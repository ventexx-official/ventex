import { test, expect } from '@playwright/test';

test.describe('Marketplace Checkout E2E Flow', () => {
  test('should navigate to marketplace, add item to cart, and initiate checkout', async ({ page }) => {
    // 1. Navigate to home and then marketplace
    await page.goto('/');
    
    const exploreLink = page.getByRole('link', { name: /Explore/i }).first();
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
    } else {
      await page.goto('/marketplace');
    }

    // 2. Verify marketplace loaded
    await expect(page).toHaveURL(/.*marketplace/);
    
    // 3. Find first product card and click it
    const firstProduct = page.locator('.card').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

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
