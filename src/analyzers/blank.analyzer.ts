import type { Analyzer, AttributeUsage, SlotUsage } from '../analyzer';

export const frameworkAnalyzer: Analyzer<any> = {
  name: '<...>Analyzer',
  match: (path: string, pkg: object) => true,
  getElementName: (node: any) => '',
  parse(code: string) {
    return {};
  },
  extract(node) {
    const component = '';
    const attributes: AttributeUsage[] = [];
    const slots: SlotUsage[] = [];

    return {
      component,
      attributes,
      slots,
      lines: {
        start: 0,
        end: 0,
      },
    };
  },
};
