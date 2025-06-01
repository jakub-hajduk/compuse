import type { Analyzer, AttributeUsage, SlotUsage } from './analyzer';

export const frameworkAnalyzer: Analyzer<any> = {
  name: '<...>Analyzer',
  match: (_path: string, _pkg: object) => true,
  getElementName: (_node: any) => '',
  parseTemplateCode(_code: string) {
    return {};
  },
  extract(_node: any) {
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
