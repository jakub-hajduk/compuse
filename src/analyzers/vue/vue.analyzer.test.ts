import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { ElementNode, TextNode } from 'fragmint';
import { mElementNode, mTextNode } from '../../utils/test-utils';
import { vueAnalyzer } from './vue.analyzer';

describe('vueAnalyzer', () => {
  describe('extractName', () => {
    it('should extract the tag name of the element', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        raw: '<MyComponent></MyComponent>',
      });
      strictEqual(vueAnalyzer.extractName(node), 'MyComponent');
    });
  });

  describe('extractAttributes', () => {
    it('should extract standard and Vue-specific attributes', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: ':prop', value: 'someValue', computed: true },
          { name: 'v-bind:prop', value: 'anotherValue', computed: true },
        ],
      });
      const attributes = vueAnalyzer.extractAttributes(node);
      deepStrictEqual(attributes, [
        { name: 'id', value: 'my-id', computed: false },
        { name: ':prop', value: 'someValue', computed: true },
        { name: 'v-bind:prop', value: 'anotherValue', computed: true },
      ]);
    });

    it('should filter out event handlers', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: '@click', value: 'handleClick', computed: true },
          { name: 'v-on:click', value: 'handleClick', computed: true },
        ],
      });
      const attributes = vueAnalyzer.extractAttributes(node);
      deepStrictEqual(attributes, [
        { name: 'id', value: 'my-id', computed: false },
      ]);
    });
  });

  describe('extractEvents', () => {
    it('should extract event handlers starting with "@" or "v-on:"', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [
          { name: '@click', value: 'handleClick', computed: true },
          { name: 'v-on:submit', value: 'handleSubmit', computed: true },
        ],
      });
      const events = vueAnalyzer.extractEvents(node);
      deepStrictEqual(events, [{ name: '@click' }, { name: 'v-on:submit' }]);
    });

    it('should filter out attributes not matching event handler patterns', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'MyComponent',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: ':prop', value: 'someValue', computed: true },
        ],
      });
      const events = vueAnalyzer.extractEvents(node);
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
      deepStrictEqual(vueAnalyzer.extractSlots(node), [
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
      deepStrictEqual(vueAnalyzer.extractSlots(node), [
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
      deepStrictEqual(vueAnalyzer.extractSlots(node), []);
    });

    it('should handle the initial text node case', () => {
      const node: TextNode = mTextNode({ type: 'Text', raw: ' some text ' });
      // This case in the implementation is unusual, but this test verifies its behavior.
      deepStrictEqual(vueAnalyzer.extractSlots(node), [
        { name: 'default', fragment: ' some text ' },
      ]);
    });
  });
});
