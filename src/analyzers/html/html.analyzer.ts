import type { ASTNode, ElementNode } from 'fragmint';
import { html } from 'fragmint/html';
import type {
  Analyzer,
  AttributeUsage,
  EventUsage,
  SlotUsage,
} from '../../engine/types';

export const htmlAnalyzer: Analyzer = {
  name: 'htmlAnalyzer',

  parsePlugin: html,

  extractName(node: ElementNode) {
    return node.tag;
  },

  extractAttributes(node: ASTNode): AttributeUsage[] {
    const attributes: AttributeUsage[] = [];
    if (node.type !== 'Element') return [];

    for (const { name, value, computed } of node.attributes) {
      attributes.push({
        name,
        value,
        computed: !!computed,
      });
    }

    return attributes;
  },

  extractEvents(node: ASTNode): EventUsage[] {
    if (node.type !== 'Element') return [];
    const events: EventUsage[] = [];

    for (const { name } of node.attributes) {
      if (!name.startsWith('on')) continue;
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
