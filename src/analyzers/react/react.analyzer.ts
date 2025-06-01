import { generate } from '@babel/generator';
import { parse as babelParse } from '@babel/parser';
import _traverse, { type NodePath } from '@babel/traverse';
import type { JSXAttribute } from '@babel/types';
import type { Analyzer, AttributeUsage, SlotUsage } from '../analyzer';

const traverse = (_traverse as any).default || _traverse;

export const reactAnalyzer: Analyzer<any> = {
  name: 'ReactAnalyzer',
  match: (path: string) =>
    path.endsWith('.jsx') ||
    path.endsWith('.tsx') ||
    path.endsWith('.js') ||
    path.endsWith('.ts'),
  getElementName: (node: any) => node.openingElement.name.name,
  parseTemplateCode(code: string) {
    return babelParse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });
  },
  customVisit(node, callback) {
    traverse(node, {
      JSXElement(path: NodePath) {
        callback(path.node);
      },
    });
  },
  extract(node) {
    const component = node.openingElement.name.name;

    const attributes: AttributeUsage[] = [];
    const slots: SlotUsage[] = [];

    // Attributes
    for (const attribute of node.openingElement.attributes) {
      attributes.push({
        name: attribute.name.name,
        value:
          attribute.value?.value || generate(attribute.value?.expression)?.code,
        computed: !attribute.value?.value,
      });
    }

    // Slots
    if (node.children) {
      for (const children of node.children) {
        const slotProp = children.openingElement?.attributes?.find(
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

    return {
      component,
      attributes,
      slots,
      lines: {
        start: node.loc.start.line,
        end: node.loc.end.line,
      },
    };
  },
};
