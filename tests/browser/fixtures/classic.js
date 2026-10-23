window.editor = MarkdownEditor.create({ element: '#editor', value: '# Bundle works' });
window.other = MarkdownEditor.create({ element: '#other', value: 'Independent' });
const inlineHost = document.createElement('div');
inlineHost.id = 'inline';
document.body.append(inlineHost);
window.inlineEditor = MarkdownEditor.createInline({
  element: inlineHost,
  value: '# Inline heading\n\nA **bold** paragraph.\n\n- A list item\n\n[Useful link](https://example.com)',
});
