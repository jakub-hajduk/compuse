import {
  type AttributeNode,
  type DirectiveNode,
  type ElementNode,
  ElementTypes,
  NodeTypes,
} from '@vue/compiler-dom';
import { parse as vueParse } from '@vue/compiler-sfc';
import { get } from '../../utils/get';
import type { Analyzer } from '../analyzer';
import type { AttributeUsage, SlotUsage } from '../analyzer';

const isDirectiveProp = (
  node: AttributeNode | DirectiveNode,
): node is DirectiveNode => node.type === NodeTypes.DIRECTIVE;
const isAttributeProp = (
  node: AttributeNode | DirectiveNode,
): node is AttributeNode => node.type === NodeTypes.ATTRIBUTE;

export const vueAnalyzer: Analyzer<ElementNode> = {
  name: 'VueAnalyzer',

  parseCode(code) {
    const { descriptor } = vueParse(code);
    if (!descriptor.template?.ast) throw 'No template found!';
    return descriptor.template?.ast as any as ElementNode;
  },

  shouldExtract(node) {
    return (
      node.type === NodeTypes.ELEMENT && node.tagType === ElementTypes.COMPONENT
    );
  },

  extractName: (node) => node.tag,

  extractAttributes(node) {
    const attributes: AttributeUsage[] = [];

    if (node.props && node.props.length > 0) {
      for (const prop of node.props) {
        if (isAttributeProp(prop)) {
          attributes.push({
            name: prop.name,
            value: prop.value?.content || null,
            computed: false,
          });
        }
        if (isDirectiveProp(prop)) {
          attributes.push({
            name: prop.name,
            value:
              prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION
                ? prop.exp?.content
                : null,
            computed: true,
          });
        }
      }
    }

    return attributes;
  },

  extractSlots(node) {
    const slots: SlotUsage[] = [];

    if (node.children) {
      for (const children of node.children) {
        const slotProp = (children as any).props?.find(
          (prop: any) => prop.name === 'slot',
        );
        let name = get(slotProp, 'value.content');
        const fragment = get(children, 'loc.source');
        name ??= get(slotProp, 'arg.content');
        name ??= 'default';

        slots.push({
          name,
          fragment,
        });
      }
    }

    return slots;
  },

  extractLines(node) {
    return {
      start: node.loc.start.line,
      end: node.loc.end.line,
    };
  },
};
