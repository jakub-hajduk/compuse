import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Analyzer, ComponentUsage } from '../analyzers/analyzer';
import { analyzeCode } from './analyze-code';

export async function analyzeFile(
  path: string,
  analyzer: Analyzer<any>,
): Promise<ComponentUsage[]> {
  const filePath = resolve(path);
  const code = readFileSync(filePath, 'utf8');
  const usages = await analyzeCode(code, analyzer);
  if (!usages) throw new Error(`Couldn't analyze file "${path}"`);

  const output: ComponentUsage[] = [];

  for (const usage of usages) {
    const fullUsage: ComponentUsage = {
      ...usage,
      file: filePath,
    };

    output.push(fullUsage);
  }

  return output;
}
