import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { deindent } from './deindent';

describe('deindent', () => {
  it('should remove consistent indentation from a multi-line string', () => {
    const input = `
      function test() {
        console.log('hello');
        return true;
      }`;
    const expected = `
function test() {
  console.log('hello');
  return true;
}`;
    strictEqual(deindent(input), expected);
  });

  it('should handle strings with no indentation', () => {
    const input = `
function test() {
  console.log('hello');
}`;
    const expected = `
function test() {
  console.log('hello');
}`;
    strictEqual(deindent(input), expected);
  });

  it('should remove the minimum common indentation from mixed indentation levels', () => {
    const input = `
      line 1
        line 2
      line 3`;
    const expected = `
line 1
  line 2
line 3`;
    strictEqual(deindent(input), expected);
  });

  it('should handle empty lines correctly, preserving them', () => {
    const input = `
      line 1

      line 2`;
    const expected = `
line 1

line 2`;
    strictEqual(deindent(input), expected);
  });

  it('should handle leading and trailing empty lines', () => {
    const input = `

      line 1
        line 2
    `;
    const expected = `

line 1
  line 2
`;
    strictEqual(deindent(input), expected);
  });

  it('should deindent a single line string', () => {
    const input = '    hello world';
    const expected = 'hello world';
    strictEqual(deindent(input), expected);
  });

  it('should return an empty string if input is empty', () => {
    const input = '';
    const expected = '';
    strictEqual(deindent(input), expected);
  });

  it('should handle string with only whitespace characters', () => {
    const input = '   \n  \n    ';
    const expected = '\n\n';
    strictEqual(deindent(input), expected);
  });

  it('should not deindent if there are no non-whitespace lines', () => {
    const input = '   \n  \n    ';
    const expected = '\n\n';
    strictEqual(deindent(input), expected);
  });

  it('should handle lines with only whitespace correctly when determining min indent', () => {
    const input = `
      line 1
          
      line 2`;
    const expected = `
line 1
    
line 2`;
    strictEqual(deindent(input), expected);
  });
});
