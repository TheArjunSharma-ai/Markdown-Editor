const attached = new WeakSet();

/** @param {HTMLElement} host */
export function assertHostAvailable(host) {
  if (attached.has(host)) throw new Error('An editor is already attached to this element');
}

/** @param {HTMLElement} host */
export function reserveHost(host) { attached.add(host); }

/** @param {HTMLElement} host */
export function releaseHost(host) { attached.delete(host); }
