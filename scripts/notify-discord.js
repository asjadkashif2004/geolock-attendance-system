const fs = require('fs');

const resultsFile = process.env.PLAYWRIGHT_RESULTS || 'test-results/results.json';
const maxDescription = 3900;

function collectTests(suites, parents = [], output = []) {
  for (const suite of suites || []) {
    const nextParents = suite.title ? [...parents, suite.title] : parents;
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const results = test.results || [];
        const last = results.at(-1);
        const status = test.status || last?.status || 'unknown';
        const error = last?.errors?.[0]?.message || last?.error?.message || '';
        output.push({
          title: [...nextParents, spec.title].filter(Boolean).join(' > '),
          project: test.projectName || 'default',
          status,
          error: error.split('\n')[0].slice(0, 300),
        });
      }
    }
    collectTests(suite.suites, nextParents, output);
  }
  return output;
}

function label(status) {
  if (status === 'expected' || status === 'passed') return 'PASS';
  if (status === 'skipped') return 'SKIP';
  if (status === 'flaky') return 'FLAKY';
  return 'FAIL';
}

function splitLines(lines) {
  const messages = [];
  let current = '';
  for (const line of lines) {
    if (`${current}${line}\n`.length > maxDescription && current) {
      messages.push(current.trimEnd());
      current = '';
    }
    current += `${line}\n`;
  }
  if (current) messages.push(current.trimEnd());
  return messages;
}

async function post(webhook, payload) {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Discord returned HTTP ${response.status}: ${await response.text()}`);
}

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    console.log('DISCORD_WEBHOOK_URL is not configured; skipping notification.');
    return;
  }
  if (!fs.existsSync(resultsFile)) {
    await post(webhook, {
      username: 'Playwright QA',
      content: `QA ${process.env.QA_OUTCOME || 'unknown'}: no Playwright result file was produced. ${process.env.RUN_URL || ''}`,
    });
    return;
  }

  const tests = collectTests(JSON.parse(fs.readFileSync(resultsFile, 'utf8')).suites);
  const passed = tests.filter((test) => ['expected', 'passed'].includes(test.status)).length;
  const failed = tests.filter((test) => !['expected', 'passed', 'skipped', 'flaky'].includes(test.status)).length;
  const skipped = tests.filter((test) => test.status === 'skipped').length;
  const flaky = tests.filter((test) => test.status === 'flaky').length;
  const outcome = process.env.QA_OUTCOME || (failed ? 'failure' : 'success');
  const lines = [
    `QA ${outcome.toUpperCase()} | ${process.env.REPOSITORY || 'repository'}`,
    `Branch: ${process.env.BRANCH_NAME || 'unknown'} | Commit: ${(process.env.COMMIT_SHA || '').slice(0, 7) || 'unknown'}`,
    `Total: ${tests.length} | Passed: ${passed} | Failed: ${failed} | Flaky: ${flaky} | Skipped: ${skipped}`,
    `Run: ${process.env.RUN_URL || 'not available'}`,
    '',
    ...tests.map((test) => `[${label(test.status)}] [${test.project}] ${test.title}${test.error ? ` - ${test.error}` : ''}`),
  ];
  const pages = splitLines(lines);
  for (let index = 0; index < pages.length; index += 1) {
    await post(webhook, {
      username: 'Playwright QA',
      embeds: [{
        title: `GeoLock Playwright results${pages.length > 1 ? ` (${index + 1}/${pages.length})` : ''}`,
        description: pages[index],
        color: failed || outcome !== 'success' ? 15548997 : 5763719,
      }],
    });
  }
}

main().catch((error) => {
  console.error(`Discord notification failed: ${error.message}`);
  process.exitCode = 1;
});
