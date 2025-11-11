import type { ASTNode } from 'fragmint';

export function* walk(node: ASTNode | ASTNode[]): Generator<ASTNode> {
  const nodes = Array.isArray(node) ? node : [node];

  for (const node of nodes) {
    yield node;

    if (node.type === 'Element' && Array.isArray(node.children)) {
      yield* walk(node.children);
    }
  }
}
