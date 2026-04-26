import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[formControlName="name"]')).toBeVisible();
      await expect(page.locator('input[formControlName="email"]')).toBeVisible();
      await expect(page.locator('input[formControlName="password"]')).toBeVisible();
      await expect(page.locator('input[formControlName="phone"]')).toBeVisible();
    });

    test('should show validation errors on empty submit', async ({ page }) => {
      await page.goto('/register');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('.text-red-500').first()).toBeVisible();
    });

    test('should register with valid data and redirect', async ({ page }) => {
      const uniqueEmail = `test_${Date.now()}@example.com`;
      await page.goto('/register');
      await page.locator('input[formControlName="name"]').fill('Test User');
      await page.locator('input[formControlName="email"]').fill(uniqueEmail);
      await page.locator('input[formControlName="password"]').fill('password123');
      await page.locator('input[formControlName="phone"]').fill('01012345678');
      await page.locator('button[type="submit"]').click();

      // Should redirect to home or dashboard after successful registration
      await expect(page).not.toHaveURL(/register/);
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[formControlName="email"]')).toBeVisible();
      await expect(page.locator('input[formControlName="password"]')).toBeVisible();
    });

    test('should show validation errors on empty submit', async ({ page }) => {
      await page.goto('/login');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('.text-red-500').first()).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[formControlName="email"]').fill('wrong@example.com');
      await page.locator('input[formControlName="password"]').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();

      // Should show error message
      await expect(page.locator('[class*="bg-red"]').first()).toBeVisible({ timeout: 10_000 });
    });

    test('should login with valid credentials and redirect', async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[formControlName="email"]').fill('admin@soulmate-store.com');
      await page.locator('input[formControlName="password"]').fill('Admin@123');
      await page.locator('button[type="submit"]').click();

      await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/login');
      const link = page.locator('a[href="/forgot-password"]');
      await expect(link).toBeVisible();
    });

    test('should have register link', async ({ page }) => {
      await page.goto('/login');
      const link = page.locator('a[href="/register"]');
      await expect(link).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout and redirect to home', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.locator('input[formControlName="email"]').fill('admin@soulmate-store.com');
      await page.locator('input[formControlName="password"]').fill('Admin@123');
      await page.locator('button[type="submit"]').click();
      await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });

      // Find and click logout
      const logoutButton = page.locator('button', { hasText: /تسجيل الخروج|logout/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('Forgot Password', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');
      await expect(page.locator('input[formControlName="email"], input[type="email"]').first()).toBeVisible();
    });
  });
});
