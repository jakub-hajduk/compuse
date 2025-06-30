import { generate } from '@babel/generator';
import { parse as babelParse } from '@babel/parser';
import _traverse, { type NodePath } from '@babel/traverse';
import {
  type File,
  type JSXAttribute,
  type JSXElement,
  type Node,
  isJSXAttribute,
  isJSXIdentifier,
} from '@babel/types';
import { get } from '../../utils/get';
import type { Analyzer, AttributeUsage, SlotUsage } from '../analyzer';

const traverse = (_traverse as any).default || _traverse;

export const reactAnalyzer: Analyzer<JSXElement> = {
  name: 'ReactAnalyzer',

  shouldAnalyze() {
    return true;
  },

  parseCode(code: string) {
    return babelParse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });
  },

  visit(node, callback) {
    traverse(node, {
      JSXElement(path: NodePath) {
        callback(path.node as JSXElement);
      },
    });
  },

  shouldExtract(node) {
    return true;
  },

  extractName(node) {
    return isJSXIdentifier(node.openingElement.name)
      ? node.openingElement.name.name
      : '';
  },

  extractAttributes(node) {
    const attributes: AttributeUsage[] = [];

    for (const attribute of node.openingElement.attributes) {
      attributes.push({
        name: get(attribute, 'name.name', `(COULDN'T RESOLVE NAME)`),
        value:
          get(attribute, 'value.value') ||
          generate(get(attribute, 'value.expression')).code,
        computed: !get(attribute, 'value.value'),
      });
    }

    return attributes;
  },

  extractSlots(node) {
    const slots: SlotUsage[] = [];

    if (node.children) {
      for (const children of node.children) {
        const slotProp = get(children, 'openingElement.attributes', []).find(
          (prop: JSXAttribute) => prop.name.name === 'slot',
        );
        let name = slotProp?.value?.value;
        name ??=
          slotProp?.value?.expression &&
          generate(slotProp?.value?.expression)?.code;
        name ??= 'default';
        const fragment = generate(children).code;

        if (!!name && fragment.length > 0) {
          slots.push({
            name,
            fragment,
          });
        }
      }
    }

    return slots;
  },

  extractLines(node) {
    return {
      start: get(node, 'loc.start.line'),
      end: get(node, 'loc.end.line'),
    };
  },
};
