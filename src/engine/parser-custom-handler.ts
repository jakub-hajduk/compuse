import type { Handler, Parser } from 'htmlparser2';
import { deindent } from '../utils/deindent'
import type {
  ASTAttribute,
  ASTNode,
  ElementNode,
  TextNode,
} from './parser-types';

interface ParserInterface extends Parser {}

export class CompuseHandler implements Partial<Handler> {
  public root: ASTNode = {
    attributes: [],
    tag: 'ROOT',
    raw: '',
    type: 'Element',
    loc: {
      start: 0,
      end: 0,
    },
    children: [],
  };

  getRawCode(start = this.parser?.startIndex, end = this.parser?.endIndex) {
    return (
      //@ts-expect-error
      deindent(this.parser?.buffers?.[0].slice(
          start ?? 0,
          end ?? 0,
        ) || ''
      ));
  }

  protected tagStack: ASTNode[] = [this.root];
  protected lastNode: ASTNode | null = null;
  protected nextAttributes: ASTAttribute[] = [];

  private parser: ParserInterface | null = null;

  public onparserinit(parser: ParserInterface): void {
    this.parser = parser;
  }

  public onclosetag(): void {
    this.lastNode = null;

    const elem = this.tagStack.pop() as ASTNode;


    elem.loc.end = this.parser.endIndex || 0;
    elem.raw = this.getRawCode(elem.loc.start, elem.loc.end + 1);
  }

  public onopentag(name: string): void {
    const raw = this.getRawCode();

    const element: ElementNode = {
      type: 'Element',
      raw,
      tag: name,
      attributes: this.nextAttributes,
      children: [],
      loc: {
        start: 0,
        end: 0,
      },
    };
    this.addNode(element);
    this.tagStack.push(element);
  }

  onattribute(name: string, value: string): void {
    const raw = this.getRawCode();

    const attribute: ASTAttribute = {
      raw,
      name,
      value,
      computed: false,
      loc: {
        start: this.parser?.startIndex || 0,
        end: this.parser?.endIndex || 0,
      },
    };
    this.nextAttributes.push(attribute);
  }

  public ontext(data: string): void {
    const { lastNode } = this;

    if (lastNode && lastNode.type === 'Text') {
      lastNode.raw += data;
      lastNode.loc.end = this.parser?.endIndex || 0;
    } else {
      const node: TextNode = {
        type: 'Text',
        raw: data,
        loc: {
          start: this.parser?.startIndex || 0,
          end: this.parser?.endIndex || 0,
        },
      };
      this.addNode(node);
      this.lastNode = node;
    }
  }

  protected addNode(node: ASTNode): void {
    const parent = this.tagStack.at(-1);
    if (!parent) return;

    node.loc = {
      start: this.parser?.startIndex || 0,
      end: this.parser?.endIndex || 0,
    };

    this.nextAttributes = [];

    if (parent.type === 'Element') {
      parent.children.push(node);
    }
    this.lastNode = null;
  }
}

export default CompuseHandler;
