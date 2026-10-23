import { syntaxTree } from '@codemirror/language';
import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view';
import { renderMarkdown } from '../markdown/parser.js';

class BulletWidget extends WidgetType {
  toDOM() {
    const bullet = document.createElement('span');
    bullet.textContent = '\u2022';
    bullet.setAttribute('aria-hidden', 'true');
    return bullet;
  }
}

class ImageWidget extends WidgetType {
  /** @param {string} markdown */
  constructor(markdown) { super(); this.markdown = markdown; }
  /** @param {ImageWidget} other */
  eq(other) { return this.markdown === other.markdown; }
  toDOM() {
    const container = document.createElement('span');
    container.className = 'md-inline__image';
    container.innerHTML = renderMarkdown(this.markdown);
    const paragraph = container.querySelector('p');
    if (paragraph) paragraph.replaceWith(...paragraph.childNodes);
    return container;
  }
  ignoreEvent() { return false; }
}

/** @param {import('@codemirror/view').EditorView} view */
export function buildDecorations(view) {
  const { state } = view;
  /** @type {import('@codemirror/state').Range<Decoration>[]} */
  const ranges = [];
  const selections = view.hasFocus && !state.readOnly ? state.selection.ranges : [];
  /** @param {number} from @param {number} to */
  function active(from, to) {
    const first = state.doc.lineAt(from).from;
    const last = state.doc.lineAt(to).to;
    return selections.some((range) => range.from <= last && range.to >= first);
  }
  /** @param {number} from @param {number} to @param {string} className */
  function mark(from, to, className) {
    ranges.push(Decoration.mark({ class: className }).range(from, to));
  }
  syntaxTree(state).iterate({
    enter(node) {
      const { name, from, to } = node;
      const parent = node.node.parent;
      if (/^ATXHeading[1-6]$/.test(name)) {
        ranges.push(Decoration.line({ class: `md-inline__heading md-inline__h${name.slice(-1)}` }).range(state.doc.lineAt(from).from));
      }
      if (name === 'StrongEmphasis') mark(from, to, 'md-inline__strong');
      if (name === 'Emphasis') mark(from, to, 'md-inline__em');
      if (name === 'Strikethrough') mark(from, to, 'md-inline__strike');
      if (name === 'InlineCode') mark(from, to, 'md-inline__code');
      if (name === 'Link') mark(from, to, 'md-inline__link');
      if (name === 'FencedCode' || name === 'Blockquote') {
        for (let pos = state.doc.lineAt(from).from; pos <= to;) {
          const line = state.doc.lineAt(pos);
          ranges.push(Decoration.line({ class: name === 'FencedCode' ? 'md-inline__fence' : 'md-inline__quote' }).range(line.from));
          if (line.to >= to) break;
          pos = line.to + 1;
        }
      }
      if (active(from, to)) return;
      if (name === 'Image' && state.doc.lineAt(from).number === state.doc.lineAt(to).number) {
        ranges.push(Decoration.replace({ widget: new ImageWidget(state.doc.sliceString(from, to)) }).range(from, to));
        return false;
      }
      if (name === 'ListMark' && state.doc.sliceString(from, to).match(/^[-+*]$/)) {
        ranges.push(Decoration.replace({ widget: new BulletWidget() }).range(from, to));
      } else if (['HeaderMark', 'EmphasisMark', 'StrikethroughMark', 'CodeMark', 'QuoteMark', 'LinkMark', 'CodeInfo'].includes(name)
        || (name === 'URL' || name === 'LinkTitle') && parent && /^\!?\[/.test(state.doc.sliceString(parent.from, parent.to))) {
        // View-plugin replacements must never span line breaks.
        if (state.doc.lineAt(from).number === state.doc.lineAt(to).number) {
          const space = (name === 'HeaderMark' || name === 'QuoteMark') && state.doc.sliceString(to, to + 1) === ' ' ? 1 : 0;
          ranges.push(Decoration.replace({}).range(from, to + space));
        }
      }
    },
  });
  return Decoration.set(ranges, true);
}

export const livePreview = ViewPlugin.fromClass(class {
  /** @param {import('@codemirror/view').EditorView} view */
  constructor(view) { this.decorations = buildDecorations(view); }
  /** @param {import('@codemirror/view').ViewUpdate} update */
  update(update) {
    if (update.docChanged || update.selectionSet || update.focusChanged || update.viewportChanged
      || syntaxTree(update.startState) !== syntaxTree(update.state)
      || update.startState.readOnly !== update.state.readOnly) {
      this.decorations = buildDecorations(update.view);
    }
  }
}, { decorations: (plugin) => plugin.decorations });
