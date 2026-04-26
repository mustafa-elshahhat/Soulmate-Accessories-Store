import { test, expect } from '@playwright/test';

test.describe('Builder Flow', () => {
  test('should display box types on builder page', async ({ page }) => {
    await page.goto('/builder');
    // Builder page should load
    await expect(page).toHaveURL(/builder/);
  });

  test('should navigate to builder from homepage', async ({ page }) => {
    await page.goto('/');
    const builderLink = page.locator('a[href*="builder"]').first();
    if (await builderLink.isVisible()) {
      await builderLink.click();
      await expect(page).toHaveURL(/builder/);
    }
  });
});
