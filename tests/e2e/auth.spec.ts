import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const hasQaCredentials = Boolean(process.env.QA_USERNAME && process.env.QA_PASSWORD);
const authStatePath = 'playwright/.auth/user.json';

test.describe('Authentication', () => {
  test('protected dashboard redirects unauthenticated users to login', async ({ page }) => {
    const response = await page.goto('/dashboard');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();
  });

  test('login page exposes username, password, and submit controls', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectVisible();
  });

  test('empty login submission stays blocked by browser validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submitButton.click();
    expect(await loginPage.formIsValid()).toBe(false);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('invalid credentials do not authenticate the user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid-user', 'invalid-password');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page).not.toHaveURL(/\/dashboard$/);
    await expect(page.locator('body')).toContainText(/invalid username or password|an error occurred during login|invalid|error/i);
  });

  test.describe('with authenticated QA state', () => {
    test.skip(!hasQaCredentials, 'QA credentials are not available, so the authenticated login state is not exercised.');
    test.use({ storageState: authStatePath });

    test('authenticated QA state can reach the protected dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  });
});
