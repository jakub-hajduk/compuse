import type {
  Analyzer,
  AttributeUsage,
  ComponentUsage,
  EventUsage,
  Lines,
  SlotUsage,
  VisitFn,
} from '../analyzers/analyzer';
import { deindent } from '../utils/deindent';
import { visit } from './visit';

const isFunction = (value: any): value is (...args: any[]) => any =>
  typeof value === 'function';

export function analyzeCode(
  code: string,
  analyzer: Analyzer<any>,
): ComponentUsage[] {
  const output: ComponentUsage[] = [];
  let templateCode = code;

  if (isFunction(analyzer.extractTemplate)) {
    templateCode = analyzer.extractTemplate(code);
  }

  const AST = analyzer.parseCode(templateCode);
  if (!AST) throw new Error(`Couldn't analyze code!`);

  const visitFn: VisitFn = analyzer.visit ?? visit;

  visitFn(AST, (node: any) => {
    const shouldExtract = analyzer.shouldExtract(node);
    if (!shouldExtract) return;

    const name: string = analyzer.extractName(node);

    const attributesUsage: AttributeUsage[] = isFunction(
      analyzer.extractAttributes,
    )
      ? analyzer.extractAttributes(node)
      : [];

    const slotsUsage: SlotUsage[] = isFunction(analyzer.extractSlots)
      ? analyzer.extractSlots(node)
      : [];

    const eventsUsage: EventUsage[] = isFunction(analyzer.extractEvents)
      ? analyzer.extractEvents(node)
      : [];

    const lines: Lines = isFunction(analyzer.extractLines)
      ? analyzer.extractLines(node)
      : { start: 0, end: 0 };

    output.push({
      component: name,
      attributes: attributesUsage,
      slots: slotsUsage,
      events: eventsUsage,
      lines,
      fragment: deindent(
        templateCode
          .split('\n')
          .slice(lines.start - 1, lines.end)
          .join('\n'),
      ),
    } as ComponentUsage);
  });

  return output;
}
