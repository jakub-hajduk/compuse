import type {
  Analyzer,
  ComponentUsage,
  ComponentUsageExtract,
  VisitFn,
} from '../analyzers/analyzer';
import { deindent } from '../utils/deindent';
import { visit } from './visit';

export async function analyzeCode(
  code: string,
  analyzer: Analyzer<any>,
): Promise<ComponentUsage[] | undefined> {
  let templateCode = code;

  if (typeof analyzer.extractTemplateCode === 'function') {
    templateCode = await Promise.resolve(analyzer.extractTemplateCode(code));
  }

  const AST = await Promise.resolve(analyzer.parseTemplateCode(templateCode));
  if (!AST) throw new Error(`Couldn't analyze templateCode "${templateCode}"`);

  const visitFn: VisitFn = analyzer.customVisit ?? visit;
  const output: ComponentUsage[] = [];

  await Promise.resolve(
    visitFn(AST, async (node) => {
      const usageData = await Promise.resolve(analyzer.extract(node));
      if (usageData) {
        output.push({
          ...usageData,
          fragment: deindent(
            templateCode
              .split('\n')
              .slice(usageData.lines.start - 1, usageData.lines.end)
              .join('\n'),
          ),
          file: '',
        });
      }
    }),
  );

  return output;
}
