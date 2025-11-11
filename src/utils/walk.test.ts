import { deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { ASTNode } from 'fragmint';
import { mElementNode, mTextNode } from '../utils/test-utils';
import { walk } from './walk';

describe('walk', () => {
  it('should yield a single node when given one without children', () => {
    const node: ASTNode = mTextNode({ type: 'Text', raw: 'hello' });
    const result = Array.from(walk(node));
    deepStrictEqual(result, [node]);
  });

  it('should yield a single element node when it has no children', () => {
    const node = mElementNode({
      type: 'Element',
      tag: 'div',
      raw: '<div></div>',
    });
    const result = Array.from(walk(node));
    deepStrictEqual(result, [node]);
  });

  it('should yield all nodes from a flat array', () => {
    const nodes = [
      mTextNode({ type: 'Text', raw: 'hello' }),
      mElementNode({ type: 'Element', tag: 'span', raw: '<span></span>' }),
    ];
    const result = Array.from(walk(nodes));
    deepStrictEqual(result, nodes);
  });

  it('should perform a depth-first traversal of a nested structure', () => {
    const child1 = mTextNode({ type: 'Text', raw: 'child1' });
    const child2 = mTextNode({ type: 'Text', raw: 'child2' });
    const parent = mElementNode({
      type: 'Element',
      tag: 'div',
      children: [child1, child2],
      raw: '<div>child1child2</div>',
    });

    const result = Array.from(walk(parent));
    const expected = [parent, child1, child2];
    deepStrictEqual(result, expected);
  });

  it('should handle multi-level nested structures', () => {
    const grandchild = mTextNode({ type: 'Text', raw: 'grandchild' });
    const child: ASTNode = mElementNode({
      type: 'Element',
      tag: 'span',
      children: [grandchild],
      raw: '<span>grandchild</span>',
    });
    const parent = mElementNode({
      type: 'Element',
      tag: 'div',
      children: [child],
      raw: '<div><span>grandchild</span></div>',
    });

    const result = Array.from(walk(parent));
    const expected = [parent, child, grandchild];
    deepStrictEqual(result, expected);
  });

  it('should handle a complex tree with multiple branches', () => {
    const child1_grandchild1 = mTextNode({ type: 'Text', raw: 'gc1' });
    const child1 = mElementNode({
      type: 'Element',
      tag: 'p',
      children: [child1_grandchild1],
      raw: '<p>gc1</p>',
    });
    const child2_grandchild1 = mTextNode({ type: 'Text', raw: 'gc2' });
    const child2 = mElementNode({
      type: 'Element',
      tag: 'span',
      children: [child2_grandchild1],
      raw: '<span>gc2</span>',
    });
    const child3 = mTextNode({ type: 'Text', raw: 'c3' });
    const parent = mElementNode({
      type: 'Element',
      tag: 'div',
      children: [child1, child2, child3],
      raw: '<div>...</div>',
    });

    const result = Array.from(walk(parent));
    const expected = [
      parent,
      child1,
      child1_grandchild1,
      child2,
      child2_grandchild1,
      child3,
    ];
    deepStrictEqual(result, expected);
  });

  it('should yield nothing for an empty array input', () => {
    const result = Array.from(walk([]));
    deepStrictEqual(result, []);
  });

  it('should not traverse children if the node is not an Element type', () => {
    const node = mElementNode({
      type: 'NotAnElement',
      children: [{ type: 'Text', raw: 'should not be yielded' }],
    }) as any;
    const result = Array.from(walk(node));
    deepStrictEqual(result, [node]);
  });

  it('should not traverse children if the children property is not an array', () => {
    const node = mElementNode({
      type: 'Element',
      tag: 'div',
      children: null as any, // Test non-array children
      raw: '<div></div>',
    });
    const result = Array.from(walk(node));
    deepStrictEqual(result, [node]);
  });
});
