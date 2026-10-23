/**
 * A fixed HTTPS base validates relative references without depending on the
 * embedding application's origin (including local WebView file origins).
 * @param {string} value
 * @param {'link' | 'image'} [kind]
 */
export function isAllowedURL(value, kind = 'link') {
  const candidate = value.trim();
  if (!candidate || /[\u0000-\u0020\u007f\\]/u.test(candidate) || candidate.startsWith('//')) return false;
  try {
    const url = new URL(candidate, 'https://markdown-editor.invalid/');
    return url.protocol === 'https:' || url.protocol === 'http:'
      || (kind === 'link' && url.protocol === 'mailto:');
  } catch {
    return false;
  }
}
