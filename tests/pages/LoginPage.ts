import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    // The deployed UI calls this field "Email Address", while older/local
    // builds call it "Username". Both represent the same login identifier.
    this.usernameInput = page
      .locator('input[name="username"], input[name="email"], input[type="email"]')
      .first();
    this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectVisible() {
    await expect(this.page.getByRole('heading', { name: /admin portal/i })).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async formIsValid(): Promise<boolean> {
    return this.page.locator('form').evaluate((form) => form.checkValidity());
  }
}
