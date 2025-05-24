import { angularAnalyzer } from './analyzers/angular/angular.analyzer';
import { reactAnalyzer } from './analyzers/react/react.analyzer';
import { vueAnalyzer } from './analyzers/vue/vue.analyzer';
import { analyzeFile } from './engine/analyze-file';

const angularUsage = await analyzeFile(
  './src/analyzers/angular/test.component.html',
  angularAnalyzer,
);
console.log(angularUsage);

// const angularUsage = await analyzeFile(
//   './src/analyzers/angular/embed.component.ts',
//   angularAnalyzer,
// );

const vueUsage = await analyzeFile(
  './src/analyzers/vue/template.vue',
  vueAnalyzer,
);
console.log(vueUsage);

const reactUsage = await analyzeFile(
  './src/analyzers/react/template.tsx',
  reactAnalyzer,
);
console.log(reactUsage);
