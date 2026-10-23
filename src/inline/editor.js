import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownKeymap } from '@codemirror/lang-markdown';
import { GFM } from '@lezer/markdown';
import { normalizeOptions, validateString, validateReadOnly } from '../core/defaults.js';
import { assertHostAvailable, reserveHost, releaseHost } from '../core/hosts.js';
import { formatSelection } from '../core/commands.js';
import { renderMarkdown } from '../markdown/parser.js';
import { livePreview } from './decorations.js';

/** @typedef {Omit<import('../core/defaults.js').EditorOptions, 'mode'>} InlineOptions */

/** @param {InlineOptions} options */
export function createInline(options) {
  const normalized = normalizeOptions(options);
  const host = normalized.element;
  assertHostAvailable(host);
  const doc = host.ownerDocument;
  const root = doc.createElement('section');
  root.className = 'md-editor md-inline';
  root.dataset.theme = normalized.theme;
  root.setAttribute('aria-label', 'Inline live Markdown editor');
  const header = doc.createElement('header');
  header.className = 'md-editor__header';
  header.hidden = !normalized.header;
  const title = doc.createElement('strong');
  title.textContent = 'Inline live editor';
  const hint = doc.createElement('span');
  hint.className = 'md-inline__hint';
  hint.textContent = 'Markdown on the active line. Preview everywhere else.';
  header.append(title, hint);
  const toolbar = doc.createElement('div');
  toolbar.className = 'md-editor__toolbar';
  toolbar.hidden = !normalized.toolbar || normalized.toolbarCommands.length === 0;
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Inline formatting');
  const surface = doc.createElement('div');
  const footer = doc.createElement('footer');
  footer.className = 'md-editor__footer';
  footer.hidden = !normalized.footer;
  const count = doc.createElement('span');
  const status = doc.createElement('span');
  status.setAttribute('role', 'status');
  status.textContent = 'Changes are kept as Markdown';
  footer.append(count, status);
  root.append(header, toolbar, surface, footer);
  let destroyed = false;
  let readOnly = normalized.readOnly;
  const editable = new Compartment();
  /** @type {Array<() => void>} */
  const cleanups = [];
  /** @type {HTMLButtonElement[]} */
  const buttons = [];
  /** @param {EditorView} view @param {string} command */
  function format(view, command) {
    if (readOnly || view.composing || destroyed) return false;
    const { from, to } = view.state.selection.main;
    const result = formatSelection(view.state.doc.toString(), from, to, command);
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: result.value },
      selection: { anchor: result.start, head: result.end },
      scrollIntoView: true,
    });
    if (!destroyed) view.focus();
    return true;
  }
  function updateCount() { count.textContent = `${view.state.doc.length.toLocaleString()} characters`; }
  let focused = false;
  const view = new EditorView({
    parent: surface,
    state: EditorState.create({
      doc: normalized.value,
      extensions: [
        markdown({ extensions: GFM }),
        history(),
        keymap.of([
          { key: 'Mod-b', run: (view) => format(view, 'bold') },
          { key: 'Mod-i', run: (view) => format(view, 'italic') },
          ...markdownKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab,
        ]),
        EditorView.lineWrapping,
        placeholder(normalized.placeholder),
        editable.of([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]),
        EditorView.contentAttributes.of({ 'aria-label': 'Inline Markdown document', 'aria-multiline': 'true', role: 'textbox', tabindex: '0' }),
        livePreview,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            updateCount();
            normalized.onChange?.(update.state.doc.toString());
          }
        }),
      ],
    }),
  });
  for (const command of normalized.toolbarCommands) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.textContent = command.text;
    button.setAttribute('aria-label', command.label);
    button.title = command.label;
    button.dataset.command = command.id;
    button.disabled = readOnly;
    const click = () => { format(view, command.id); };
    button.addEventListener('click', click);
    cleanups.push(() => button.removeEventListener('click', click));
    buttons.push(button);
    toolbar.append(button);
  }
  const focusIn = () => {
    if (!focused) { focused = true; normalized.onFocus?.(); }
  };
  const focusOut = () => {
    queueMicrotask(() => {
      if (!destroyed && focused && !root.contains(doc.activeElement)) {
        focused = false;
        normalized.onBlur?.();
      }
    });
  };
  root.addEventListener('focusin', focusIn);
  root.addEventListener('focusout', focusOut);
  updateCount();
  host.append(root);
  reserveHost(host);
  function assertAlive() {
    if (destroyed) throw new Error('Markdown editor has been destroyed');
  }
  return {
    getValue() { assertAlive(); return view.state.doc.toString(); },
    /** @param {string} value */
    setValue(value) {
      assertAlive();
      validateString(value, 'value');
      const next = view.state.toText(value);
      if (!next.eq(view.state.doc)) {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
      }
    },
    getHTML() {
      assertAlive();
      try {
        const html = renderMarkdown(view.state.doc.toString());
        status.textContent = 'Changes are kept as Markdown';
        return html;
      } catch (error) {
        status.textContent = 'Unable to render Markdown. Check the document and try again.';
        throw error;
      }
    },
    /** @param {boolean} value */
    setReadOnly(value) {
      assertAlive();
      validateReadOnly(value);
      readOnly = value;
      view.dispatch({ effects: editable.reconfigure([EditorState.readOnly.of(value), EditorView.editable.of(!value)]) });
      buttons.forEach((button) => { button.disabled = value; });
    },
    focus() { assertAlive(); view.focus(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.removeEventListener('focusin', focusIn);
      root.removeEventListener('focusout', focusOut);
      cleanups.forEach((cleanup) => cleanup());
      view.destroy();
      root.remove();
      releaseHost(host);
    },
  };
}
