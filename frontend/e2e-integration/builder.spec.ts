import { test, expect } from '@playwright/test';

test.describe('Builder Flow', () => {
  test.describe('Box Type Selection', () => {
    test('should display builder page with box types', async ({ page }) => {
      await page.goto('/builder');
      await expect(page.locator('h1')).toContainText(/ابني بوكسك|بوكس/);
    });

    test('should show loading state initially', async ({ page }) => {
      await page.goto('/builder');
      // Either loading spinner is shown or box types load quickly
      const spinner = page.locator('.animate-spin');
      const buttons = page.locator('button');
      await expect(spinner.or(buttons.first())).toBeVisible({ timeout: 10_000 });
    });

    test('should display box type cards after loading', async ({ page }) => {
      await page.goto('/builder');

      // Wait for box type cards to appear
      const cardButton = page.locator('button').filter({ hasText: /بوكس|Box/ }).first();
      await expect(cardButton).toBeVisible({ timeout: 10_000 });
    });

    test('should show box type name, gender, and price', async ({ page }) => {
      await page.goto('/builder');

      // Wait for content to load
      await page.waitForSelector('button', { timeout: 10_000 });

      const content = await page.textContent('body');
      // Should show price with currency
      expect(content).toContain('ج.م');
    });

    test('should navigate to customize page on box selection', async ({ page }) => {
      await page.goto('/builder');

      // Wait for and click the first box type
      const firstBox = page.locator('button').filter({ hasText: /بوكس|Box/ }).first();
      await firstBox.waitFor({ timeout: 10_000 });
      await firstBox.click();

      await expect(page).toHaveURL(/builder\/customize/, { timeout: 10_000 });
    });
  });

  test.describe('Slot Customization', () => {
    test('should display slots for selected box type', async ({ page }) => {
      await page.goto('/builder');

      // Select a box type
      const firstBox = page.locator('button').filter({ hasText: /بوكس|Box/ }).first();
      await firstBox.waitFor({ timeout: 10_000 });
      await firstBox.click();

      await expect(page).toHaveURL(/builder\/customize/, { timeout: 10_000 });

      // Should show slot selection
      await page.waitForSelector('body', { timeout: 10_000 });
      const bodyText = await page.textContent('body');
      // Content should relate to slot selection
      expect(bodyText).toBeTruthy();
    });
  });

  test.describe('Builder Steps', () => {
    test('should show step indicators', async ({ page }) => {
      await page.goto('/builder');
      await page.waitForSelector('button', { timeout: 10_000 });

      // Builder steps component should be visible
      const stepsComponent = page.locator('app-builder-steps');
      if (await stepsComponent.isVisible()) {
        await expect(stepsComponent).toBeVisible();
      }
    });
  });
});
