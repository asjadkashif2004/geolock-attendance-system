import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const DEFAULT_PORT = 3001;
const localPort = Number(process.env.PORT || DEFAULT_PORT);
const localBaseURL = `http://127.0.0.1:${localPort}`;
const baseURL = process.env.BASE_URL || localBaseURL;
const hasQaCredentials = Boolean(process.env.QA_USERNAME && process.env.QA_PASSWORD);
const authStatePath = path.join('playwright', '.auth', 'user.json');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
    ['line'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'smoke',
      testMatch: /smoke\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'dashboard',
      testMatch: /dashboard\.spec\.ts/,
      dependencies: ['setup'],
      use: hasQaCredentials
        ? {
            ...devices['Desktop Chrome'],
            storageState: authStatePath,
          }
        : {
            ...devices['Desktop Chrome'],
          },
    },
    {
      name: 'navigation',
      testMatch: /navigation\.spec\.ts/,
      dependencies: ['setup'],
      use: hasQaCredentials
        ? {
            ...devices['Desktop Chrome'],
            storageState: authStatePath,
          }
        : {
            ...devices['Desktop Chrome'],
          },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'node server.js',
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          PORT: String(localPort),
          NODE_ENV: 'development',
        },
      },
});
