import { deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { getLineOffsets } from './get-line-offests';

describe('getLineOffsets', () => {
  it('should return [0] for an empty string', () => {
    const input = '';
    const expected = [0];
    deepStrictEqual(getLineOffsets(input), expected);
  });

  it('should return [0] for a single-line string without a newline', () => {
    const input = 'hello world';
    const expected = [0];
    deepStrictEqual(getLineOffsets(input), expected);
  });

  it('should calculate offsets for a multi-line string', () => {
    const input = 'line 1\nline 2\nline 3';
    const expected = [0, 7, 14];
    deepStrictEqual(getLineOffsets(input), expected);
  });

  it('should handle a string ending with a newline', () => {
    const input = 'hello\n';
    const expected = [0, 6];
    deepStrictEqual(getLineOffsets(input), expected);
  });

  it('should handle a string starting with a newline', () => {
    const input = '\nhello';
    const expected = [0, 1];
    deepStrictEqual(getLineOffsets(input), expected);
  });

  it('should handle multiple consecutive newlines, creating offsets for empty lines', () => {
    const input = 'line 1\n\nline 3';
    const expected = [0, 7, 8];
    deepStrictEqual(getLineOffsets(input), expected);
  });

  it('should handle different types of line endings (CRLF)', () => {
    const input = 'line 1\r\nline 2';
    const expected = [0, 8];
    deepStrictEqual(getLineOffsets(input), expected);
  });

  it('should handle a string containing only newlines', () => {
    const input = '\n\n\n';
    const expected = [0, 1, 2, 3];
    deepStrictEqual(getLineOffsets(input), expected);
  });
});
