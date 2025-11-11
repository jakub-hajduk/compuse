import type { Lines } from '../engine/types';

export function getLineRange(
  offsets: number[],
  from: number,
  to: number,
): Lines {
  let start = 1;
  let end = offsets.length;

  for (let i = 0; i < offsets.length; i++) {
    if (from >= offsets[i]) start = i + 1;
    if (to < offsets[i]) {
      end = i;
      break;
    }
  }
  return { start, end };
}
