import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    analyze: './src/engine/analyze.ts',
    angular: './src/analyzers/angular/angular.analyzer.ts',
    html: './src/analyzers/html/html.analyzer.ts',
    lit: './src/analyzers/lit-html/lit-html.analyzer.ts',
    react: './src/analyzers/react/react.analyzer.ts',
    svelte: './src/analyzers/svelte/svelte.analyzer.ts',
    vue: './src/analyzers/vue/vue.analyzer.ts',
  },
  format: ['esm', 'cjs'],
  exports: true,
  dts: {
    sourcemap: true,
  },
});
