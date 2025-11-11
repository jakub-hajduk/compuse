# Compuse

Compuse is a library for analyzing component usage in your codebase. It provides a unified interface to extract detailed information about how components are used, regardless of whether you're working with React, Vue, Angular, Svelte, Lit-HTML, or plain HTML.

## Features

- **Framework Agnostic:** Analyze component usage across multiple frameworks with a single API.
- **Detailed Analysis:** Extract component names, attributes, slots, and events.
- **Code Fragments:** Get the exact code fragment for each component usage.
- **Line Numbers:** Pinpoint the exact location of component usage in your code.
- **Extensible:** Easily create your own analyzers to support custom frameworks or specific analysis needs.

## Installation

Install Compuse using your favorite package manager:

```bash
# pnpm
pnpm add compuse

# npm
npm install compuse

# yarn
yarn add compuse
```

## Usage

The core of Compuse is the `analyzeCode` generator function. It takes your code and a framework-specific analyzer as input and yields detailed `ComponentUsage` objects.

### `analyzeCode(code, analyzer, options)`

-   `code` (string): The source code to analyze.
-   `analyzer` (Analyzer): The framework-specific analyzer to use.
-   `options` (AnalyzeOptions): Optional configuration.
    -   `components` (string[]): A list of component tags to exclusively analyze.

### Example: Analyzing a React Component

```typescript
import { analyzeCode, reactAnalyzer } from 'compuse';

const code = `
  function App() {
    return (
      <MyComponent
        id="my-id"
        prop={someValue}
        onClick={handleClick}
      >
        <div slot="header">Header</div>
        Default Content
      </MyComponent>
    );
  }
`;

for (const usage of analyzeCode(code, reactAnalyzer)) {
  console.log(usage);
}
```

This will output:

```json
{
  "component": "MyComponent",
  "attributes": [
    { "name": "id", "value": "my-id", "computed": false },
    { "name": "prop", "value": "someValue", "computed": true }
  ],
  "events": [
    { "name": "onClick" }
  ],
  "slots": [
    { "name": "slot", "fragment": "<div slot=\"header\">Header</div>" },
    { "name": "default", "fragment": "Default Content" }
  ],
  "fragment": "<MyComponent id=\"my-id\" prop={someValue} onClick={handleClick}>\n  <div slot=\"header\">Header</div>\n  Default Content\n</MyComponent>",
  "lines": { "start": 3, "end": 10 }
}
```

### Supported Analyzers

Compuse comes with built-in analyzers for popular frameworks:

-   `angularAnalyzer`
-   `htmlAnalyzer`
-   `litHtmlAnalyzer`
-   `reactAnalyzer`
-   `svelteAnalyzer`
-   `vueAnalyzer`

### Creating a Custom Analyzer

You can create a custom analyzer by implementing the `Analyzer` interface. This is useful for supporting custom frameworks or extending the functionality of existing analyzers.

```typescript
import type { Analyzer } from 'compuse';
import { parse } from 'fragmint';
import { customParsePlugin } from './custom-parse-plugin';

export const customAnalyzer: Analyzer = {
  name: 'customAnalyzer',
  parsePlugin: customParsePlugin, // A fragmint parse plugin

  extractName(node) {
    // Logic to extract the component name from an AST node
    return node.tag;
  },

  extractAttributes(node) {
    // Logic to extract attributes
    return node.attributes || [];
  },

  extractEvents(node) {
    // Logic to extract events
    return (node.attributes || []).filter(attr => attr.name.startsWith('on-'));
  },
  
  extractSlots(node) {
    // Logic to extract slots
    return (node.children || []).map(child => ({
      name: child.attributes?.find(attr => attr.name === 'slot')?.value || 'default',
      fragment: child.raw,
    }));
  },
};
```

## Contributing

Contributions are welcome! Please see our `CONTRIBUTING.md` for more information.

## License

This project is licensed under the ISC License.
