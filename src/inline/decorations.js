import { syntaxTree } from '@codemirror/language';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view';
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

class TableWidget extends WidgetType {
  /** @param {string} markdown @param {number} from @param {number[][]} cells */
  constructor(markdown, from, cells) {
    super();
    this.markdown = markdown;
    this.from = from;
    this.cells = cells;
  }
  /** @param {TableWidget} other */
  eq(other) { return this.markdown === other.markdown && this.from === other.from; }
  /** @param {EditorView} view */
  toDOM(view) {
    const container = view.dom.ownerDocument.createElement('div');
    container.className = 'md-inline__table';
    container.innerHTML = renderMarkdown(this.markdown);
    container.addEventListener('mousedown', (event) => {
      if (event.button !== 0 || view.state.readOnly) return;
      event.preventDefault();
      const target = event.target;
      const cell = target instanceof Element ? target.closest('th, td') : null;
      const rows = Array.from(container.querySelectorAll('tr'));
      const rowIndex = rows.findIndex((row) => cell && row.contains(cell));
      const cellIndex = rowIndex < 0 || !cell ? -1 : Array.from(rows[rowIndex].children).indexOf(cell);
      const anchor = this.cells[rowIndex]?.[cellIndex] ?? this.from;
      view.dispatch({ selection: { anchor }, scrollIntoView: true });
      view.focus();
    });
    return container;
  }
}

/** @param {import('@codemirror/state').EditorState} state @param {boolean} focused @param {number} from @param {number} to */
function tableActive(state, focused, from, to) {
  return focused && !state.readOnly
    && state.selection.ranges.some((range) => range.from <= to && range.to >= from);
}

/** @param {import('@codemirror/state').EditorState} state @param {boolean} focused */
function tableDecorations(state, focused) {
  /** @type {import('@codemirror/state').Range<Decoration>[]} */
  const ranges = [];
  syntaxTree(state).iterate({
    enter(node) {
      if (node.name !== 'Table') return;
      const { from, to } = node;
      if (!tableActive(state, focused, from, to)) {
        const cells = [];
        for (let row = node.node.firstChild; row; row = row.nextSibling) {
          if (row.name === 'TableHeader' || row.name === 'TableRow') {
            const positions = [];
            let start = row.from;
            for (const delimiter of row.getChildren('TableDelimiter')) {
              if (delimiter.from > row.from) {
                const text = state.doc.sliceString(start, delimiter.from);
                positions.push(start + text.length - text.trimStart().length);
              }
              start = delimiter.to;
            }
            if (start < row.to) {
              const text = state.doc.sliceString(start, row.to);
              positions.push(start + text.length - text.trimStart().length);
            }
            cells.push(positions);
          }
        }
        const widget = new TableWidget(state.doc.sliceString(from, to), from, cells);
        ranges.push(Decoration.replace({ widget, block: true }).range(from, to));
      }
      return false;
    },
  });
  return Decoration.set(ranges, true);
}

/** @type {import('@codemirror/state').StateEffectType<boolean>} */
const previewFocus = StateEffect.define();
const tables = StateField.define({
  /** @param {import('@codemirror/state').EditorState} state */
  create(state) { return { focused: false, decorations: tableDecorations(state, false) }; },
  update(value, transaction) {
    let focused = value.focused;
    for (const effect of transaction.effects) {
      if (effect.is(previewFocus)) focused = effect.value;
    }
    return { focused, decorations: tableDecorations(transaction.state, focused) };
  },
  provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
});

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
      if (name === 'Table' && !tableActive(state, view.hasFocus, from, to)) return false;
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

const inlineDecorations = ViewPlugin.fromClass(class {
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

export const livePreview = [
  tables,
  EditorView.domEventHandlers({
    focus(_event, view) { view.dispatch({ effects: previewFocus.of(true) }); },
    blur(_event, view) { view.dispatch({ effects: previewFocus.of(false) }); },
  }),
  inlineDecorations,
];
