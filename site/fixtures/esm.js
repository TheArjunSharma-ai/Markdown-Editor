import { MarkdownEditor } from '/dist/markdown-editor.es.js';
window.editor = MarkdownEditor.create({ element: '#editor', value: '# Bundle works' });
window.other = MarkdownEditor.create({ element: '#other', value: 'Independent' });
