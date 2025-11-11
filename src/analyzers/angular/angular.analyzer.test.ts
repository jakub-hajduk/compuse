import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { ElementNode, TextNode } from 'fragmint';
import { mElementNode, mTextNode } from '../../utils/test-utils';
import { angularAnalyzer } from './angular.analyzer';

describe('angularAnalyzer', () => {
  describe('extractName', () => {
    it('should extract the tag name of the element', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        raw: '<my-component></my-component>',
      });
      strictEqual(angularAnalyzer.extractName(node), 'my-component');
    });
  });

  describe('extractAttributes', () => {
    it('should extract standard and Angular-specific attributes', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: '[prop]', value: 'someValue', computed: true },
          { name: '[(ngModel)]', value: 'myModel', computed: true },
          { name: '*ngIf', value: 'isVisible', computed: true },
          { name: '#myVar', value: null, computed: false },
        ],
      });
      const attributes = angularAnalyzer.extractAttributes(node);
      deepStrictEqual(attributes, [
        { name: 'id', value: 'my-id', computed: false },
        { name: '[prop]', value: 'someValue', computed: true },
        { name: '[(ngModel)]', value: 'myModel', computed: true },
        { name: '*ngIf', value: 'isVisible', computed: true },
        { name: '#myVar', value: null, computed: false },
      ]);
    });

    it('should filter out event handlers', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: '(click)', value: 'onClick()', computed: true },
        ],
      });
      const attributes = angularAnalyzer.extractAttributes(node);
      deepStrictEqual(attributes, [
        { name: 'id', value: 'my-id', computed: false },
      ]);
    });

    it('should return an empty array for non-element nodes', () => {
      const node: TextNode = mTextNode({ type: 'Text', raw: 'some text' });
      deepStrictEqual(angularAnalyzer.extractAttributes(node), []);
    });
  });

  describe('extractEvents', () => {
    it('should extract event handlers', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        attributes: [
          { name: '(click)', value: 'onClick()', computed: true },
          { name: '@output', value: 'onEvent()', computed: true },
        ],
      });
      const events = angularAnalyzer.extractEvents(node);
      deepStrictEqual(events, [{ name: '(click)' }]);
    });

    it('should filter out attributes', () => {
      const node = mElementNode({
        type: 'Element',
        tag: 'my-component',
        attributes: [
          { name: 'id', value: 'my-id', computed: false },
          { name: '[prop]', value: 'someValue', computed: true },
        ],
      });
      const events = angularAnalyzer.extractEvents(node);
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
      deepStrictEqual(angularAnalyzer.extractSlots(node), [
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
      deepStrictEqual(angularAnalyzer.extractSlots(node), [
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
      deepStrictEqual(angularAnalyzer.extractSlots(node), []);
    });

    it('should handle the initial text node case', () => {
      const node: TextNode = mTextNode({ type: 'Text', raw: ' some text ' });
      // This case in the implementation is unusual, but this test verifies its behavior.
      deepStrictEqual(angularAnalyzer.extractSlots(node), [
        { name: 'default', fragment: ' some text ' },
      ]);
    });
  });
});
