# Compuse

Welcome to Compuse! This is a powerful and flexible library designed to analyze component usage across various codebases, regardless of the framework you're using. Whether you're working with Angular, React, Vue, or Svelte, Compuse provides the tools you need to understand how your components are being utilized.

## Features

- **Framework Agnostic:** Analyze component usage in any framework.
- **Extensible:** Create your own analyzers to support custom frameworks or specific analysis needs.
- **Detailed Analysis:** Extract component names, attributes, slots, and events.
- **Code Fragments:** Get the exact code fragment for each component usage.
- **Line Numbers:** Pinpoint the exact location of component usage in your code.

## Installation

You can install Compuse using your favorite package manager:

```bash
# pnpm
pnpm add compuse

# npm
npm install compuse

# yarn
yarn add compuse
```

## Usage

Compuse is designed to be straightforward to use. The core of the library is the `analyzeCode` function, which takes your code and an analyzer as input and returns an array of component usages.

### `analyzeCode` Function

The `analyzeCode` function is the main entry point for analyzing your code. It takes two arguments:

- `code` (string): The code you want to analyze.
- `analyzer` (Analyzer): An analyzer object that defines how to parse and extract information from the code.

Here's a simple example of how to use it:

```typescript
import { analyzeCode, vueAnalyzer } from 'compuse';

const code = `
  <template>
    <MyComponent name="World" />
  </template>
`;

const usages = analyzeCode(code, vueAnalyzer);

console.log(usages);
```

This will output:

```json
[
  {
    "component": "MyComponent",
    "attributes": [
      {
        "name": "name",
        "value": "World",
        "computed": false
      }
    ],
    "slots": [],
    "events": [],
    "lines": {
      "start": 3,
      "end": 3
    },
    "fragment": "<MyComponent name=\"World\" />"
  }
]
```

### `Analyzer` Interface

The `Analyzer` interface is the heart of Compuse's extensibility. It allows you to define how to analyze code for a specific framework or use case. Here's a breakdown of the interface:

**`name`**

type: `string`

The name of the analyzer.

**`extractTemplate`**

type: `(code: string) => string`

(Optional) A function to extract the template from a code string. This is useful for frameworks like Vue where the template is embedded in a single file component.

**`parseCode`**

type: `(code: string) => any`

A function that parses the code into an Abstract Syntax Tree (AST).

**`shouldAnalyze`**

type: `(context: PackageContext) => boolean`

(Optional) A function that determines whether the analyzer should process a given file based on its context (e.g., `package.json`, file path).

**`visit`**

type: `VisitFn<any>`

(Optional) A custom function for traversing the AST.

**`shouldExtract`**

type: `(node: NODE) => boolean`

A function that determines whether to extract component usage information from a given AST node.

**`extractName`**

type: `(node: NODE) => string`

A function that extracts the name of the component from an AST node.

**`extractAttributes`**

type: `(node: NODE) => AttributeUsage[]`

(Optional) A function that extracts attributes from an AST node.

**`extractSlots`**

type: `(node: NODE) => SlotUsage[]`

(Optional) A function that extracts slot usage information from an AST node.

**`extractEvents`**

type: `(node: NODE) => EventUsage[]`

(Optional) A function that extracts event usage information from an AST node.

**`extractLines`**

type: `(node: NODE) => Lines`

A function that extracts the start and end line numbers of the component usage.

By implementing this interface, you can create your own analyzers to support any framework or custom analysis needs you may have.

## Contributing

We welcome contributions! Please see our `CONTRIBUTING.md` for more information.

## License

This project is licensed under the ISC License.
