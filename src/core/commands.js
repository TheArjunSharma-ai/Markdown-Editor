export const commands = [
  { id: 'bold', label: 'Bold', text: 'B' },
  { id: 'italic', label: 'Italic', text: 'I' },
  { id: 'strike', label: 'Strikethrough', text: 'S' },
  { id: 'heading', label: 'Heading', text: 'H' },
  { id: 'link', label: 'Insert link', text: 'Link' },
  { id: 'image', label: 'Insert image', text: 'Image' },
  { id: 'bullet', label: 'Bulleted list', text: 'List' },
  { id: 'ordered', label: 'Numbered list', text: '1. List' },
  { id: 'quote', label: 'Blockquote', text: 'Quote' },
  { id: 'code', label: 'Code block', text: 'Code' },
  { id: 'table', label: 'Insert table', text: 'Table' },
];

/** @param {string} text */
function hasStrikeMarkers(text) {
  return text.length > 4 && text.startsWith('~~') && text.endsWith('~~')
    && !text.slice(2, -2).includes('~~');
}

/** @param {string} value @param {number} start @param {number} end */
function toggleStrikethrough(value, start, end) {
  const selected = value.slice(start, end);
  if (selected && !/[\r\n]/u.test(selected) && start >= 2
    && value.slice(start - 2, start) === '~~' && value.slice(end, end + 2) === '~~') {
    return {
      value: value.slice(0, start - 2) + selected + value.slice(end + 2),
      start: start - 2,
      end: end - 2,
    };
  }
  const parts = (selected || 'text').split(/(\r\n|\r|\n)/u);
  const content = parts.filter((part) => part.trim());
  if (!content.length) return { value, start, end };
  const remove = content.every((part) => hasStrikeMarkers(part.trim()));
  const replacement = parts.map((part) => {
    const text = part.trim();
    if (!text) return part;
    const formatted = remove ? text.slice(2, -2)
      : hasStrikeMarkers(text) ? text : `~~${text}~~`;
    const leading = part.length - part.trimStart().length;
    return part.slice(0, leading) + formatted + part.slice(leading + text.length);
  }).join('');
  const multiline = /[\r\n]/u.test(selected);
  const leading = replacement.length - replacement.trimStart().length;
  const trailing = replacement.length - replacement.trimEnd().length;
  return {
    value: value.slice(0, start) + replacement + value.slice(end),
    start: multiline ? start : start + leading + (remove ? 0 : 2),
    end: multiline ? start + replacement.length : start + replacement.length - trailing - (remove ? 0 : 2),
  };
}

/** @param {string} value @param {number} start @param {number} end @param {string} command */
export function formatSelection(value, start, end, command) {
  if (command === 'strike') return toggleStrikethrough(value, start, end);
  const selected = value.slice(start, end);
  let from = start;
  let to = end;
  let replacement;
  let offset = 0;
  let length;
  if (['heading', 'bullet', 'ordered', 'quote'].includes(command)) {
    from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end > start && value[end - 1] === '\n' ? end - 1 : end);
    to = lineEnd === -1 ? value.length : lineEnd;
    const prefix = command === 'heading' ? '# ' : command === 'bullet' ? '- ' : command === 'quote' ? '> ' : '';
    replacement = value.slice(from, to).split('\n').map((line, i) =>
      `${command === 'ordered' ? `${i + 1}. ` : prefix}${line}`).join('\n');
    length = replacement.length;
  } else {
    const text = selected || 'text';
    switch (command) {
      case 'bold': replacement = `**${text}**`; offset = 2; length = text.length; break;
      case 'italic': replacement = `*${text}*`; offset = 1; length = text.length; break;
      case 'link': replacement = `[${selected || 'link text'}](https://example.com)`; offset = 1; length = (selected || 'link text').length; break;
      case 'image': replacement = `![${selected || 'image description'}](https://example.com/image.png)`; offset = 2; length = (selected || 'image description').length; break;
      case 'code': {
        const runs = text.match(/`+/g) || [];
        const fence = '`'.repeat(Math.max(3, ...runs.map((run) => run.length + 1)));
        const lead = from > 0 && value[from - 1] !== '\n' ? '\n' : '';
        const tail = to < value.length && value[to] !== '\n' ? '\n' : '';
        replacement = `${lead}${fence}\n${text}\n${fence}${tail}`;
        offset = lead.length + fence.length + 1;
        length = text.length;
        break;
      }
      case 'table':
        replacement = `${from > 0 && value[from - 1] !== '\n' ? '\n' : ''}| Column 1 | Column 2 |\n| --- | --- |\n| Value | Value |\n`;
        length = replacement.length;
        break;
      default: throw new TypeError(`Unknown formatting command: ${command}`);
    }
  }
  return {
    value: value.slice(0, from) + replacement + value.slice(to),
    start: from + offset,
    end: from + offset + length,
  };
}
