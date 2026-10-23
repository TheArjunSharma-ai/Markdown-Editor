import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/fixtures/classic.html');
  await expect(page.locator('#editor textarea')).toHaveValue('# Bundle works');
});

test('typing, toolbar, shortcuts, modes, and read-only', async ({ page }) => {
  const editor = page.locator('#editor');
  const source = editor.getByRole('textbox', { name: 'Markdown source' });
  await source.fill('# Fresh\n\n**Current**');
  await expect(editor.locator('h1')).toHaveText('Fresh');
  await source.fill('hello');
  await source.focus();
  await source.press('ControlOrMeta+a');
  await editor.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(source).toHaveValue('**hello**');
  expect(await source.evaluate((node) => [node.selectionStart, node.selectionEnd])).toEqual([2, 7]);
  await source.press('Control+i');
  await expect(source).toHaveValue('***hello***');
  await editor.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(source).toBeHidden();
  await expect(editor.getByRole('button', { name: 'Bold', exact: true })).toBeDisabled();
  await page.evaluate(() => { window.editor.focus(); });
  await expect(editor.getByRole('region', { name: 'Live preview' })).toBeFocused();
  await editor.getByRole('button', { name: 'Source', exact: true }).click();
  await page.evaluate(() => window.editor.setReadOnly(true));
  await expect(source).toHaveAttribute('readonly', '');
  await page.evaluate(() => window.editor.setValue('host update'));
  await expect(source).toHaveValue('host update');
  await expect(page.locator('#other textarea')).toHaveValue('Independent');
});

test('unsafe input does not execute and code remains literal', async ({ page }) => {
  await page.evaluate(() => {
    window.__executed = false;
    window.editor.setValue('<img src=x onerror="window.__executed=true">\n\n[bad](jav&#x61;script:alert%281%29)\n\n```html\n<script>window.__executed=true</script>\n```');
  });
  await expect(page.locator('#editor .md-editor__preview script, #editor [onerror], #editor a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.locator('#editor pre')).toContainText('<script>');
  expect(await page.evaluate(() => window.__executed)).toBe(false);
});

test('destroy cancels pending work and preserves a second instance', async ({ page }) => {
  await page.locator('#editor textarea').fill('pending');
  await page.evaluate(() => { window.editor.destroy(); window.editor.destroy(); });
  await expect(page.locator('#editor .md-editor')).toHaveCount(0);
  await expect(page.locator('#other textarea')).toHaveValue('Independent');
  await page.locator('#other textarea').fill('still usable');
  await expect(page.locator('#other .md-editor__preview')).toContainText('still usable');
});

for (const width of [320, 375, 768]) {
  test.describe(`${width}px viewport`, () => {
    test.use({ viewport: { width, height: 900 } });
    test('layout stays inside the viewport', async ({ page }) => {
      expect(await page.evaluate(() => innerWidth)).toBe(width);
      await page.evaluate(() => window.editor.setValue('```\n' + 'verylong'.repeat(200) + '\n```\n\n| column | column |\n| --- | --- |\n| ' + 'long'.repeat(200) + ' | value |'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const buttons = await page.locator('#editor button').evaluateAll((nodes) =>
        nodes.map((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
      for (const size of buttons) {
        expect(size.width).toBeGreaterThanOrEqual(44);
        expect(size.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
}

test('keyboard navigation, focus indicators, and system theme', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('#editor [data-mode="source"]')).toBeFocused();
  expect(await page.locator('#editor [data-mode="source"]').evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('solid');
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  expect(await page.locator('#editor .md-editor').evaluate((node) => getComputedStyle(node).colorScheme)).toBe('dark');
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await page.locator('#editor .md-editor').evaluate((node) => getComputedStyle(node).colorScheme)).toBe('light');
});

test('demo supports appearance, read-only, and Markdown download', async ({ page }) => {
  await page.goto('/demo/');
  const source = page.locator('#notes textarea');
  await source.fill('# Download me');
  await expect(page.locator('#save-status')).toContainText('Unsaved');
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(source).toHaveValue('# Download me');
  await expect(page.locator('#notes .md-editor')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Read only', { exact: true }).check();
  await expect(source).toHaveAttribute('readonly', '');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .md' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('project-notes.md');
  expect(await download.failure()).toBeNull();
});
