import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Analyzer, FileAnalyzeResult } from '../analyzers/analyzer';
import { analyzeCode } from './analyze-code';

export function analyzeFile(
  path: string,
  analyzer: Analyzer<any>,
): FileAnalyzeResult {
  const filePath = resolve(path);
  const code = readFileSync(filePath, 'utf8');
  const componentUsages = analyzeCode(code, analyzer);

  if (!componentUsages) throw new Error(`Couldn't analyze file "${path}"`);

  return {
    usages: componentUsages,
    file: filePath,
  };
}
