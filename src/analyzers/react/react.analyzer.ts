import type { ASTNode, ElementNode } from 'fragmint';
import { jsx } from 'fragmint/jsx';
import type {
  Analyzer,
  AttributeUsage,
  EventUsage,
  SlotUsage,
} from '../../engine/types';

const RE_EVENT = /^on[A-Z]/;

export const reactAnalyzer: Analyzer = {
  name: 'reactAnalyzer',

  parsePlugin: jsx,

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
        computed: !!computed,
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
    if (node.type !== 'Element') return [];

    const slotContentMap: Record<string, string> = {};

    for (const child of node.children) {
      const raw = child.raw?.trim();
      if (!raw) continue;

      let slotName = 'default'

      if (child.type === 'Element') {
        const slotAttribute = child.attributes.find(a => a.name === 'slot');
        if (slotAttribute) {
          slotName = slotAttribute.value as string
        }
      }

      slotContentMap[slotName] = slotContentMap[slotName]
        ? `${slotContentMap[slotName]}\n${raw}`
        : raw;
    }

    return Object.entries(slotContentMap).map(([name, fragment]) => ({
      name,
      fragment,
    })) as SlotUsage[];
  },
};
