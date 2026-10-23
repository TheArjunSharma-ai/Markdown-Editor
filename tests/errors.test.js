import { afterEach, expect, it, vi } from 'vitest';
import { MarkdownEditor } from '../src/index.js';
import { renderMarkdown } from '../src/markdown/parser.js';

vi.mock('../src/markdown/parser.js', () => ({
  renderMarkdown: vi.fn((value) => `<p>${value}</p>`),
}));

afterEach(() => {
  vi.mocked(renderMarkdown).mockImplementation((value) => `<p>${value}</p>`);
  document.body.replaceChildren();
  vi.useRealTimers();
});

it('surfaces rendering errors, clears stale output, and recovers', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const editor = MarkdownEditor.create({ element: host, value: 'initial' });
  vi.mocked(renderMarkdown).mockImplementationOnce(() => { throw new Error('Parser failed'); });
  expect(() => editor.setValue('new')).toThrow('Parser failed');
  expect(host.querySelector('[role="status"]').textContent).toContain('Unable to render preview');
  expect(host.querySelector('.md-editor__preview').innerHTML).toBe('');
  expect(editor.getValue()).toBe('new');
  expect(editor.getHTML()).toBe('<p>new</p>');
  expect(host.querySelector('[role="status"]').textContent).toBe('Preview ready');
  editor.destroy();
});

it('propagates asynchronous rendering errors as well as accessible status', () => {
  vi.useFakeTimers();
  const host = document.createElement('div');
  document.body.append(host);
  const editor = MarkdownEditor.create({ element: host });
  vi.mocked(renderMarkdown).mockImplementationOnce(() => { throw new Error('Async parser failure'); });
  const source = host.querySelector('textarea');
  source.value = 'new';
  source.dispatchEvent(new Event('input'));
  expect(() => vi.advanceTimersByTime(150)).toThrow('Async parser failure');
  expect(host.querySelector('[role="status"]').textContent).toContain('Unable to render preview');
  editor.destroy();
});

it('does not reserve a host when initial rendering fails', () => {
  const host = document.createElement('div');
  document.body.append(host);
  vi.mocked(renderMarkdown).mockImplementationOnce(() => { throw new Error('Initial failure'); });
  expect(() => MarkdownEditor.create({ element: host })).toThrow('Initial failure');
  expect(host.children).toHaveLength(0);
  MarkdownEditor.create({ element: host }).destroy();
});
