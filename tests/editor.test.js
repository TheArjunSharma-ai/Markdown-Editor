import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownEditor } from '../src/index.js';

let instances;
let host;
function create(options = {}) {
  const editor = MarkdownEditor.create({ element: host, ...options });
  instances.push(editor);
  return editor;
}
function input(value) {
  const source = host.querySelector('textarea');
  source.value = value;
  source.dispatchEvent(new Event('input', { bubbles: true }));
  return source;
}
beforeEach(() => {
  instances = [];
  host = document.createElement('div');
  document.body.append(host);
});
afterEach(() => {
  instances.forEach((editor) => editor.destroy());
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('public API', () => {
  it('preserves exact values, defaults, and callback counts', () => {
    const onChange = vi.fn();
    const editor = create({ value: 'Hello\r\n世界 🌍', onChange });
    expect(editor.getValue()).toBe('Hello\r\n世界 🌍');
    expect(onChange).not.toHaveBeenCalled();
    editor.setValue(editor.getValue());
    expect(onChange).not.toHaveBeenCalled();
    editor.setValue('# Current');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('# Current');
    expect(editor.getHTML()).toBe('<h1>Current</h1>\n');
    expect(host.querySelector('textarea').value).toBe('# Current');
    editor.setValue('');
    expect(editor.getHTML()).toBe('');
  });

  it('debounces a burst once while value and getHTML stay current', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const editor = create({ onChange });
    const preview = host.querySelector('.md-editor__preview');
    input('# A');
    vi.advanceTimersByTime(100);
    input('# B');
    expect(preview.innerHTML).toBe('');
    expect(editor.getValue()).toBe('# B');
    expect(onChange).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(149);
    expect(preview.innerHTML).toBe('');
    vi.advanceTimersByTime(1);
    expect(preview.innerHTML).toBe('<h1>B</h1>\n');
    input('**Newest**');
    expect(editor.getHTML()).toBe('<p><strong>Newest</strong></p>\n');
    expect(vi.getTimerCount()).toBe(0);
    input('**Newest**');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('defers rendering during IME composition and ignores shortcuts', () => {
    vi.useFakeTimers();
    const editor = create();
    const source = host.querySelector('textarea');
    input('pending');
    source.dispatchEvent(new Event('compositionstart'));
    input('你好');
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }));
    vi.advanceTimersByTime(300);
    expect(editor.getValue()).toBe('你好');
    expect(host.querySelector('.md-editor__preview').textContent).toBe('');
    source.dispatchEvent(new Event('compositionend'));
    vi.advanceTimersByTime(150);
    expect(host.querySelector('.md-editor__preview').textContent.trim()).toBe('你好');
  });

  it('switches modes, focus, and read-only behavior without changing content', () => {
    const editor = create({ value: 'copy me', placeholder: 'Notes', theme: 'dark' });
    const source = host.querySelector('textarea');
    expect(source.placeholder).toBe('Notes');
    expect(host.firstElementChild.dataset.theme).toBe('dark');
    editor.focus();
    expect(document.activeElement).toBe(source);
    editor.setMode('preview');
    expect(source.parentElement.hidden).toBe(true);
    editor.focus();
    expect(document.activeElement).toBe(host.querySelector('.md-editor__preview'));
    expect(host.querySelector('[data-command]').disabled).toBe(true);
    host.querySelector('[data-mode="source"]').click();
    expect(source.parentElement.hidden).toBe(false);
    expect(host.querySelector('.md-editor__preview').parentElement.hidden).toBe(true);
    editor.setReadOnly(true);
    expect(source.readOnly).toBe(true);
    input('synthetic input');
    expect(editor.getValue()).toBe('copy me');
    editor.setValue('host update');
    expect(source.value).toBe('host update');
    editor.setReadOnly(false);
    editor.setMode('split');
    expect(host.querySelector('[data-command]').disabled).toBe(false);
    expect(editor.getValue()).toBe('host update');
  });

  it('reports focus transitions for the whole editor, not internal moves', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const editor = create({ onFocus, onBlur });
    editor.focus();
    host.querySelector('button').focus();
    await Promise.resolve();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    await Promise.resolve();
    expect(onBlur).toHaveBeenCalledTimes(1);
    editor.focus();
    outside.focus();
    editor.destroy();
    await Promise.resolve();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('formats selections using the toolbar and scoped keyboard shortcuts', () => {
    const editor = create({ value: 'hello' });
    const source = host.querySelector('textarea');
    source.setSelectionRange(0, 5);
    host.querySelector('[data-command="bold"]').click();
    expect(editor.getValue()).toBe('**hello**');
    expect(source.selectionStart).toBe(2);
    expect(source.selectionEnd).toBe(7);
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', metaKey: true, bubbles: true }));
    expect(editor.getValue()).toBe('***hello***');
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', ctrlKey: true }));
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, shiftKey: true }));
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, isComposing: true }));
    expect(editor.getValue()).toBe('***hello***');
    editor.setReadOnly(true);
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }));
    expect(editor.getValue()).toBe('***hello***');
  });

  it('keeps multiple instances independent and preserves unrelated host content', () => {
    host.append(document.createElement('aside'));
    const editor = create({ value: 'first' });
    const secondHost = document.createElement('div');
    document.body.append(secondHost);
    const second = create({ element: secondHost, value: 'second' });
    expect(() => create()).toThrow('already attached');
    editor.setValue('changed');
    editor.destroy();
    expect(host.children).toHaveLength(1);
    expect(host.firstElementChild.tagName).toBe('ASIDE');
    expect(second.getValue()).toBe('second');
    expect(create().getValue()).toBe('');
  });

  it('toggles strikethrough through the toolbar and keeps the preview as prose', () => {
    const editor = create({ value: 'remove this' });
    const source = host.querySelector('textarea');
    const strike = host.querySelector('[data-command="strike"]');
    source.setSelectionRange(0, source.value.length);
    strike.click();
    expect(editor.getValue()).toBe('~~remove this~~');
    expect(editor.getHTML()).toBe('<p><s>remove this</s></p>\n');
    strike.click();
    expect(editor.getValue()).toBe('remove this');
    expect(editor.getHTML()).toBe('<p>remove this</p>\n');
    expect([source.selectionStart, source.selectionEnd]).toEqual([0, 11]);
  });

  it('cancels timers and listeners and guards every method after destroy', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const editor = create({ onChange });
    const source = input('pending');
    editor.destroy();
    vi.runAllTimers();
    source.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(host.children).toHaveLength(0);
    editor.destroy();
    for (const call of [
      () => editor.getValue(), () => editor.setValue('x'), () => editor.getHTML(),
      () => editor.setMode('split'), () => editor.setReadOnly(true), () => editor.focus(),
    ]) expect(call).toThrow('destroyed');
  });

  it('permits destruction inside change callbacks without later work', () => {
    vi.useFakeTimers();
    let editor;
    editor = create({ onChange: () => editor.destroy() });
    host.querySelector('[data-command="bold"]').click();
    expect(host.children).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('validates input explicitly', () => {
    for (const options of [
      { element: '#missing' }, { element: document.createTextNode('x') },
      { value: 1 }, { value: null }, { placeholder: 1 }, { mode: 'visual' },
      { readOnly: 'yes' }, { theme: 'neon' }, { onChange: true }, { onFocus: 1 }, { onBlur: 'x' },
    ]) expect(() => create(options)).toThrow();
    expect(() => MarkdownEditor.create()).toThrow('required');
    expect(() => create({ element: '[' })).toThrow();
    const editor = create();
    expect(() => editor.setValue(null)).toThrow('string');
    expect(() => editor.setMode('visual')).toThrow('mode');
    expect(() => editor.setReadOnly(1)).toThrow('boolean');
  });

  it('handles long values without content loss', () => {
    const value = 'Long paragraph with **emphasis**.\n\n'.repeat(3000);
    const editor = create({ value });
    expect(editor.getValue()).toBe(value);
    expect(host.querySelectorAll('.md-editor__preview strong')).toHaveLength(3000);
  });
});
