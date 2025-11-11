import type { ASTNode, ElementNode } from 'fragmint';
import { vue } from 'fragmint/vue';
import type {
  Analyzer,
  AttributeUsage,
  EventUsage,
  SlotUsage,
} from '../../engine/types';

const RE_ATTRIBUTE = /^(?:v-bind:|\:)[^\]]+$/;
const RE_EVENT = /^(?:v-on:|@)[^\]]+$/;

export const vueAnalyzer: Analyzer = {
  name: 'vueAnalyzer',

  parsePlugin: vue,

  extractName(node: ElementNode) {
    return node.tag;
  },

  extractAttributes(node: ASTNode): AttributeUsage[] {
    const attributes: AttributeUsage[] = [];
    if (node.type !== 'Element') return [];

    for (const { name, value, computed } of node.attributes) {
      if (RE_EVENT.test(name)) continue;
      attributes.push({
        name,
        value,
        computed: !!computed || RE_ATTRIBUTE.test(name),
      });
    }

    return attributes;
  },

  extractEvents(node: ASTNode): EventUsage[] {
    if (node.type !== 'Element') return [];
    const events: EventUsage[] = [];

    for (const { name } of node.attributes) {
      if (!RE_EVENT.test(name)) continue;
      events.push({
        name,
      });
    }

    return events;
  },

  extractSlots(node) {
    const slots: SlotUsage[] = [];

    if (node.type === 'Text') {
      return [
        {
          name: 'default',
          fragment: node.raw,
        },
      ];
    }

    for (const child of node.children) {
      if (child.type !== 'Element') return [];
      const slotAttribute = child.attributes?.find(
        (attr) => attr.name === 'slot',
      );

      slots.push({
        name: slotAttribute?.name || 'default',
        fragment: child.raw,
      });
    }

    return slots;
  },
};
