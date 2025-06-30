export interface AttributeUsage {
  name: string;
  value: string | null;
  computed: boolean;
}

export interface Lines {
  start: number;
  end: number;
}

export interface SlotUsage {
  name: string;
  fragment: string;
}

export interface EventUsage {
  name: string;
}

export interface ComponentUsage {
  component: string;
  attributes: AttributeUsage[];
  slots: SlotUsage[];
  events: EventUsage[];
  fragment: string;
  lines: Lines;
}

export type ComponentUsageExtract = Prettify<
  Omit<ComponentUsage, 'file' | 'fragment'>
>;

export type ASTNode = {
  [key: string]: ASTNode | ASTNode[] | any;
};

export type VisitCallback<N> = (node: N) => void;

export type VisitFn<N extends ASTNode = object> = (
  node: N,
  callback: VisitCallback<N>,
) => void;

export type PackageJson = {
  name: string;
  version: string;
  dependencies: { [k: string]: string };
  [k: string]: any;
} & {};

type Framework = 'angular' | 'vue' | 'react' | 'svelte';

export interface PackageContext {
  pkg: PackageJson;
  framework: Framework;
  filePath: string;
}

/**
 * Represents the API for an analyzer that can process AST nodes and extract component usage information.
 */
export interface Analyzer<NODE extends ASTNode = ASTNode> {
  /**
   * The name of the analyzer.
   */
  name: string;

  /**
   * Optional method to extract the template code from a given code string.
   * This is useful for frameworks where the template can be embedded within other files (e.g., Vue single-file components).
   */
  extractTemplate?: (code: string) => string;

  /**
   * Parses the given template code into an AST node.
   * This method is crucial for converting the template string into a traversable structure.
   */
  parseCode: (code: string) => any; // TODO: Fix 'any' type

  /**
   * Determines whether the analyzer should process a given context.
   * This can be used to filter out irrelevant files or projects based on their `package.json` or file path.
   *
   * TODO: This probably should be together with file in another interface, since it defines whether the file shoudl be analyzed. On the other hand it would be nice to have everythjing in one place.
   */
  shouldAnalyze?: (context: PackageContext) => boolean;

  /**
   * An optional custom visit function for traversing the AST.
   * If provided, this function will be used instead of a default traversal mechanism.
   */
  visit?: VisitFn<any>; // TODO: fix 'any' type

  /**
   * Determines whether component usage information should be extracted from a given AST node.
   * This allows for selective extraction based on node type, component name or its content.
   */
  shouldExtract: (node: NODE) => boolean;

  /**
   * Extracts the name of the component from an AST node.
   */
  extractName: (node: NODE) => string;

  /**
   * Extracts attributes from an AST node.
   */
  extractAttributes?: (node: NODE) => AttributeUsage[];

  /**
   * Extracts slot usage information from an AST node.
   */
  extractSlots?: (node: NODE) => SlotUsage[];

  /**
   * Extracts event usage information from an AST node.
   */
  extractEvents?: (node: NODE) => EventUsage[];

  extractLines: (node: NODE) => Lines;
}

export interface FileAnalyzeResult {
  usages: ComponentUsage[];
  file: string;
}

export type Prettify<T> = { [P in keyof T]: T[P] } & {};
