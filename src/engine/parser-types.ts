/**
 * Available framework parsers
 */
export type FrameworkType =
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'jsx'
  | 'lit'
  | 'html'
  | 'unknown'
  | ({} & string);

/**
 * Defines the type of a node in the Abstract Syntax Tree (AST).
 */
export type NodeType = 'Element' | 'Text';

/**
 * Represents a single attribute within an HTML or component tag.
 */
export interface ASTAttribute {
  /** The raw name of the attribute as it appears in the template. */
  name: string;
  /** The raw value of the attribute, including quotes or braces. Null for boolean attributes. */
  value: string | null;
  /** A flag indicating if the attribute's value is defined staticly or computed (e.g., a variable or expression). */
  computed?: boolean;
  /** The original source string for the entire attribute (e.g., 'attr="value"'). */
  raw: string;
  /** The start and end offsets of the attribute in the source code. */
  loc: { start: number; end: number };
}

export interface ElementNode {
  /** The type of the node */
  type: 'Element';
  /** The tag name for 'Element' nodes (e.g., 'div', 'my-component', 'SomeElement'). */
  tag: string;
  /** An array of attributes for 'Element' nodes. */
  attributes: ASTAttribute[];
  /** An array of child nodes. */
  children: ASTNode[];
  /** The start and end offsets of the node in the source code. */
  loc: { start: number; end: number };
  /** The original source string for the node. */
  raw: string;
}

export interface TextNode {
  /** The type of the node */
  type: 'Text';
  /** The start and end offsets of the node in the source code. */
  loc: { start: number; end: number };
  /** The original source string for the node. */
  raw: string;
}

/**
 * Represents a node in the Abstract Syntax Tree (AST) of a template.
 */
export type ASTNode = ElementNode | TextNode;

/**
 * Represents a template string extracted from a source file.
 */
export interface ExtractedTemplate {
  /** The content of the template. */
  template: string;
  /** The starting offset of the template within the original source file. */
  offset: number;
}

/**
 * Defines a strategy for parsing templates from a specific framework.
 */
export interface ParserPlugin {
  /** A unique and stable name for the strategy (e.g., 'vue', 'angular'). */
  name: FrameworkType;

  /**
   * Extracts template strings from a full source file.
   * @param source The source code of the file.
   * @returns An array of extracted templates with their offsets.
   */
  extractTemplates(source: string): ExtractedTemplate[];

  /**
   * Extracts attributes from a single tag-opening fragment.
   * @param rawAttributes The string fragment of the opening tag, starting after the tag name and ending before the closing '>'.
   * @param baseOffset The base offset of the tag within the original source file.
   * @returns An array of attributes found in the tag.
   */
  extractAttributes(rawAttributes: string, baseOffset: number): ASTAttribute[];
}
