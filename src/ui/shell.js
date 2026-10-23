import { commands } from '../core/commands.js';

let nextId = 0;

/** @param {ReturnType<import('../core/defaults.js').normalizeOptions>} options */
export function createShell(options) {
  const doc = options.element.ownerDocument;
  /** @template {keyof HTMLElementTagNameMap} T @param {T} tag @param {string} [className] @param {string} [text] */
  function node(tag, className = '', text = '') {
    const element = doc.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }
  const id = `md-editor-${++nextId}`;
  const root = node('section', 'md-editor');
  root.dataset.theme = options.theme;
  root.setAttribute('aria-label', 'Markdown editor');
  const header = node('header', 'md-editor__header');
  header.append(node('strong', '', 'Markdown Editor'));
  const modes = node('div', 'md-editor__modes');
  modes.setAttribute('role', 'group');
  modes.setAttribute('aria-label', 'Editor mode');
  const modeButtons = /** @type {Map<import('../core/defaults.js').Mode, HTMLButtonElement>} */ (new Map());
  for (const mode of /** @type {const} */ (['source', 'split', 'preview'])) {
    const button = node('button', '', mode[0].toUpperCase() + mode.slice(1));
    button.type = 'button';
    button.dataset.mode = mode;
    modeButtons.set(mode, button);
    modes.append(button);
  }
  header.append(modes);
  const toolbar = node('div', 'md-editor__toolbar');
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Formatting');
  const commandButtons = commands.map((command) => {
    const button = node('button', '', command.text);
    button.type = 'button';
    button.setAttribute('aria-label', command.label);
    button.title = command.label;
    button.dataset.command = command.id;
    toolbar.append(button);
    return button;
  });
  const body = node('div', 'md-editor__body');
  const sourcePanel = node('div', 'md-editor__panel');
  const label = node('label', 'md-editor__label', 'Markdown source');
  label.htmlFor = `${id}-source`;
  const source = node('textarea', 'md-editor__source');
  source.id = label.htmlFor;
  source.placeholder = options.placeholder;
  source.spellcheck = false;
  sourcePanel.append(label, source);
  const previewPanel = node('div', 'md-editor__panel');
  const previewLabel = node('div', 'md-editor__label', 'Live preview');
  previewLabel.id = `${id}-preview-label`;
  const preview = node('div', 'md-editor__preview');
  preview.tabIndex = 0;
  preview.setAttribute('role', 'region');
  preview.setAttribute('aria-labelledby', previewLabel.id);
  previewPanel.append(previewLabel, preview);
  body.append(sourcePanel, previewPanel);
  const footer = node('footer', 'md-editor__footer');
  const count = node('span');
  const status = node('span', '', 'Preview ready');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  footer.append(count, status);
  root.append(header, toolbar, body, footer);
  return { root, source, sourcePanel, preview, previewPanel, modeButtons, commandButtons, status, count };
}
