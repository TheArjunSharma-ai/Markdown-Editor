import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/markdown/parser.js';

describe('Markdown rendering', () => {
  it.each([
    ['# Heading', '<h1>Heading</h1>'],
    ['paragraph', '<p>paragraph</p>'],
    ['**bold** *italic* ~~gone~~', '<strong>bold</strong> <em>italic</em> <s>gone</s>'],
    ['[link](https://example.com)', '<a href="https://example.com">link</a>'],
    ['![alt](./image.png)', 'src="./image.png"'],
    ['- first\n  - nested', '<ul>'],
    ['3. third', '<ol start="3">'],
    ['> quote', '<blockquote>'],
    ['`inline`', '<code>inline</code>'],
    ['```js\nalert(1)\n```', '<pre><code>alert(1)\n</code></pre>'],
    ['| a | b |\n| - | - |\n| 1 | 2 |', '<table>'],
    ['---', '<hr>'],
  ])('supports %s', (markdown, expected) => {
    expect(renderMarkdown(markdown)).toContain(expected);
  });
  it('escapes raw HTML and preserves Unicode safely', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).toContain('&lt;script&gt;');
    expect(renderMarkdown('你好 🌍 & <word>')).toContain('你好 🌍 &amp; &lt;word&gt;');
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown('[malformed]((')).toContain('[malformed]((');
  });
});
