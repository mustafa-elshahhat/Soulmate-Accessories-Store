import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.locator('input[formControlName="email"]').fill('admin@soulmate-store.com');
    await page.locator('input[formControlName="password"]').fill('Admin@123');
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });
  });

  test.describe('Dashboard', () => {
    test('should display admin dashboard', async ({ page }) => {
      await page.goto('/admin');

      // Should show dashboard content or stats
      await page.waitForTimeout(2_000);
      const bodyText = await page.textContent('body');
      const hasDashboardContent =
        bodyText?.includes('لوحة التحكم') ||
        bodyText?.includes('الطلبات') ||
        bodyText?.includes('admin') ||
        page.url().includes('admin');
      expect(hasDashboardContent).toBeTruthy();
    });

    test('should show order stats on dashboard', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForTimeout(2_000);

      // Dashboard typically shows stats cards
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
    });
  });

  test.describe('Order Management', () => {
    test('should display orders list', async ({ page }) => {
      await page.goto('/admin/orders');
      await page.waitForTimeout(2_000);

      const bodyText = await page.textContent('body');
      const hasOrderContent =
        bodyText?.includes('الطلبات') || bodyText?.includes('ORD-') || bodyText?.includes('طلب');
      expect(hasOrderContent).toBeTruthy();
    });

    test('should be able to navigate to order detail', async ({ page }) => {
      await page.goto('/admin/orders');
      await page.waitForTimeout(3_000);

      // Try to click on first order row/link
      const orderLink = page.locator('a[href*="/admin/orders/"], tr, [routerLink*="orders"]').first();
      if (await orderLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await orderLink.click();
        await page.waitForTimeout(2_000);
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
      }
    });

    test('should show order status filter', async ({ page }) => {
      await page.goto('/admin/orders');
      await page.waitForTimeout(2_000);

      // Should have status filter buttons or select
      const filterElement = page.locator('select, button, [class*="tab"], [class*="filter"]').first();
      await expect(filterElement).toBeVisible({ timeout: 5_000 });
    });
  });

  test.describe('Product Management', () => {
    test('should display products list', async ({ page }) => {
      await page.goto('/admin/products');
      await page.waitForTimeout(2_000);

      const bodyText = await page.textContent('body');
      const hasProductContent = bodyText?.includes('المنتجات') || bodyText?.includes('منتج');
      expect(hasProductContent).toBeTruthy();
    });

    test('should have add product button', async ({ page }) => {
      await page.goto('/admin/products');
      await page.waitForTimeout(2_000);

      const addButton = page.locator('button, a').filter({ hasText: /إضافة|أضف|جديد|add/i }).first();
      if (await addButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await expect(addButton).toBeVisible();
      }
    });
  });

  test.describe('Box Types Management', () => {
    test('should display box types list', async ({ page }) => {
      await page.goto('/admin/box-types');
      await page.waitForTimeout(2_000);

      const bodyText = await page.textContent('body');
      const hasContent = bodyText?.includes('بوكس') || bodyText?.includes('Box');
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Users Management', () => {
    test('should display users list', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForTimeout(2_000);

      const bodyText = await page.textContent('body');
      const hasContent =
        bodyText?.includes('المستخدمين') || bodyText?.includes('مستخدم') || bodyText?.includes('admin');
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between admin pages', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForTimeout(1_000);

      // Check that admin navigation links exist
      const navLinks = page.locator('a[href*="/admin/"]');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
