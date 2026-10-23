import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { EditorState, EditorSelection } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { GFM } from '@lezer/markdown';
import { MarkdownEditor } from '../src/index.js';
import { buildDecorations } from '../src/inline/decorations.js';

let host;
let instances;
function create(options = {}) {
  const editor = MarkdownEditor.createInline({ element: host, ...options });
  instances.push(editor);
  return editor;
}
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  instances = [];
});
afterEach(() => {
  instances.forEach((editor) => editor.destroy());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('exposes a separate inline editor without changing the existing API', () => {
  const onChange = vi.fn();
  const editor = create({ value: '# Title\n\n**Bold**', onChange, theme: 'dark' });
  expect(host.querySelector('.cm-editor')).not.toBeNull();
  expect(host.querySelector('.md-inline').dataset.theme).toBe('dark');
  expect(editor.getValue()).toBe('# Title\n\n**Bold**');
  expect(editor.getHTML()).toContain('<h1>Title</h1>');
  expect(onChange).not.toHaveBeenCalled();
  editor.setValue('new *value*');
  editor.setValue('new *value*');
  expect(onChange).toHaveBeenCalledExactlyOnceWith('new *value*');
  expect(editor.getHTML()).toContain('<em>value</em>');
  expect(host.querySelector('.md-editor__footer').textContent).toContain('11 characters');
});

it('formats Markdown, supports host updates while read-only, and validates arguments', () => {
  const editor = create();
  host.querySelector('[aria-label="Bold"]').click();
  expect(editor.getValue()).toBe('**text**');
  editor.setReadOnly(true);
  expect(host.querySelector('[aria-label="Bold"]').disabled).toBe(true);
  expect(host.querySelector('.cm-content').getAttribute('contenteditable')).toBe('false');
  editor.focus();
  expect(document.activeElement).toBe(host.querySelector('.cm-content'));
  host.querySelector('[aria-label="Bold"]').click();
  expect(editor.getValue()).toBe('**text**');
  editor.setValue('host update');
  expect(editor.getValue()).toBe('host update');
  editor.setReadOnly(false);
  expect(host.querySelector('.cm-content').getAttribute('contenteditable')).toBe('true');
  expect(() => editor.setValue(null)).toThrow('string');
  expect(() => editor.setReadOnly('true')).toThrow('boolean');
  expect(() => MarkdownEditor.createInline({ element: '#missing' })).toThrow();
});

it('shares host ownership across both editor types and removes only owned UI', () => {
  const sibling = document.createElement('aside');
  host.append(sibling);
  const editor = create();
  expect(() => MarkdownEditor.create({ element: host })).toThrow('already attached');
  expect(() => create()).toThrow('already attached');
  editor.destroy();
  expect(host.firstElementChild).toBe(sibling);
  const original = MarkdownEditor.create({ element: host });
  expect(() => create()).toThrow('already attached');
  original.destroy();
  create().destroy();
});

it('cleans up and guards all methods after destruction', () => {
  const editor = create();
  editor.destroy();
  editor.destroy();
  expect(host.children).toHaveLength(0);
  for (const call of [
    () => editor.getValue(), () => editor.setValue('x'), () => editor.getHTML(),
    () => editor.setReadOnly(true), () => editor.focus(),
  ]) expect(call).toThrow('destroyed');
});

it('emits editor-level focus callbacks only for boundary transitions', async () => {
  const onFocus = vi.fn();
  const onBlur = vi.fn();
  const editor = create({ onFocus, onBlur });
  editor.focus();
  expect(document.activeElement).toBe(host.querySelector('.cm-content'));
  host.querySelector('button').focus();
  await Promise.resolve();
  expect(onFocus).toHaveBeenCalledTimes(1);
  expect(onBlur).not.toHaveBeenCalled();
  const outside = document.createElement('button');
  document.body.append(outside);
  outside.focus();
  await Promise.resolve();
  expect(onBlur).toHaveBeenCalledTimes(1);
});

function decorations(value, selection = 0, focused = false, readOnly = false) {
  const state = EditorState.create({
    doc: value,
    selection: typeof selection === 'number' ? { anchor: selection } : selection,
    extensions: [markdown({ extensions: GFM }), EditorState.readOnly.of(readOnly)],
  });
  const result = [];
  buildDecorations({ state, hasFocus: focused }).between(0, state.doc.length, (from, to, decoration) => {
    result.push({ from, to, spec: decoration.spec });
  });
  return result;
}

it('hides syntax only on inactive lines and leaves source unchanged', () => {
  const value = '# Heading\n\n**bold** and *italic* and ~~gone~~ and `code`\n\n[link](https://example.com)';
  const inactive = decorations(value);
  expect(inactive.some((range) => range.spec.class?.includes('md-inline__h1'))).toBe(true);
  expect(inactive.filter((range) => !range.spec.class).length).toBeGreaterThan(8);
  const active = decorations(value, 2, true);
  expect(active.some((range) => range.from === 0 && range.to === 2)).toBe(false);
  expect(active.some((range) => range.from > 10 && !range.spec.class)).toBe(true);
  expect(decorations(value, 2, true, true)).toEqual(inactive);
  const selected = decorations(value, EditorSelection.single(0, value.length), true);
  expect(selected.filter((range) => !range.spec.class)).toHaveLength(0);
});

it('decorates quotes, lists, fenced blocks, and safe images', () => {
  const value = '> quote\n\n- item\n\n```js\nconst x = 1;\n```\n\n![alt](https://example.com/image.png)\n';
  const ranges = decorations(value);
  expect(ranges.some((range) => range.spec.class === 'md-inline__quote')).toBe(true);
  expect(ranges.some((range) => range.spec.class === 'md-inline__fence')).toBe(true);
  const widgets = ranges.filter((range) => range.spec.widget).map((range) => range.spec.widget);
  expect(widgets).toHaveLength(2);
  expect(widgets[0].toDOM().textContent).toBe('•');
  const image = widgets[1].toDOM().querySelector('img');
  expect(image.getAttribute('src')).toBe('https://example.com/image.png');
  expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
  expect(widgets[1].ignoreEvent()).toBe(false);
  expect(widgets[1].eq(widgets[1])).toBe(true);
});

it('retains multiline Markdown without invalid cross-line replacements', () => {
  const value = '[two\nlines](https://example.com "title")\n\n`multi\nline`\n';
  const ranges = decorations(value);
  expect(ranges.some((range) => range.spec.class === 'md-inline__link')).toBe(true);
  expect(ranges.some((range) => range.spec.class === 'md-inline__code')).toBe(true);
});

it('uses LF line endings consistently for inline edits and callbacks', () => {
  const onChange = vi.fn();
  const editor = create({ value: 'a\r\nb', onChange });
  expect(editor.getValue()).toBe('a\nb');
  expect(onChange).not.toHaveBeenCalled();
  editor.setValue('a\r\nb');
  expect(onChange).not.toHaveBeenCalled();
  editor.setValue('x\r\ny');
  expect(editor.getValue()).toBe('x\ny');
  expect(onChange).toHaveBeenCalledExactlyOnceWith('x\ny');
});

it('renders inactive tables and reveals their Markdown only while editing', () => {
  const value = '| Name | Status |\n| --- | ---: |\n| **Notes** | Ready |\n\nOutside';
  const onChange = vi.fn();
  const editor = create({ value, onChange });
  expect(host.querySelectorAll('.md-inline__table th')).toHaveLength(2);
  expect(host.querySelector('.md-inline__table strong').textContent).toBe('Notes');
  editor.focus();
  expect(host.querySelector('.md-inline__table')).toBeNull();
  expect(host.querySelector('.cm-content').textContent).toContain('| Name | Status |');
  editor.setReadOnly(true);
  expect(host.querySelector('.md-inline__table table')).not.toBeNull();
  editor.setValue('| New | Table |\n| --- | --- |\n| Updated | Cell |');
  expect(host.querySelector('.md-inline__table td').textContent).toBe('Updated');
  expect(editor.getHTML()).toContain('<table>');
  expect(onChange).toHaveBeenCalledExactlyOnceWith(editor.getValue());
  editor.setReadOnly(false);
  expect(host.querySelector('.md-inline__table')).toBeNull();
  expect(editor.getValue()).toContain('| Updated | Cell |');
});

it('sanitizes table previews and leaves fenced tables as code', () => {
  const editor = create({
    value: '| Name | Link |\n| --- | --- |\n| <script>alert(1)</script> | [bad](javascript:alert(1)) |',
  });
  expect(host.querySelector('.md-inline__table table')).not.toBeNull();
  expect(host.querySelector('script, [onerror], a[href^="javascript:"]')).toBeNull();
  editor.setValue('```\n| Name | Link |\n| --- | --- |\n| Value | Value |\n```');
  expect(host.querySelector('.md-inline__table')).toBeNull();
});
