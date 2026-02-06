import { type ASTNode, parse } from 'fragmint';
import { Parser } from 'htmlparser2';
import { deindent } from '../utils/deindent';
import { getLineOffsets } from '../utils/get-line-offests';
import { getLineRange } from '../utils/get-line-ranges';
import { walk } from '../utils/walk';
import CompuseHandler from './parser-custom-handler';
import type { AnalyzeOptions, Analyzer, ComponentUsage } from './types';

export function* analyzeCode(
  code: string,
  analyzer: Analyzer,
  options?: Partial<AnalyzeOptions>,
): Generator<ComponentUsage> {
  const lineOffsets = getLineOffsets(code);
  const componentFilter = options?.components
    ? (tag: string) => options.components?.includes(tag) as boolean
    : () => true;

  const handler = new CompuseHandler();
  new Parser(handler, {
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    xmlMode: true,
  }).end(code);
  const AST = handler.root;

  for (const node of walk(AST)) {
    if (node.type !== 'Element') continue;
    const component = analyzer.extractName(node);
    if (!componentFilter(component)) continue;
    const attributes = analyzer.extractAttributes(node);
    const events = analyzer.extractEvents(node);
    const slots = analyzer.extractSlots(node);
    const lines = getLineRange(lineOffsets, node.loc.start, node.loc.end);
    yield {
      component,
      attributes,
      events,
      slots,
      fragment: deindent(node.raw),
      lines,
    };
  }
}
