import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should navigate to login page and show form', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login form elements
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });

  test('should navigate to signup page and show form', async ({ page }) => {
    await page.goto('/signup');
    
    // Verify signup form elements
    await expect(page.getByPlaceholder(/full name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();
  });
});
