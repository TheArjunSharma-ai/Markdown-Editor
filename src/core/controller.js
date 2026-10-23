import { renderMarkdown } from '../markdown/parser.js';
import { formatSelection } from './commands.js';

/** @param {ReturnType<import('./defaults.js').normalizeOptions>} options @param {ReturnType<import('../ui/shell.js').createShell>} ui */
export function createController(options, ui) {
  let value = options.value;
  let mode = options.mode;
  let readOnly = options.readOnly;
  let composing = false;
  let destroyed = false;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  /** @type {Array<() => void>} */
  const cleanups = [];
  /** @param {HTMLElement} target @param {string} event @param {EventListener} listener */
  function listen(target, event, listener) {
    target.addEventListener(event, listener);
    cleanups.push(() => target.removeEventListener(event, listener));
  }
  function cancel() {
    clearTimeout(timer);
    timer = undefined;
  }
  function render() {
    cancel();
    try {
      const html = renderMarkdown(value);
      ui.preview.innerHTML = html;
      ui.status.textContent = 'Preview ready';
      return html;
    } catch (error) {
      ui.preview.replaceChildren();
      ui.status.textContent = 'Unable to render preview. Check the document and try again.';
      throw error;
    }
  }
  function schedule() {
    cancel();
    if (!composing) timer = setTimeout(render, 150);
  }
  function count() {
    ui.count.textContent = `${value.length.toLocaleString()} characters`;
  }
  function controls() {
    ui.root.dataset.mode = mode;
    ui.sourcePanel.hidden = mode === 'preview';
    ui.previewPanel.hidden = mode === 'source';
    ui.source.readOnly = readOnly;
    for (const [key, button] of ui.modeButtons) button.setAttribute('aria-pressed', String(key === mode));
    for (const button of ui.commandButtons) button.disabled = readOnly || mode === 'preview';
  }
  /** @param {string} command */
  function command(command) {
    if (destroyed || readOnly || mode === 'preview' || composing) return;
    const result = formatSelection(value, ui.source.selectionStart, ui.source.selectionEnd, command);
    setValue(result.value);
    if (destroyed) return;
    ui.source.focus();
    ui.source.setSelectionRange(result.start, result.end);
  }
  /** @param {string} next */
  function setValue(next) {
    const changed = value !== next;
    value = next;
    ui.source.value = value;
    count();
    render();
    if (changed) options.onChange?.(value);
  }
  ui.source.value = value;
  count();
  controls();
  render();
  listen(ui.source, 'input', () => {
    if (readOnly || destroyed) return;
    const next = ui.source.value;
    if (next === value) return;
    value = next;
    count();
    schedule();
    options.onChange?.(value);
  });
  listen(ui.source, 'compositionstart', () => { composing = true; cancel(); });
  listen(ui.source, 'compositionend', () => { composing = false; schedule(); });
  listen(ui.source, 'keydown', (event) => {
    if (!(event instanceof KeyboardEvent) || event.isComposing || composing || readOnly) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
      const key = event.key.toLowerCase();
      if (key === 'b' || key === 'i') {
        event.preventDefault();
        command(key === 'b' ? 'bold' : 'italic');
      }
    }
  });
  for (const button of ui.commandButtons) {
    listen(button, 'click', () => command(button.dataset.command || ''));
  }
  for (const [key, button] of ui.modeButtons) listen(button, 'click', () => setMode(key));
  let focused = false;
  listen(ui.root, 'focusin', () => {
    if (!focused) { focused = true; options.onFocus?.(); }
  });
  listen(ui.root, 'focusout', () => {
    queueMicrotask(() => {
      if (!destroyed && focused && !ui.root.contains(ui.root.ownerDocument.activeElement)) {
        focused = false;
        options.onBlur?.();
      }
    });
  });
  /** @param {import('./defaults.js').Mode} next */
  function setMode(next) {
    mode = next;
    controls();
  }
  return {
    getValue: () => value,
    setValue,
    getHTML: render,
    setMode,
    /** @param {boolean} next */
    setReadOnly(next) { readOnly = next; controls(); },
    focus() { (mode === 'preview' ? ui.preview : ui.source).focus(); },
    destroy() {
      destroyed = true;
      cancel();
      cleanups.forEach((cleanup) => cleanup());
    },
  };
}
