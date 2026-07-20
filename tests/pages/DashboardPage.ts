import { expect, Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  heading(): Locator {
    return this.page.getByRole('heading', { name: /dashboard/i });
  }

  navLink(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectCoreDashboardContent() {
    await expect(this.heading()).toBeVisible();
    await expect(this.page.getByText('Total Employees')).toBeVisible();
    await expect(this.page.getByText('Present Today')).toBeVisible();
    await expect(this.page.getByText('Late Check-ins')).toBeVisible();
    await expect(this.page.getByText('Absent Today')).toBeVisible();
    await expect(this.page.getByText('Weekly Attendance Overview')).toBeVisible();
    await expect(this.page.getByText("Today's Summary")).toBeVisible();
    await expect(this.page.getByText("Today's Attendance")).toBeVisible();
    await expect(this.page.getByText('Location Overview')).toBeVisible();
    await expect(this.page.getByText('Payroll Summary')).toBeVisible();
  }

  async hasNoHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth <= window.innerWidth + 2;
    });
  }
}
