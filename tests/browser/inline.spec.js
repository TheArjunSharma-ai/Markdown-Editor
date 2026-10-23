import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/fixtures/classic.html');
  await expect(page.locator('#inline .cm-content')).toBeVisible();
});

test('reveals markers only on the active line and restores preview on blur', async ({ page }) => {
  const content = page.locator('#inline .cm-content');
  expect(await content.innerText()).not.toContain('# Inline heading');
  await expect(content).not.toContainText('**bold**');
  await content.click({ position: { x: 12, y: 16 } });
  await page.keyboard.press('ControlOrMeta+Home');
  await expect(content).toContainText('# Inline heading');
  await expect(content).not.toContainText('**bold**');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(content).toContainText('**bold**');
  expect(await content.innerText()).not.toContain('# Inline heading');
  await page.locator('#outside').click();
  await expect(content).not.toContainText('**bold**');
  expect(await page.evaluate(() => window.inlineEditor.getValue())).toContain('**bold**');
});

test('edits one document with line breaks, formatting, undo, and read-only', async ({ page }, testInfo) => {
  const mod = testInfo.project.name === 'mobile-webkit' ? 'Meta' : 'ControlOrMeta';
  await page.evaluate(() => { window.inlineEditor.setValue(''); window.inlineEditor.focus(); });
  const content = page.locator('#inline .cm-content');
  await page.keyboard.type('# New heading');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('A **formatted** paragraph');
  expect(await page.evaluate(() => window.inlineEditor.getValue())).toBe('# New heading\n\nA **formatted** paragraph');
  await page.keyboard.press(`${mod}+a`);
  await page.keyboard.type('hello');
  await page.keyboard.press(`${mod}+a`);
  await page.locator('#inline').getByRole('button', { name: 'Bold', exact: true }).click();
  expect(await page.evaluate(() => window.inlineEditor.getValue())).toBe('**hello**');
  await page.keyboard.press(`${mod}+z`);
  expect(await page.evaluate(() => window.inlineEditor.getValue())).toBe('hello');
  await page.evaluate(() => window.inlineEditor.setReadOnly(true));
  await expect(content).toHaveAttribute('contenteditable', 'false');
  await expect(page.locator('#inline').getByRole('button', { name: 'Bold', exact: true })).toBeDisabled();
  await page.evaluate(() => window.inlineEditor.setValue('host **update**'));
  expect(await page.evaluate(() => window.inlineEditor.getHTML())).toContain('<strong>update</strong>');
  await expect(page.locator('#editor textarea')).toHaveValue('# Bundle works');
});

test('supports keyboard selection, Markdown shortcuts, safe image widgets, and teardown', async ({ page }, testInfo) => {
  const mod = testInfo.project.name === 'mobile-webkit' ? 'Meta' : 'ControlOrMeta';
  await page.evaluate(() => { window.inlineEditor.setValue('hello'); window.inlineEditor.focus(); });
  await page.keyboard.press(`${mod}+a`);
  await page.keyboard.press(`${mod}+i`);
  expect(await page.evaluate(() => window.inlineEditor.getValue())).toBe('*hello*');
  await page.route('https://images.example.test/**', (route) => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7WQAAAAASUVORK5CYII=', 'base64'),
  }));
  await page.evaluate(() => window.inlineEditor.setValue('![safe](https://images.example.test/image.png)\n\n<img src=x onerror="window.__inlineExecuted=true">\n\n[bad](javascript:alert(1))'));
  await page.locator('#outside').click();
  const image = page.locator('#inline .md-inline__image img');
  await expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
  await image.click();
  await expect(page.locator('#inline .cm-content')).toContainText('![safe]');
  await expect(page.locator('#inline script, #inline [onerror], #inline a[href^="javascript:"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__inlineExecuted)).toBeUndefined();
  await page.evaluate(() => { window.inlineEditor.destroy(); window.inlineEditor.destroy(); });
  await expect(page.locator('#inline .cm-editor')).toHaveCount(0);
  await expect(page.locator('#other textarea')).toHaveValue('Independent');
});

test('demo includes an independent inline editor, appearance, and download', async ({ page }, testInfo) => {
  const mod = testInfo.project.name === 'mobile-webkit' ? 'Meta' : 'ControlOrMeta';
  await page.goto('/demo/');
  const content = page.locator('#inline-notes .cm-content');
  await content.click();
  await page.keyboard.press(`${mod}+a`);
  await page.keyboard.type('# Inline download');
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(content).toContainText('Inline download');
  await expect(page.locator('#inline-notes .md-editor')).toHaveAttribute('data-theme', 'dark');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download inline .md', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('inline-notes.md');
  expect(await download.failure()).toBeNull();
  await page.getByLabel('Read only', { exact: true }).check();
  await expect(content).toHaveAttribute('contenteditable', 'false');
});

test('multiline Unicode paste remains editable at narrow widths', async ({ page }) => {
  await page.evaluate(() => { window.inlineEditor.setValue(''); window.inlineEditor.focus(); });
  const markdown = '# 你好 🌍\n\nA **bold** line\n\n- one\n- two';
  await page.keyboard.insertText(markdown);
  await expect.poll(() => page.evaluate(() => window.inlineEditor.getValue())).toBe(markdown);
  await page.locator('#outside').click();
  expect(await page.evaluate(() => window.inlineEditor.getHTML())).toContain('<h1>你好 🌍</h1>');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('strikethrough toggles and displays a line through text on active and inactive lines', async ({ page }, testInfo) => {
  const mod = testInfo.project.name === 'mobile-webkit' ? 'Meta' : 'ControlOrMeta';
  await page.evaluate(() => { window.inlineEditor.setValue('remove this'); window.inlineEditor.focus(); });
  await page.keyboard.press(`${mod}+a`);
  const strike = page.locator('#inline').getByRole('button', { name: 'Strikethrough', exact: true });
  await strike.click();
  expect(await page.evaluate(() => window.inlineEditor.getValue())).toBe('~~remove this~~');
  expect(await page.evaluate(() => window.inlineEditor.getHTML())).toBe('<p><s>remove this</s></p>\n');
  const decorated = page.locator('#inline .md-inline__strike').filter({ hasText: 'remove this' });
  await expect(decorated).toBeVisible();
  expect(await decorated.evaluate((node) => getComputedStyle(node).textDecorationLine)).toContain('line-through');
  await strike.click();
  expect(await page.evaluate(() => window.inlineEditor.getValue())).toBe('remove this');
  await expect(page.locator('#inline .md-inline__strike')).toHaveCount(0);
  await strike.click();
  await page.locator('#outside').click();
  await expect(page.locator('#inline .cm-content')).not.toContainText('~~');
  await expect(decorated).toHaveText('remove this');
  expect(await decorated.evaluate((node) => getComputedStyle(node).textDecorationLine)).toContain('line-through');
});
