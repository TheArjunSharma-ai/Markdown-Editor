import MarkdownIt from 'markdown-it';
import { isAllowedURL } from '../security/urls.js';
import { sanitize } from '../security/sanitize.js';

const parser = new MarkdownIt({ html: false, linkify: false, typographer: false });
parser.validateLink = (/** @type {string} */ url) => isAllowedURL(url);

/** @param {string} markdown */
export function renderMarkdown(markdown) {
  return sanitize(parser.render(markdown));
}
