/** @typedef {'source' | 'preview' | 'split'} Mode */
/** @typedef {'system' | 'light' | 'dark'} Theme */
/**
 * @typedef {object} EditorOptions
 * @property {string | HTMLElement} element
 * @property {string} [value]
 * @property {Mode} [mode]
 * @property {boolean} [readOnly]
 * @property {string} [placeholder]
 * @property {Theme} [theme]
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
  return { ...options, element, value, mode, readOnly, placeholder, theme };
}
