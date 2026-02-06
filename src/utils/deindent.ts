export function deindent(multiline: string): string {
  const lines = multiline.replace(/\r\n/g, '\n').split('\n');

  const indents = lines
    .filter(line => line.trim() !== '')
    .map(line => {
      const match = line.match(/^[ \t]+/);
      return match ? match[0].length : 0;
    })
    .filter(indent => indent > 0);

  if (indents.length === 0) {
    return multiline;
  }

  const minIndent = Math.min(...indents);

  return lines
    .map(line =>
      line.startsWith(' '.repeat(minIndent)) || line.startsWith('\t'.repeat(minIndent))
        ? line.slice(minIndent)
        : line
    )
    .join('\n');
}
