import { deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { getLineRange } from './get-line-ranges';

describe('getLineRange', () => {
  const multiLineOffsets = [0, 10, 20, 30];

  it('should find the range when it is within a single line', () => {
    const range = getLineRange(multiLineOffsets, 12, 18);
    deepStrictEqual(range, { start: 2, end: 2 });
  });

  it('should find a range that spans multiple lines', () => {
    const range = getLineRange(multiLineOffsets, 5, 25);
    deepStrictEqual(range, { start: 1, end: 3 });
  });

  it('should handle a range that extends to the end of the document', () => {
    const range = getLineRange(multiLineOffsets, 25, 100);
    deepStrictEqual(range, { start: 3, end: 4 });
  });

  it('should handle a range starting exactly on a line offset', () => {
    const range = getLineRange(multiLineOffsets, 10, 15);
    deepStrictEqual(range, { start: 2, end: 2 });
  });

  it('should handle a range on the first line', () => {
    const range = getLineRange(multiLineOffsets, 0, 9);
    deepStrictEqual(range, { start: 1, end: 1 });
  });

  it('should handle an empty range', () => {
    const range = getLineRange(multiLineOffsets, 5, 5);
    deepStrictEqual(range, { start: 1, end: 1 });
  });

  it('should work for a single-line document', () => {
    const singleLineOffsets = [0];
    const range = getLineRange(singleLineOffsets, 0, 100);
    deepStrictEqual(range, { start: 1, end: 1 });
  });

  it('should handle a range that covers the entire document', () => {
    const range = getLineRange(multiLineOffsets, 0, 50);
    deepStrictEqual(range, { start: 1, end: 4 });
  });
});
