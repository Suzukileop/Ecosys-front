import { expect, test } from '@playwright/test';

test.describe('public pages', () => {
  test('landing page renders', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('login page shows the credentials form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('login rejects a wrong password with a readable error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('nobody@example.com');
    await page.locator('#password').fill('wrong-password-123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText(/Incorrect email or password|Too many login attempts/)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
