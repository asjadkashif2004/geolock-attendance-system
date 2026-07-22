import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

const hasQaCredentials = Boolean(process.env.QA_USERNAME && process.env.QA_PASSWORD);

test.skip(!hasQaCredentials, 'QA credentials are not available, so dashboard coverage is skipped safely.');

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Dashboard', () => {
  test('loads the protected dashboard and key widgets are visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.expectCoreDashboardContent();
  });

  test('logout returns the user to the login screen', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await page.goto('/logout');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();
  });

  test('refreshing the dashboard keeps the page stable', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await expect(dashboard.heading()).toBeVisible();
    await page.reload();
    await expect(dashboard.heading()).toBeVisible();
    await expect(dashboard.hasNoHorizontalOverflow()).resolves.toBeTruthy();
  });

  test('dashboard remains within viewport at common breakpoints', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const viewports = [
      { width: 1440, height: 1024 },
      { width: 1024, height: 768 },
      { width: 390, height: 844 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await dashboard.goto();
      await expect(dashboard.heading()).toBeVisible();
      await expect(dashboard.hasNoHorizontalOverflow()).resolves.toBeTruthy();
    }
  });
});
