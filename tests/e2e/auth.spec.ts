import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should navigate to login page and show form', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login form elements
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should navigate to signup page and show form', async ({ page }) => {
    await page.goto('/signup');
    
    // Verify signup form elements
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();
  });
});
