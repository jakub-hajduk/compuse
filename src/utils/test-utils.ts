import type { ElementNode, TextNode } from 'fragmint';
import type {
  AttributeUsage,
  ComponentUsage,
  EventUsage,
  SlotUsage,
} from '../engine/types';

export function mSlot(input: any): SlotUsage {
  return input as SlotUsage;
}

export function mAttr(input: any): AttributeUsage {
  return input as AttributeUsage;
}

export function mEvent(input: any): EventUsage {
  return input as EventUsage;
}

export function mComponent(input: any): ComponentUsage {
  return input as ComponentUsage;
}

export function mElementNode(input: any): ElementNode {
  return input as ElementNode;
}

export function mTextNode(input: any): TextNode {
  return input as TextNode;
}
