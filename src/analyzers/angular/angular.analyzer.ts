import {
  type TmplAstBoundAttribute,
  type TmplAstTextAttribute,
  parseTemplate,
} from '@angular/compiler';
import { get } from 'get-wild';
import { ScriptTarget, createSourceFile } from 'typescript';
import type { Analyzer, AttributeUsage, SlotUsage } from '../analyzer';

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

  shouldAnalyze() {
    return true;
  },

  extractTemplate(code: string) {
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

  parseCode(code: string) {
    return tryParseTemplate(code);
  },

  shouldExtract(node) {
    return node.name;
  },

  extractName(node) {
    return node.name;
  },

  extractAttributes(node) {
    const attributes: AttributeUsage[] = [];

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

    return attributes;
  },

  extractSlots(node) {
    const slots: SlotUsage[] = [];

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

    return slots;
  },

  extractLines(node) {
    return {
      start: node.sourceSpan?.start?.line || 0,
      end: node.sourceSpan?.end?.line || 0,
    };
  },
};
