export function deindent(text: string): string {
  const lines = text.split('\n');

  const indentLengths = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^(\s*)/)?.at(1)?.length || 0);

  const minIndent = Math.min(...indentLengths);

  return lines
    .map((line) =>
      line.slice(0, minIndent).trim() === '' ? line.slice(minIndent) : line,
    )
    .join('\n');
}
