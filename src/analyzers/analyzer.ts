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

export interface ComponentUsage {
  component: string;
  attributes: AttributeUsage[];
  slots: SlotUsage[];
  fragment: string;
  file: string;
  lines: Lines;
}

export type ComponentUsageExtract = Prettify<
  Omit<ComponentUsage, 'file' | 'fragment'>
>;

export type ASTNode = {
  [key: string]: ASTNode | ASTNode[] | any;
};

export type VisitFn<N extends ASTNode = object> = (
  node: N,
  callback: (node: N) => void,
) => Promise<void> | void;

export type PackageJson = {
  name: string;
  version: string;
  [k: string]: any;
} & {};

export interface Analyzer<NODE extends ASTNode> {
  name: string;
  extractTemplateCode?: (code: string) => Promise<string> | string;
  parseTemplateCode: (
    code: string,
  ) => Promise<NODE | undefined> | NODE | undefined;
  match: (path: string, pkg: PackageJson) => Promise<boolean> | boolean;
  getElementName: (node: NODE) => Promise<string> | string;
  customVisit?: VisitFn<NODE>;
  extract: (
    node: NODE,
  ) =>
    | Promise<ComponentUsageExtract | undefined>
    | ComponentUsageExtract
    | undefined;
}

export type Prettify<T> = { [P in keyof T]: T[P] } & {};
