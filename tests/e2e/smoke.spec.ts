import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Smoke', () => {
  test('public login page loads and the app redirects unauthenticated users', async ({ page }) => {
    const pageErrors: string[] = [];
    const failedAppResponses: string[] = [];

    page.on('response', (response) => {
      if (new URL(response.url()).origin === new URL(page.url()).origin && response.status() >= 400) {
        failedAppResponses.push(`${response.status()} ${response.url()}`);
      }
    });
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page).toHaveURL(/\/login$/);

    const loginPage = new LoginPage(page);
    await loginPage.expectVisible();

    const images = page.locator('img');
    await expect(images).toHaveCount(1);
    await expect(images.first()).toBeVisible();
    const brokenImage = await images.first().evaluate((img: HTMLImageElement) => ({
      complete: img.complete,
      naturalWidth: img.naturalWidth,
    }));
    expect(brokenImage.complete).toBeTruthy();
    expect(brokenImage.naturalWidth).toBeGreaterThan(0);

    await page.goto('/login');
    await expect(page).toHaveURL(/\/login$/);

    expect(failedAppResponses).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('unknown routes resolve to a safe public response', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/this-route-does-not-exist');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();
  });
});
