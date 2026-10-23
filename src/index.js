import { create } from './core/editor.js';
import { createInline } from './inline/editor.js';
import './ui/styles.css';
import './inline/styles.css';

export { create };
export { createInline };
export const MarkdownEditor = { create, createInline };
