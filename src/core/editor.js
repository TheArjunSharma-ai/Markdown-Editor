import { normalizeOptions, validateMode, validateReadOnly, validateString } from './defaults.js';
import { createShell } from '../ui/shell.js';
import { createController } from './controller.js';

import { assertHostAvailable, reserveHost, releaseHost } from './hosts.js';

/** @param {import('./defaults.js').EditorOptions} options */
export function create(options) {
  const normalized = normalizeOptions(options);
  const host = normalized.element;
  assertHostAvailable(host);
  const ui = createShell(normalized);
  const controller = createController(normalized, ui);
  reserveHost(host);
  host.append(ui.root);
  let destroyed = false;
  function assertAlive() {
    if (destroyed) throw new Error('Markdown editor has been destroyed');
  }
  return {
    getValue() { assertAlive(); return controller.getValue(); },
    /** @param {string} value */
    setValue(value) { assertAlive(); validateString(value, 'value'); controller.setValue(value); },
    getHTML() { assertAlive(); return controller.getHTML(); },
    /** @param {import('./defaults.js').Mode} mode */
    setMode(mode) { assertAlive(); validateMode(mode); controller.setMode(mode); },
    /** @param {boolean} readOnly */
    setReadOnly(readOnly) { assertAlive(); validateReadOnly(readOnly); controller.setReadOnly(readOnly); },
    focus() { assertAlive(); controller.focus(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      controller.destroy();
      ui.root.remove();
      releaseHost(host);
    },
  };
}
