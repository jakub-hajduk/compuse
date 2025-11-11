import { parse } from 'fragmint';
import { deindent } from '../utils/deindent';
import { getLineOffsets } from '../utils/get-line-offests';
import { getLineRange } from '../utils/get-line-ranges';
import { walk } from '../utils/walk';
import type { AnalyzeOptions, Analyzer, ComponentUsage } from './types';

export function* analyzeCode(
  code: string,
  analyzer: Analyzer,
  options?: Partial<AnalyzeOptions>,
): Generator<ComponentUsage> {
  const lineOffsets = getLineOffsets(code);
  const AST = parse(code, analyzer.parsePlugin).flat();
  const componentFilter = options?.components
    ? (tag: string) => options.components?.includes(tag) as boolean
    : () => true;

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
