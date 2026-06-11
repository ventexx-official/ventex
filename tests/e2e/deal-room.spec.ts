import { test, expect } from '@playwright/test';

test.describe('Deal Room Access Control', () => {
  test('should prevent unauthenticated access to a specific deal room', async ({ page }) => {
    // Attempt to access a hypothetical deal room ID directly
    await page.goto('/deal-room/12345-abcde');
    
    // Should be redirected to login or discover
    // Based on the deal room logic, it pushes to /discover or /login if session fails
    await expect(page).toHaveURL(/.*(login|discover)/);
  });
});
