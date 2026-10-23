import { commands } from './commands.js';

/** @typedef {'source' | 'preview' | 'split'} Mode */
/** @typedef {'system' | 'light' | 'dark'} Theme */
/** @typedef {typeof commands[number]['id'] | 'strikethrough'} ToolbarAction */
/**
 * @typedef {object} EditorOptions
 * @property {string | HTMLElement} element
 * @property {string} [value]
 * @property {Mode} [mode]
 * @property {boolean} [readOnly]
 * @property {string} [placeholder]
 * @property {Theme} [theme]
 * @property {boolean} [header]
 * @property {boolean} [footer]
 * @property {boolean} [toolbar]
 * @property {ToolbarAction[]} [toolbarActions]
 * @property {(markdown: string) => void} [onChange]
 * @property {() => void} [onFocus]
 * @property {() => void} [onBlur]
 */

/** @param {unknown} mode @returns {asserts mode is Mode} */
export function validateMode(mode) {
  if (mode !== 'source' && mode !== 'preview' && mode !== 'split') {
    throw new TypeError('mode must be source, preview, or split');
  }
}

/** @param {unknown} value @param {string} name @returns {asserts value is string} */
export function validateString(value, name) {
  if (typeof value !== 'string') throw new TypeError(`${name} must be a string`);
}

/** @param {unknown} value @returns {asserts value is boolean} */
export function validateReadOnly(value) {
  if (typeof value !== 'boolean') throw new TypeError('readOnly must be a boolean');
}

/** @param {EditorOptions} options */
export function normalizeOptions(options) {
  if (!options || typeof options !== 'object') throw new TypeError('Editor options are required');
  const element = typeof options.element === 'string'
    ? document.querySelector(options.element) : options.element;
  if (!(element instanceof HTMLElement)) throw new TypeError('element must identify an HTML element');
  const value = options.value === undefined ? '' : options.value;
  const mode = options.mode === undefined ? 'split' : options.mode;
  const readOnly = options.readOnly === undefined ? false : options.readOnly;
  const placeholder = options.placeholder === undefined ? '' : options.placeholder;
  const theme = options.theme === undefined ? 'system' : options.theme;
  const header = options.header === undefined ? true : options.header;
  const footer = options.footer === undefined ? true : options.footer;
  const toolbar = options.toolbar === undefined ? true : options.toolbar;
  for (const [name, value] of Object.entries({ header, footer, toolbar })) {
    if (typeof value !== 'boolean') throw new TypeError(`${name} must be a boolean`);
  }
  const actions = options.toolbarActions === undefined ? commands.map((command) => command.id) : options.toolbarActions;
  if (!Array.isArray(actions)) throw new TypeError('toolbarActions must be an array of action names');
  const seen = new Set();
  const toolbarCommands = Array.from(actions, (action) => {
    const id = action === 'strikethrough' ? 'strike' : action;
    const command = commands.find((command) => command.id === id);
    if (!command) throw new TypeError(`Unknown toolbar action: ${String(action)}`);
    if (seen.has(id)) throw new TypeError(`Duplicate toolbar action: ${action}`);
    seen.add(id);
    return command;
  });
  validateString(value, 'value');
  validateString(placeholder, 'placeholder');
  validateMode(mode);
  validateReadOnly(readOnly);
  if (!['system', 'light', 'dark'].includes(theme)) throw new TypeError('Invalid theme');
  for (const name of /** @type {const} */ (['onChange', 'onFocus', 'onBlur'])) {
    if (options[name] !== undefined && typeof options[name] !== 'function') {
      throw new TypeError(`${name} must be a function`);
    }
  }
  return { ...options, element, value, mode, readOnly, placeholder, theme, header, footer, toolbar, toolbarCommands };
}
