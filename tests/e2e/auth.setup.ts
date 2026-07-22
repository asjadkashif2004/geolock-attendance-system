import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';

const hasQaCredentials = Boolean(process.env.QA_USERNAME && process.env.QA_PASSWORD);
const authStatePath = path.join('playwright', '.auth', 'user.json');

test.skip(!hasQaCredentials, 'QA_USERNAME and QA_PASSWORD are required to create authenticated storage state.');

test('authenticate QA account and persist storage state', async ({ page }) => {
  fs.mkdirSync(path.dirname(authStatePath), { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.QA_USERNAME!, process.env.QA_PASSWORD!);

  // Make authentication failures actionable instead of reporting only that
  // the dashboard heading is missing.
  await page.waitForLoadState('domcontentloaded');
  if (/\/login(?:$|\?)/.test(page.url())) {
    const message = (await page.getByRole('alert').allTextContents()).join(' ').trim();
    throw new Error(
      `QA login did not authenticate. The app stayed on /login.${message ? ` Server message: ${message}` : ''} ` +
      'Verify QA_USERNAME/QA_PASSWORD and the Vercel Supabase configuration.',
    );
  }

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

  await page.context().storageState({ path: authStatePath });
});
