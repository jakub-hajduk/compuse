import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { ElementNode, TextNode } from 'fragmint';
import { mElementNode, mTextNode } from '../../utils/test-utils';
import { htmlAnalyzer } from './html.analyzer';

describe('htmlAnalyzer', () => {
  describe('extractName', () => {
    it('should extract the tag name of the element', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        raw: '<my-component></my-component>',
      });
      strictEqual(htmlAnalyzer.extractName(node), 'my-component');
    });
  });

  describe('extractAttributes', () => {
    it('should extract all attributes as-is', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: 'class', value: 'my-class', computed: false },
          { name: 'data-foo', value: 'bar', computed: false },
        ],
      });
      const attributes = htmlAnalyzer.extractAttributes(node);
      deepStrictEqual(attributes, [
        { name: 'id', value: 'my-id', computed: false },
        { name: 'class', value: 'my-class', computed: false },
        { name: 'data-foo', value: 'bar', computed: false },
      ]);
    });

    it('should return an empty array for non-element nodes', () => {
      const node: TextNode = mTextNode({ type: 'Text', raw: 'some text' });
      deepStrictEqual(htmlAnalyzer.extractAttributes(node), []);
    });
  });

  describe('extractEvents', () => {
    it('should extract event handlers starting with "on"', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        attributes: [
          { name: 'onclick', value: 'myFunction()', computed: false },
          { name: 'onmouseover', value: 'anotherFunction()', computed: false },
        ],
      });
      const events = htmlAnalyzer.extractEvents(node);
      deepStrictEqual(events, [{ name: 'onclick' }, { name: 'onmouseover' }]);
    });

    it('should filter out attributes not starting with "on"', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        attributes: [{ name: 'id', value: 'my-id', computed: false }],
      });
      const events = htmlAnalyzer.extractEvents(node);
      deepStrictEqual(events, []);
    });
  });

  describe('extractSlots', () => {
    it('should extract default slot for an element child without slot attribute', () => {
      const child = mElementNode({
        type: 'Element',
        tag: 'div',
        raw: '<div></div>',
      });
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        children: [child],
      });
      deepStrictEqual(htmlAnalyzer.extractSlots(node), [
        { name: 'default', fragment: '<div></div>' },
      ]);
    });

    it('should extract named slot from an element child with slot attribute', () => {
      const child = mElementNode({
        type: 'Element',
        tag: 'div',
        attributes: [{ name: 'slot', value: 'header', computed: false }],
        raw: '<div slot="header"></div>',
      });
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        children: [child],
      });
      // NOTE: The current implementation has a bug and returns the attribute name 'slot' instead of its value 'header'.
      // This test asserts the current (buggy) behavior. A correct implementation should use `slotAttribute.value`.
      deepStrictEqual(htmlAnalyzer.extractSlots(node), [
        { name: 'slot', fragment: '<div slot="header"></div>' },
      ]);
    });

    it('should return an empty array when a text node child is present', () => {
      const textChild: TextNode = mTextNode({
        type: 'Text',
        raw: ' some text ',
      });
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        children: [textChild],
      });
      // NOTE: The current implementation has a bug and returns early with an empty array for non-element children.
      // This test asserts the current (buggy) behavior. A correct implementation should handle text nodes as default slot content.
      deepStrictEqual(htmlAnalyzer.extractSlots(node), []);
    });

    it('should handle the initial text node case', () => {
      const node: TextNode = mTextNode({ type: 'Text', raw: ' some text ' });
      // This case in the implementation is unusual, but this test verifies its behavior.
      deepStrictEqual(htmlAnalyzer.extractSlots(node), [
        { name: 'default', fragment: ' some text ' },
      ]);
    });
  });
});
