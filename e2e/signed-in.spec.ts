import { expect, test, type Page } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to a dedicated test account.');

async function signIn(page: Page) {
  await page.goto('/login');
  await page.locator('#email').fill(email!);
  await page.locator('#password').fill(password!);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe('signed-in journeys', () => {
  test('sign in, then reach the news feed', async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);
  });

  test('browse the marketplace down to a product page (no purchase)', async ({ page }) => {
    await signIn(page);
    await page.goto('/marketplace');
    const firstProduct = page.locator('a[href*="/marketplace/products/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/marketplace\/products\/[^/]+/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // Publishing writes real data: run it against a disposable database only.
  test.fixme('publish a content post, then delete it', async () => {});
});
