# Playwright QA Suite

This repository now includes a Playwright end-to-end suite for the GeoLock attendance dashboard.

## Coverage

- Public smoke coverage for the login screen, redirects, console errors, broken images, and unknown routes.
- Authentication coverage for login form behavior, invalid credentials, and authenticated storage state.
- Dashboard coverage for the protected dashboard, logout, refresh stability, and viewport checks.
- Navigation coverage for sidebar links and the main protected pages that exist in this app.

## Installation

Install the test dependencies if they are not already present:

```bash
npm ci
npm exec playwright install --with-deps
```

## Environment Variables

Create a local `.env` file from `.env.example` and provide only placeholders or QA-only values:

```env
BASE_URL=http://127.0.0.1:PORT
QA_USERNAME=
QA_PASSWORD=
```

- `BASE_URL` is used as the test target when provided.
- If `BASE_URL` is not set, the suite falls back to the local app server on port `3001`.
- `QA_USERNAME` and `QA_PASSWORD` are only used for authenticated tests.

## Local Run

Run the full suite:

```bash
npm run test:e2e
```

Run only smoke tests:

```bash
npm run test:e2e:smoke
```

Run headed mode:

```bash
npm run test:e2e:headed
```

Open the HTML report:

```bash
npm run test:e2e:report
```

## Authentication Behavior

- If `QA_USERNAME` and `QA_PASSWORD` are not available, authenticated tests skip cleanly with a clear reason.
- When credentials are available, the suite logs in once, saves the authenticated storage state to `playwright/.auth/user.json`, and reuses it for protected-page coverage.

## GitHub Secrets

Configure these repository secrets for CI:

- `BASE_URL`
- `QA_USERNAME`
- `QA_PASSWORD`
- `DISCORD_WEBHOOK_URL`

The workflow reads secrets through environment variables and does not print their values.

Add them in GitHub under **Settings → Secrets and variables → Actions → New repository secret**. The Discord webhook must be stored as `DISCORD_WEBHOOK_URL`; never commit it to this repository. Because a webhook shared in chat should be treated as exposed, rotate/delete that webhook in Discord and store the replacement URL in GitHub.

The CI workflow runs the complete Playwright suite for pull requests and pushes to `main` or `master` when both QA credential secrets are configured. Without them, it runs the public smoke suite and clearly records that decision in the job log. It uploads the HTML report and failure artifacts, then posts the final job status and Actions run link to Discord. Discord delivery is best-effort, so a notification outage cannot hide or change the Playwright result.

## Recommended branch protection

In **Settings → Branches → Branch protection rules**, protect the repository's default branch and:

- Require a pull request before merging.
- Require the `test` job from the **Playwright QA** workflow to pass.
- Require branches to be up to date before merging.
- Block force pushes and branch deletion.
- Require at least one approval when more than one maintainer is available.

Repository settings cannot be enforced by files in this working tree, so an administrator must enable these rules in GitHub.

## Safety

Never run destructive flows against production data.

- Do not add tests that create, update, or delete real attendance records.
- Cancel destructive dialogs if a page exposes them.
- Keep this suite limited to read-only verification unless a dedicated safe test environment exists.
