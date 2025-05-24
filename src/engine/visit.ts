import type { ASTNode } from '../analyzers/analyzer';

export async function visit<N extends ASTNode>(
  node: N,
  callback: (node: N) => Promise<void> | void,
): Promise<void> {
  if (!node || typeof node !== 'object') return;

  await Promise.resolve(callback(node));

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await Promise.resolve(visit(child, callback));
    }
  }
}
