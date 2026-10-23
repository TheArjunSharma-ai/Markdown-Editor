import { test, expect } from '@playwright/test';
import { cpus, platform, release } from 'node:os';

test('100 KB preview latency and 1 MB stress integrity', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Performance sample uses one desktop Chromium baseline.');
  test.setTimeout(120000);
  await page.goto('/fixtures/classic.html');
  await expect(page.locator('#editor textarea')).toBeVisible();
  const measurements = await page.evaluate(async () => {
    const paragraph = 'A measured paragraph with **bold**, *italic*, and inline `code`. '.repeat(8) + '\n\n';
    const fixture = paragraph.repeat(Math.ceil(102400 / paragraph.length)).slice(0, 102400);
    const source = document.querySelector('#editor textarea');
    const preview = document.querySelector('#editor .md-editor__preview');
    window.editor.setValue(fixture);
    async function edit(index) {
      return new Promise((resolve) => {
        const start = performance.now();
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve(performance.now() - start);
        });
        observer.observe(preview, { childList: true });
        source.value = fixture + `\n\nEdit ${index}`;
        source.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    await edit(-1);
    const samples = [];
    for (let index = 0; index < 30; index++) samples.push(await edit(index));
    samples.sort((a, b) => a - b);
    const large = paragraph.repeat(Math.ceil(1048576 / paragraph.length)).slice(0, 1048576);
    const stressStart = performance.now();
    window.editor.setValue(large);
    return {
      fixtureBytes: new TextEncoder().encode(fixture).length,
      samples,
      p95Ms: samples[Math.ceil(samples.length * .95) - 1],
      stressBytes: new TextEncoder().encode(large).length,
      stressMs: performance.now() - stressStart,
      stressContentPreserved: window.editor.getValue() === large && source.value === large,
    };
  });
  const report = {
    os: `${platform()} ${release()}`,
    cpu: cpus()[0].model,
    browser: browser.version(),
    ...measurements,
  };
  await testInfo.attach('performance-sample', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  console.log(JSON.stringify(report));
  expect(measurements.fixtureBytes).toBe(102400);
  expect(measurements.samples).toHaveLength(30);
  expect(measurements.p95Ms).toBeLessThanOrEqual(500);
  expect(measurements.stressBytes).toBe(1048576);
  expect(measurements.stressContentPreserved).toBe(true);
});
