import { describe, expect, it } from 'vitest';
import { formatSelection } from '../src/core/commands.js';

describe('formatSelection', () => {
  it.each([
    ['bold', '**word**', 2], ['italic', '*word*', 1], ['strike', '~~word~~', 2],
    ['link', '[word](https://example.com)', 1],
    ['image', '![word](https://example.com/image.png)', 2],
    ['code', '```\nword\n```', 4],
  ])('wraps a selection with %s', (command, expected, start) => {
    expect(formatSelection('word', 0, 4, command)).toEqual({ value: expected, start, end: start + 4 });
  });
  it.each(['bold', 'italic', 'strike', 'link', 'image', 'code'])('inserts a useful %s placeholder', (command) => {
    const result = formatSelection('', 0, 0, command);
    expect(result.end).toBeGreaterThan(result.start);
    expect(result.value).toContain(command === 'image' ? 'image description' : command === 'link' ? 'link text' : 'text');
  });
  it.each([
    ['heading', '# one\n# two'], ['bullet', '- one\n- two'],
    ['ordered', '1. one\n2. two'], ['quote', '> one\n> two'],
  ])('prefixes whole lines with %s', (command, expected) => {
    expect(formatSelection('one\ntwo\nlast', 1, 8, command).value).toBe(`${expected}\nlast`);
  });
  it('handles a first empty line and the final unterminated line', () => {
    expect(formatSelection('\na', 0, 0, 'bullet').value).toBe('- \na');
    expect(formatSelection('a\nb', 2, 3, 'quote').value).toBe('a\n> b');
  });
  it('chooses fences longer than embedded backticks and respects block boundaries', () => {
    const result = formatSelection('a````b', 1, 5, 'code');
    expect(result.value).toBe('a\n`````\n````\n`````\nb');
    expect(formatSelection('\nx\n', 1, 2, 'code').value).toBe('\n```\nx\n```\n');
  });
  it('inserts tables at block boundaries', () => {
    expect(formatSelection('', 0, 0, 'table').value).toContain('| --- | --- |');
    expect(formatSelection('before', 6, 6, 'table').value).toMatch(/^before\n\| Column/);
  });
  it('rejects unknown commands', () => {
    expect(() => formatSelection('', 0, 0, 'unknown')).toThrow('Unknown');
  });
  it('toggles strikethrough off without generating a code fence', () => {
    const first = formatSelection('word', 0, 4, 'strike');
    expect(formatSelection(first.value, first.start, first.end, 'strike')).toEqual({
      value: 'word', start: 0, end: 4,
    });
  });
  it('removes strikethrough when the selected text includes its markers', () => {
    expect(formatSelection('before ~~word~~ after', 7, 15, 'strike')).toEqual({
      value: 'before word after', start: 7, end: 11,
    });
  });
  it('keeps boundary whitespace outside strikethrough markers', () => {
    expect(formatSelection(' word ', 0, 6, 'strike')).toEqual({
      value: ' ~~word~~ ', start: 3, end: 7,
    });
  });
  it('strikes separate lines without joining paragraphs or changing blank lines', () => {
    const value = ' first \r\n\r\n second ';
    const first = formatSelection(value, 0, value.length, 'strike');
    expect(first.value).toBe(' ~~first~~ \r\n\r\n ~~second~~ ');
    const second = formatSelection(first.value, 0, first.value.length, 'strike');
    expect(second.value).toBe(value);
  });
  it('keeps blank selections unchanged and does not double-wrap already struck lines', () => {
    expect(formatSelection(' \t ', 0, 3, 'strike')).toEqual({ value: ' \t ', start: 0, end: 3 });
    const value = '~~first~~\nsecond';
    const first = formatSelection(value, 0, value.length, 'strike');
    expect(first.value).toBe('~~first~~\n~~second~~');
    expect(formatSelection(first.value, first.start, first.end, 'strike').value).toBe('first\nsecond');
  });
});
