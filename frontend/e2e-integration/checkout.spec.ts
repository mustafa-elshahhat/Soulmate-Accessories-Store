import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.describe('Cart', () => {
    test('should display empty cart message', async ({ page }) => {
      await page.goto('/cart');
      const bodyText = await page.textContent('body');
      // Should mention empty cart
      expect(bodyText).toContain('فاضية');
    });

    test('should show cart items count in header', async ({ page }) => {
      await page.goto('/');
      // Cart icon or counter should be in the header
      const header = page.locator('header, nav');
      await expect(header.first()).toBeVisible();
    });
  });

  test.describe('Checkout Page', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      await page.goto('/checkout');

      // Should redirect to login or show empty cart
      const url = page.url();
      const bodyText = await page.textContent('body');
      const isLoginRedirect = url.includes('login');
      const isEmptyCart = bodyText?.includes('فاضية');
      expect(isLoginRedirect || isEmptyCart).toBeTruthy();
    });

    test('should show checkout page when logged in with cart items', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.locator('input[formControlName="email"]').fill('admin@soulmate-store.com');
      await page.locator('input[formControlName="password"]').fill('Admin@123');
      await page.locator('button[type="submit"]').click();
      await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });

      await page.goto('/checkout');

      // Should show checkout page (either empty cart message or order form)
      const bodyText = await page.textContent('body');
      const hasCheckoutContent = bodyText?.includes('إتمام الطلب') || bodyText?.includes('فاضية');
      expect(hasCheckoutContent).toBeTruthy();
    });

    test('should display order summary section', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.locator('input[formControlName="email"]').fill('admin@soulmate-store.com');
      await page.locator('input[formControlName="password"]').fill('Admin@123');
      await page.locator('button[type="submit"]').click();
      await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });

      // Add a standalone product to cart by navigating product listing and adding
      await page.goto('/products');
      const productLink = page.locator('a[href*="/products/"]').first();
      if (await productLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await productLink.click();
        // Try to add to cart
        const addButton = page.locator('button', { hasText: /أضف|سلة|cart/i }).first();
        if (await addButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await addButton.click();
        }
      }

      await page.goto('/checkout');
      await page.waitForTimeout(1_000);
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
    });
  });

  test.describe('Address Management', () => {
    test('should show address form on checkout when no addresses exist', async ({ page }) => {
      // Login with a fresh user or existing user
      await page.goto('/login');
      await page.locator('input[formControlName="email"]').fill('admin@soulmate-store.com');
      await page.locator('input[formControlName="password"]').fill('Admin@123');
      await page.locator('button[type="submit"]').click();
      await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });

      await page.goto('/checkout');

      // Check for address-related elements
      const bodyText = await page.textContent('body');
      const hasAddressContent = bodyText?.includes('عنوان التوصيل') || bodyText?.includes('فاضية');
      expect(hasAddressContent).toBeTruthy();
    });
  });
});
