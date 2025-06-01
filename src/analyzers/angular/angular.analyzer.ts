import {
  type TmplAstBoundAttribute,
  type TmplAstTextAttribute,
  parseTemplate,
} from '@angular/compiler';
import { get } from 'get-wild';
import { ScriptTarget, createSourceFile } from 'typescript';
import type {
  Analyzer,
  AttributeUsage,
  ComponentUsageExtract,
  SlotUsage,
} from '../analyzer';

export function mightBeAngularTemplate(code: string): boolean {
  const isProbablyTypeScript = /^(import|export|@Component|class|\s)*\s/.test(
    code,
  );
  const hasComponentDecorator = /@Component\s*\(\s*{[\s\S]*?}\s*\)/.test(code);
  const hasClassDeclaration = /\bexport\s+class\s+\w+/.test(code);

  const looksLikeHtml = /<\/?[a-zA-Z][^>]*>/.test(code);
  const looksLikeNgSyntax = /\*ngIf=|\[\w+\]=|\(\w+\)=|{{[^}]+}}/.test(code);

  return (
    !isProbablyTypeScript &&
    !hasComponentDecorator &&
    !hasClassDeclaration &&
    (looksLikeHtml || looksLikeNgSyntax)
  );
}

const tryParseTemplate = (template: string) => {
  try {
    const ast = parseTemplate(template, '');
    if (ast.errors?.length) return {};
    return { children: ast.nodes };
  } catch {}
};

export const angularAnalyzer: Analyzer<any> = {
  name: 'angularAnalyzer',

  match: (path: string) => {
    return path.endsWith('component.html') || path.endsWith('component.ts');
  },

  getElementName: (node) => node.name,

  extractTemplateCode(code: string) {
    if (mightBeAngularTemplate(code)) return code;

    const componentAst = createSourceFile(
      'webc-usage.component.ts',
      code,
      ScriptTarget.Latest,
      true,
    );

    const elems = get(
      componentAst,
      'statements.*.modifiers.*.expression.arguments.*.properties.*',
    );

    const templateProperty = elems.find(
      (propertyDefinition: any) =>
        propertyDefinition?.name?.escapedText === 'template',
    );

    if (!templateProperty) return;

    return templateProperty.initializer?.rawText || '';
  },

  parseTemplateCode(code: string) {
    return tryParseTemplate(code);
  },
  extract(node) {
    const component = node.name;
    if (!component) return;
    const attributes: AttributeUsage[] = [];
    const slots: SlotUsage[] = [];

    // Attributes
    for (const attribute of node.attributes || []) {
      const name = attribute.name;
      const value = attribute.value;
      attributes.push({
        name,
        value,
        computed: false,
      });
    }

    for (const input of node.inputs || []) {
      const name = input.name;
      const value = input.value.source;

      attributes.push({
        name,
        value,
        computed: true,
      });
    }

    // Slots
    for (const child of node.children || []) {
      const slot =
        child.attributes?.find(
          (attr: TmplAstTextAttribute) => attr.name === 'slot',
        ) ||
        child.inputs?.find(
          (attr: TmplAstBoundAttribute) => attr.name === 'slot',
        );

      const name = slot?.value || 'default';

      const span = child.sourceSpan;
      const fragment = child.sourceSpan.start.file.content.slice(
        span.start.offset,
        span.end.offset,
      );

      slots.push({
        name,
        fragment,
      });
    }

    return {
      component,
      attributes,
      slots,
      lines: {
        start: node.sourceSpan?.start?.line || 0,
        end: node.sourceSpan?.end?.line || 0,
      },
    } as ComponentUsageExtract;
  },
};
