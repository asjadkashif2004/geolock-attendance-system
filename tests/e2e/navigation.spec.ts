import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

const hasQaCredentials = Boolean(process.env.QA_USERNAME && process.env.QA_PASSWORD);

test.skip(!hasQaCredentials, 'QA credentials are not available, so authenticated navigation checks are skipped safely.');

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Navigation', () => {
  test('sidebar links are visible after authentication', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await expect(dashboard.navLink('Dashboard')).toBeVisible();
    await expect(dashboard.navLink('Employees')).toBeVisible();
    await expect(dashboard.navLink('Attendance')).toBeVisible();
    await expect(dashboard.navLink('Locations')).toBeVisible();
    await expect(dashboard.navLink('Reports')).toBeVisible();
    await expect(dashboard.navLink('Payroll')).toBeVisible();
    await expect(dashboard.navLink('Settings')).toBeVisible();
  });

  test('employees link renders the employee management screen', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.navLink('Employees').click();

    await expect(page).toHaveURL(/\/employees$/);
    await expect(page.getByRole('heading', { name: /employees/i })).toBeVisible();
    await expect(page.getByText('Add Employee')).toBeVisible();
  });

  test('attendance link renders the attendance screen', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.navLink('Attendance').click();

    await expect(page).toHaveURL(/\/attendance$/);
    await expect(page.getByRole('heading', { name: /attendance management/i })).toBeVisible();
    await expect(page.getByText('Export')).toBeVisible();
  });

  test('locations link renders the location screen', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.navLink('Locations').click();

    await expect(page).toHaveURL(/\/locations$/);
    await expect(page.getByRole('heading', { name: /location management/i })).toBeVisible();
    await expect(page.getByText('Add Location')).toBeVisible();
  });

  test('reports and payroll links render meaningful content', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.navLink('Reports').click();
    await expect(page).toHaveURL(/\/reports$/);
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible();
    await expect(page.getByText('Export PDF')).toBeVisible();

    await dashboard.navLink('Payroll').click();
    await expect(page).toHaveURL(/\/payroll$/);
    await expect(page.getByRole('heading', { name: /payroll management/i })).toBeVisible();
    await expect(page.getByText('Generate Payroll')).toBeVisible();
  });

  test('settings navigation renders the settings hub and account page', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.navLink('Settings').click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: /admin settings/i })).toBeVisible();

    await page.getByRole('link', { name: /update/i }).click();
    await expect(page).toHaveURL(/\/settings\/account$/);
    await expect(page.getByRole('heading', { name: /account settings/i })).toBeVisible();
  });
});
