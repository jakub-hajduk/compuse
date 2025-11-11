import type { ASTNode, ParserPlugin } from 'fragmint';

/**
 * Represents a single attribute usage on a component.
 */
export interface AttributeUsage {
  /** The name of the attribute. */
  name: string;
  /** The value of the attribute. Can be null if the attribute has no value (is boolean attribute) */
  value: string | null;
  /** Whether the attribute's value is computed (e.g., a variable binding). */
  computed: boolean;
}

/**
 * Represents a single event handler on a component.
 */
export interface EventUsage {
  /** The name of the event. */
  name: string;
}

/**
 * Represents a single slot usage in a component.
 */
export interface SlotUsage {
  /** The name of the slot. 'default' for the default slot. */
  name: string;
  /** The raw HTML fragment of the slot's content. */
  fragment: string;
}

/**
 * Represents a range of lines in a file.
 */
export interface Lines {
  /** The starting line number. */
  start: number;
  /** The ending line number. */
  end: number;
}

/**
 * Represents a single usage of a component in the code.
 */
export interface ComponentUsage {
  /** The name of the component. */
  component: string;
  /** An array of attributes used on the component. */
  attributes: AttributeUsage[];
  /** An array of slots used in the component. */
  slots: SlotUsage[];
  /** An array of events handled on the component. */
  events: EventUsage[];
  /** The raw HTML fragment of the component usage. */
  fragment: string;
  /** The line range where the component usage is located. */
  lines: Lines;
}

/**
 * Represents the result of analyzing a single file.
 */
export interface FileAnalyzeResult {
  /** An array of component usages found in the file. */
  usages: ComponentUsage[];
  /** The path to the analyzed file. */
  file: string;
}

/**
 * Represents the name of a component.
 */
export type NameUsage = string;

/**
 * Defines the interface for a framework-specific analyzer.
 */
export interface Analyzer {
  /** The name of the analyzer. */
  name: string;
  /** The fragmint parser plugin to use for parsing the code. */
  parsePlugin: ParserPlugin;
  /** A function to extract the component name from an AST node. */
  extractName(node: ASTNode): NameUsage;
  /** A function to extract event handlers from an AST node. */
  extractEvents(node: ASTNode): EventUsage[];
  /** A function to extract slots from an AST node. */
  extractSlots(node: ASTNode): SlotUsage[];
  /** A function to extract attributes from an AST node. */
  extractAttributes(node: ASTNode): AttributeUsage[];
}

/**
 * Defines the options for the `analyzeCode` function.
 */
export interface AnalyzeOptions {
  /** A list of component tags to exclusively analyze. */
  components: string[];
}
