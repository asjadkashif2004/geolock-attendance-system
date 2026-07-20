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

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

  await page.context().storageState({ path: authStatePath });
});
