import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { Analyzer } from '../analyzers/analyzer';
import { analyzeCode } from './analyze-code';

describe('analyzeCode', () => {
  it('should analyze code and return component usages', () => {
    const code = `<MyComponent prop1="value1" @click="onClick"><span>Hello</span></MyComponent>`;
    const mockAst = [
      {
        type: 'Component',
        name: 'MyComponent',
        attributes: [{ name: 'prop1', value: 'value1' }],
        slots: [{ name: 'default', children: ['<span>Hello</span>'] }],
        events: [{ name: 'click', handler: 'onClick' }],
        lines: { start: 1, end: 1 },
      },
    ];

    const analyzer: Analyzer<any> = {
      name: 'MockAnalyzer',
      parseCode: () => mockAst,
      shouldExtract: (node) => node.type === 'Component',
      extractName: (node) => node.name,
      extractAttributes: (node) => node.attributes,
      extractSlots: (node) => node.slots,
      extractEvents: (node) => node.events,
      extractLines: (node) => node.lines,
      visit: (ast, visitor) => ast.forEach(visitor),
    };

    const result = analyzeCode(code, analyzer);

    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result[0], {
      component: 'MyComponent',
      attributes: [{ name: 'prop1', value: 'value1' }],
      slots: [{ name: 'default', children: ['<span>Hello</span>'] }],
      events: [{ name: 'click', handler: 'onClick' }],
      lines: { start: 1, end: 1 },
      fragment: code,
    });
  });

  it('should use extractTemplate if provided', () => {
    const template = '<MyComponent />';
    const mockAst = [
      { type: 'Component', name: 'MyComponent', lines: { start: 1, end: 1 } },
    ];

    const analyzer: Analyzer<any> = {
      name: 'MockAnalyzer',
      extractTemplate: () => template,
      parseCode: () => mockAst,
      shouldExtract: (node) => node.type === 'Component',
      extractName: (node) => node.name,
      extractLines: (node) => node.lines,
      visit: (ast, visitor) => ast.forEach(visitor),
    };

    const result = analyzeCode('', analyzer);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].component, 'MyComponent');
    assert.strictEqual(result[0].fragment, template);
  });

  it('should throw an error if parsing fails', () => {
    const analyzer: Analyzer<any> = {
      name: 'MockAnalyzer',
      parseCode: () => null,
      shouldExtract: () => false,
      extractName: () => '',
      extractLines: () => ({ start: 0, end: 0 }),
    };
    assert.throws(() => analyzeCode('', analyzer), /Couldn't analyze code!/);
  });

  it('should handle multiple components', () => {
    const mockAst = [
      { type: 'Component', name: 'CompA', lines: { start: 1, end: 1 } },
      { type: 'Component', name: 'CompB', lines: { start: 1, end: 1 } },
    ];

    const analyzer: Analyzer<any> = {
      name: 'MockAnalyzer',
      parseCode: () => mockAst,
      shouldExtract: (node) => node.type === 'Component',
      extractName: (node) => node.name,
      extractLines: (node) => node.lines,
      visit: (ast, visitor) => ast.forEach(visitor),
    };

    const result = analyzeCode('', analyzer);

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].component, 'CompA');
    assert.strictEqual(result[1].component, 'CompB');
  });

  it('should not extract if shouldExtract returns false', () => {
    const mockAst = [{ type: 'NotComponent' }];

    const analyzer: Analyzer<any> = {
      name: 'MockAnalyzer',
      parseCode: () => mockAst,
      shouldExtract: (node) => node.type === 'Component',
      extractName: () => '',
      extractLines: () => ({ start: 0, end: 0 }),
      visit: (ast, visitor) => ast.forEach(visitor),
    };

    const result = analyzeCode('', analyzer);
    assert.strictEqual(result.length, 0);
  });

  it('should use custom visit function if provided', () => {
    const mockAst = {
      tag: 'div',
      children: [{ tag: 'MyComponent', lines: { start: 1, end: 1 } }],
    };

    const customVisit = (ast: any, visitor: any) => {
      visitor(ast.children[0]);
    };

    const analyzer: Analyzer<any> = {
      name: 'MockAnalyzer',
      parseCode: () => mockAst,
      shouldExtract: (node) => node.tag === 'MyComponent',
      extractName: (node) => node.tag,
      extractLines: (node) => node.lines,
      visit: customVisit,
    };

    const result = analyzeCode('', analyzer);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].component, 'MyComponent');
  });
});
