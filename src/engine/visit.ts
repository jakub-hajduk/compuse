import type { ASTNode, VisitCallback } from '../analyzers/analyzer';

export function visit<N extends ASTNode>(
  node: N,
  callback: VisitCallback<N>,
): void {
  const recursive = (node: N, callback: VisitCallback<N>) => {
    callback(node);

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        recursive(child, callback);
      }
    }
  };

  recursive(node, callback);
}
