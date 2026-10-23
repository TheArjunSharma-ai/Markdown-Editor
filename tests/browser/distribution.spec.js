import { test, expect } from '@playwright/test';

for (const format of ['classic', 'esm']) {
  test(`${format} distribution runs without runtime CDN dependencies`, async ({ page }) => {
    const errors = [];
    const external = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173/')) external.push(request.url());
    });
    await page.goto(`/fixtures/${format}.html`);
    await expect(page.locator('#editor h1')).toHaveText('Bundle works');
    expect(await page.evaluate(() => window.editor.getHTML())).toBe('<h1>Bundle works</h1>\n');
    expect(await page.locator('#editor .md-editor').evaluate((node) => getComputedStyle(node).borderRadius)).toBe('12px');
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}
