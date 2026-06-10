import { test, expect } from '@playwright/test';

test.describe('Marketplace E2E Flow', () => {
  test('should navigate to marketplace and display products', async ({ page }) => {
    await page.goto('/');
    
    // Check if the link exists before clicking
    const exploreLink = page.getByRole('link', { name: /Explore/i }).first();
    await expect(exploreLink).toBeVisible();
    await exploreLink.click();

    // Verify marketplace loaded
    await expect(page).toHaveURL(/.*marketplace/);
    
    // Look for grid elements
    const grid = page.locator('main').first();
    await expect(grid).toBeVisible();
  });
});
