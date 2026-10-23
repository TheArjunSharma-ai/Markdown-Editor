import { MarkdownEditor } from '../dist/markdown-editor.es.js';

const initial = `# A little clarity goes a long way

Welcome to **Markdown Studio**. Write on the left, see your ideas take shape on the right.

## Today's focus

- Keep the experience simple
- Make every word count
- Build something that travels well

> Your content is Markdown. Your application decides where it lives.

### Project checklist

| Feature | Status |
| --- | --- |
| Live preview | Ready |
| Responsive layout | Ready |
| Host-managed saving | Your choice |

\`\`\`javascript
const notes = editor.getValue();
// Save Markdown through your application's API.
\`\`\`

Try **bold**, *italic*, ~~strikethrough~~, or [learn Markdown](https://www.markdownguide.org).
`;

let value = initial;
let editor;
const actionChoices = [
  ['bold', 'Bold'], ['italic', 'Italic'], ['strikethrough', 'Strikethrough'],
  ['heading', 'Heading'], ['link', 'Link'], ['image', 'Image'],
  ['bullet', 'Bulleted list'], ['ordered', 'Numbered list'],
  ['quote', 'Quote'], ['code', 'Code block'], ['table', 'Table'],
];
const actionControls = document.querySelector('#toolbar-actions');
for (const [action, title] of actionChoices) {
  const label = document.createElement('label');
  label.className = 'checkbox';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = action;
  input.checked = true;
  label.append(input, ` ${title}`);
  actionControls.append(label);
}
function customizationOptions() {
  return {
    header: document.querySelector('#show-header').checked,
    footer: document.querySelector('#show-footer').checked,
    toolbar: document.querySelector('#show-toolbar').checked,
    toolbarActions: Array.from(actionControls.querySelectorAll('input:checked'), (input) => input.value),
  };
}
function showCustomization() {
  const options = customizationOptions();
  document.querySelector('#customization-options').textContent = JSON.stringify(options, null, 2);
  actionControls.disabled = !options.toolbar;
}
let mode = 'split';
function mount() {
  editor = MarkdownEditor.create({
    element: '#notes',
    value,
    mode,
    ...customizationOptions(),
    theme: document.querySelector('#theme').value,
    readOnly: document.querySelector('#read-only').checked,
    placeholder: 'Write your next idea...',
    onChange(markdown) {
      value = markdown;
      document.querySelector('#save-status').textContent = 'Unsaved changes. Download a copy to keep this document.';
    },
  });
}
mount();
let inlineValue = '# Write where your ideas take shape\n\nClick this line to edit **bold**, *italic*, or ~~strikethrough~~ Markdown.\n\n## One surface, two perspectives\n\n- The active line shows its Markdown markers\n- Other lines stay formatted\n- Arrow keys, selection, paste, and undo work in one document\n\n> Move the cursor to another line to see the formatting settle.\n\nTry [a Markdown link](https://www.markdownguide.org) or `inline code`.\n';
let inlineEditor;
function mountInline() {
  inlineEditor = MarkdownEditor.createInline({
    element: '#inline-notes',
    value: inlineValue,
    ...customizationOptions(),
    theme: document.querySelector('#theme').value,
    readOnly: document.querySelector('#read-only').checked,
    placeholder: 'Start writing Markdown...',
    onChange(markdown) {
      inlineValue = markdown;
      document.querySelector('#inline-status').textContent = 'Unsaved inline changes. Download a copy to keep this document.';
    },
  });
}
mountInline();
MarkdownEditor.create({
  element: '#secondary',
  value: '### Built to fit your application\n\nEmbed in **HTML**, ASP.NET, or a trusted WebView.\n\n1. Include the assets\n2. Create an instance\n3. Read and save Markdown\n',
  mode: 'preview',
  readOnly: true,
});
function remount() {
  mode = document.querySelector('#notes .md-editor').dataset.mode;
  value = editor.getValue();
  inlineValue = inlineEditor.getValue();
  editor.destroy();
  inlineEditor.destroy();
  mount();
  mountInline();
  showCustomization();
}
showCustomization();
document.querySelector('#theme').addEventListener('change', remount);
document.querySelector('#editor-visibility').addEventListener('change', remount);
actionControls.addEventListener('change', remount);
document.querySelector('#read-only').addEventListener('change', (event) => {
  editor.setReadOnly(event.target.checked);
  inlineEditor.setReadOnly(event.target.checked);
});
document.querySelector('#download-inline').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([inlineEditor.getValue()], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'inline-notes.md';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#inline-status').textContent = 'Inline download requested. This demo has no server storage.';
});
document.querySelector('#download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([editor.getValue()], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'project-notes.md';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#save-status').textContent = 'Download requested. This demo has no server storage.';
});
