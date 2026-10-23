import createDOMPurify from 'dompurify';
import { isAllowedURL } from './urls.js';

const purifier = createDOMPurify(window);
purifier.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'href' || data.attrName === 'src') {
    data.keepAttr = isAllowedURL(data.attrValue, node.nodeName === 'IMG' ? 'image' : 'link');
  }
});
purifier.addHook('afterSanitizeAttributes', (node) => {
  if (node.nodeName === 'IMG') node.setAttribute('referrerpolicy', 'no-referrer');
});

/** @param {string} html */
export function sanitize(html) {
  return purifier.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's',
      'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'start'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}
