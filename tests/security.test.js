import { describe, expect, it } from 'vitest';
import { isAllowedURL } from '../src/security/urls.js';
import { sanitize } from '../src/security/sanitize.js';
import { renderMarkdown } from '../src/markdown/parser.js';

describe('URL policy', () => {
  it.each(['https://example.com', 'http://example.com/a', ' /relative ', './a', '../a', '#anchor', '?q=a', 'https://example.com/a%20b'])('allows %s', (url) => {
    expect(isAllowedURL(url)).toBe(true);
    expect(isAllowedURL(url, 'image')).toBe(true);
  });
  it('allows mailto links but not images', () => {
    expect(isAllowedURL('mailto:hello@example.com')).toBe(true);
    expect(isAllowedURL('mailto:hello@example.com', 'image')).toBe(false);
  });
  it.each([
    '', ' ', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)',
    'data:text/html,test', 'blob:https://example.com/id', 'file:///a', 'vbscript:x',
    '//example.com', '\\\\example.com', '/\\example.com', 'https://[invalid',
    'https://example.com/a b', 'java\u0000script:alert(1)', 'ftp://example.com',
  ])('rejects %j', (url) => {
    expect(isAllowedURL(url)).toBe(false);
    expect(isAllowedURL(url, 'image')).toBe(false);
  });
});

describe('sanitization', () => {
  it.each([
    '<script>alert(1)</script>', '<img src=x onerror=alert(1)>',
    '<svg><a href="javascript:alert(1)">x</a></svg>',
    '<iframe src="https://example.com"></iframe>',
    '<p style="color:red" class="host" data-x="y" aria-label="bad">ok</p>',
    '<a href="jav&#x61;script:alert(1)">bad</a>',
    '<img src="data:image/svg+xml,test">',
    '<a href="//example.com">bad</a>',
    '<img src="mailto:someone@example.com">',
    '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=alert(1)>">',
  ])('removes unsafe content from %s', (html) => {
    const container = document.createElement('div');
    container.innerHTML = sanitize(html);
    expect(container.querySelector('script,svg,iframe,style,math')).toBeNull();
    for (const element of container.querySelectorAll('*')) {
      for (const attribute of element.attributes) {
        expect(attribute.name).not.toMatch(/^(on|style|class|data-|aria-)/);
        if (attribute.name === 'src' || attribute.name === 'href') {
          expect(isAllowedURL(attribute.value, element.tagName === 'IMG' ? 'image' : 'link')).toBe(true);
        }
      }
    }
  });
  it('retains intended attributes and enforces no-referrer', () => {
    const html = sanitize('<a href="/safe" title="ok">x</a><img src="https://example.com/a.png" alt="image" referrerpolicy="unsafe-url">');
    expect(html).toContain('href="/safe"');
    expect(html).toContain('title="ok"');
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).not.toContain('unsafe-url');
  });
  it.each([
    '[bad](javascript:alert(1))',
    '[bad](jav&#x61;script:alert%281%29)',
    '![x](data:image/png;base64,AAAA)',
    '[bad](//example.com)',
    '<img src=x onerror=alert(1)>',
    '```html\n<script>alert(1)</script>\n```',
  ])('never produces executable markup from Markdown %s', (markdown) => {
    const container = document.createElement('div');
    container.innerHTML = renderMarkdown(markdown);
    expect(container.querySelector('script,[onerror],[onclick],a[href^="javascript:"],img[src^="data:"]')).toBeNull();
  });
});
