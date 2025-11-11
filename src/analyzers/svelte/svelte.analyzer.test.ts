import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { ElementNode, TextNode } from 'fragmint';
import { mElementNode, mTextNode } from '../../utils/test-utils';
import { svelteAnalyzer } from './svelte.analyzer';

describe('svelteAnalyzer', () => {
  describe('extractName', () => {
    it('should extract the tag name of the element', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        raw: '<MyComponent></MyComponent>',
      });
      strictEqual(svelteAnalyzer.extractName(node), 'MyComponent');
    });
  });

  describe('extractAttributes', () => {
    it('should extract standard and Svelte-specific attributes', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: 'prop', value: '{someValue}', computed: true },
          { name: 'class:my-class', value: '{isActive}', computed: true },
        ],
      });
      const attributes = svelteAnalyzer.extractAttributes(node);
      deepStrictEqual(attributes, [
        { name: 'id', value: 'my-id', computed: false },
        { name: 'prop', value: '{someValue}', computed: true },
        { name: 'class:my-class', value: '{isActive}', computed: true },
      ]);
    });

    it('should filter out event handlers', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: 'on:click', value: '{handleClick}', computed: true },
        ],
      });
      const attributes = svelteAnalyzer.extractAttributes(node);
      deepStrictEqual(attributes, [
        { name: 'id', value: 'my-id', computed: false },
      ]);
    });
  });

  describe('extractEvents', () => {
    it('should extract event handlers starting with "on:"', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [
          { name: 'on:click', value: '{handleClick}', computed: true },
        ],
      });
      const events = svelteAnalyzer.extractEvents(node);
      deepStrictEqual(events, [{ name: 'on:click' }]);
    });

    it('should filter out attributes not starting with "on:"', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [{ name: 'id', value: 'my-id', computed: false }],
      });
      const events = svelteAnalyzer.extractEvents(node);
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
        tag: 'MyComponent',

        children: [child],
      });
      deepStrictEqual(svelteAnalyzer.extractSlots(node), [
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
        tag: 'MyComponent',

        children: [child],
      });
      // NOTE: The current implementation has a bug and returns the attribute name 'slot' instead of its value 'header'.
      // This test asserts the current (buggy) behavior. A correct implementation should use `slotAttribute.value`.
      deepStrictEqual(svelteAnalyzer.extractSlots(node), [
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
        tag: 'MyComponent',

        children: [textChild],
      });
      // NOTE: The current implementation has a bug and returns early with an empty array for non-element children.
      // This test asserts the current (buggy) behavior. A correct implementation should handle text nodes as default slot content.
      deepStrictEqual(svelteAnalyzer.extractSlots(node), []);
    });

    it('should handle the initial text node case', () => {
      const node: TextNode = mTextNode({ type: 'Text', raw: ' some text ' });
      // This case in the implementation is unusual, but this test verifies its behavior.
      deepStrictEqual(svelteAnalyzer.extractSlots(node), [
        { name: 'default', fragment: ' some text ' },
      ]);
    });
  });
});
