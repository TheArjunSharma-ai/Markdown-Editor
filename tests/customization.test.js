import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MarkdownEditor } from '../src/index.js';
import { commands } from '../src/core/commands.js';

let host;
let instances;
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  instances = [];
});
afterEach(() => {
  instances.forEach((editor) => editor.destroy());
  document.body.replaceChildren();
});

for (const factory of ['create', 'createInline']) {
  describe(`${factory} customization`, () => {
    function create(options = {}) {
      const editor = MarkdownEditor[factory]({ element: host, ...options });
      instances.push(editor);
      return editor;
    }

    it('shows all sections and all actions by default', () => {
      create();
      for (const section of ['header', 'footer', 'toolbar']) {
        expect(host.querySelector(`.md-editor__${section}`).hidden).toBe(false);
      }
      expect(Array.from(host.querySelectorAll('[data-command]'), (button) => button.dataset.command))
        .toEqual(commands.map((command) => command.id));
    });

    it.each(['header', 'footer', 'toolbar'])('hides only the requested %s', (section) => {
      const editor = create({ [section]: false, value: '# Notes' });
      for (const name of ['header', 'footer', 'toolbar']) {
        expect(host.querySelector(`.md-editor__${name}`).hidden).toBe(name === section);
      }
      editor.setValue('**Changed**');
      expect(editor.getValue()).toBe('**Changed**');
      expect(editor.getHTML()).toContain('<strong>Changed</strong>');
      editor.setReadOnly(true);
      editor.setReadOnly(false);
      expect(host.querySelector(`.md-editor__${section}`).hidden).toBe(true);
    });

    it('supports a minimal editor with no chrome', () => {
      const editor = create({ header: false, footer: false, toolbar: false });
      editor.focus();
      expect(host.contains(document.activeElement)).toBe(true);
      editor.setValue('Still editable');
      expect(editor.getValue()).toBe('Still editable');
    });

    it('uses the requested button order and accepts strikethrough', () => {
      const toolbarActions = ['strikethrough', 'italic', 'bold'];
      const editor = create({ toolbarActions, value: '' });
      expect(Array.from(host.querySelectorAll('[data-command]'), (button) => button.dataset.command))
        .toEqual(['strike', 'italic', 'bold']);
      host.querySelector('[data-command="strike"]').click();
      expect(editor.getValue()).toBe('~~text~~');
      editor.setReadOnly(true);
      for (const button of host.querySelectorAll('[data-command]')) expect(button.disabled).toBe(true);
      editor.setReadOnly(false);
      expect(host.querySelector('[data-command="strike"]').disabled).toBe(false);
      host.querySelector('[data-command="strike"]').click();
      expect(editor.getValue()).toBe('text');
      expect(toolbarActions).toEqual(['strikethrough', 'italic', 'bold']);
    });

    it('accepts the existing strike action name', () => {
      create({ toolbarActions: ['strike'] });
      expect(host.querySelector('[data-command="strike"]')).not.toBeNull();
    });

    it('hides an empty toolbar and preserves explicit toolbar visibility', () => {
      const editor = create({ toolbarActions: [] });
      expect(host.querySelector('.md-editor__toolbar').hidden).toBe(true);
      expect(host.querySelectorAll('[data-command]')).toHaveLength(0);
      editor.destroy();
      create({ toolbar: false, toolbarActions: ['bold'] });
      expect(host.querySelector('.md-editor__toolbar').hidden).toBe(true);
    });

    it.each([
      ...['header', 'footer', 'toolbar'].flatMap((name) => [null, 0, 'false'].map((value) => ({
        options: { [name]: value }, message: `${name} must be a boolean`,
      }))),
      { options: { toolbarActions: null }, message: 'toolbarActions must be an array' },
      { options: { toolbarActions: 'bold' }, message: 'toolbarActions must be an array' },
      { options: { toolbarActions: ['unknown'] }, message: 'Unknown toolbar action' },
      { options: { toolbarActions: [1] }, message: 'Unknown toolbar action' },
      { options: { toolbarActions: [undefined] }, message: 'Unknown toolbar action' },
      { options: { toolbarActions: new Array(1) }, message: 'Unknown toolbar action' },
      { options: { toolbarActions: ['bold', 'bold'] }, message: 'Duplicate toolbar action' },
      { options: { toolbarActions: ['strike', 'strikethrough'] }, message: 'Duplicate toolbar action' },
      { options: { toolbar: false, toolbarActions: ['unknown'] }, message: 'Unknown toolbar action' },
    ])('rejects invalid customization: $options', ({ options, message }) => {
      expect(() => create(options)).toThrow(message);
      expect(host.children).toHaveLength(0);
      create().destroy();
    });
  });
}
