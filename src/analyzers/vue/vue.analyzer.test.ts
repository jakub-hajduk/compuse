import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { analyzeCode } from '../../engine/analyze-code';
import { vueAnalyzer } from './vue.analyzer';

describe('Vue analyzer', () => {
  describe('Web components with explicit props', () => {
    it('should extract component with static string attributes', async () => {
      const template = `
<template>
  <test-button variant="primary" size="large">Click me</test-button>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-button');
      strictEqual(result[0].attributes.length, 2);

      const variantAttr = result[0].attributes.find(
        (attr) => attr.name === 'variant',
      );
      strictEqual(variantAttr?.value, 'primary');
      strictEqual(variantAttr?.computed, false);

      const sizeAttr = result[0].attributes.find(
        (attr) => attr.name === 'size',
      );
      strictEqual(sizeAttr?.value, 'large');
      strictEqual(sizeAttr?.computed, false);
    });

    it('should extract component with boolean attributes', async () => {
      const template = `
<template>
  <test-input disabled required readonly>Input field</test-input>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-input');
      strictEqual(result[0].attributes.length, 3);

      const disabledAttr = result[0].attributes.find(
        (attr) => attr.name === 'disabled',
      );
      strictEqual(disabledAttr?.value, null); // Vue analyzer returns null for boolean attributes
      strictEqual(disabledAttr?.computed, false);
    });
  });

  describe('Web components with dynamically bound props', () => {
    it('should extract component with v-bind property binding', async () => {
      const template = `
<template>
  <test-button :variant="buttonVariant" :disabled="isDisabled">Submit</test-button>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-button');
      strictEqual(result[0].attributes.length, 2);

      const variantAttr = result[0].attributes.find(
        (attr) => attr.name === 'bind',
      );
      strictEqual(variantAttr?.value, 'buttonVariant');
      strictEqual(variantAttr?.computed, true);
    });

    it('should extract component with v-bind full syntax', async () => {
      const template = `
<template>
  <test-badge v-bind:count="items.length + 1" v-bind:visible="items.length > 0">Badge</test-badge>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-badge');
      strictEqual(result[0].attributes.length, 2);

      const countAttr = result[0].attributes.find(
        (attr) => attr.name === 'bind',
      );
      strictEqual(countAttr?.value, 'items.length + 1');
      strictEqual(countAttr?.computed, true);
    });

    it('should extract component with mixed static and dynamic attributes', async () => {
      const template = `
<template>
  <test-card variant="outlined" :elevated="isElevated" size="medium">Content</test-card>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-card');
      strictEqual(result[0].attributes.length, 3);

      const variantAttr = result[0].attributes.find(
        (attr) => attr.name === 'variant',
      );
      strictEqual(variantAttr?.value, 'outlined');
      strictEqual(variantAttr?.computed, false);

      const elevatedAttr = result[0].attributes.find(
        (attr) => attr.name === 'bind',
      );
      strictEqual(elevatedAttr?.value, 'isElevated');
      strictEqual(elevatedAttr?.computed, true);

      const sizeAttr = result[0].attributes.find(
        (attr) => attr.name === 'size',
      );
      strictEqual(sizeAttr?.value, 'medium');
      strictEqual(sizeAttr?.computed, false);
    });
  });

  describe('Slots using web component syntax', () => {
    it('should extract default slot content', async () => {
      const template = `
<template>
  <test-card>
    <div>This is default slot content</div>
  </test-card>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-card',
      );
      ok(webComponent, 'Should find test-card component');
      strictEqual(webComponent.slots.length, 1);

      const defaultSlot = webComponent.slots.find(
        (slot) => slot.name === 'default',
      );
      ok(defaultSlot);
      ok(defaultSlot.fragment.includes('This is default slot content'));
    });

    it('should extract named slots with slot attribute', async () => {
      const template = `
<template>
  <test-dialog>
    <h2 slot="header">Dialog Title</h2>
    <p slot="content">Dialog content goes here</p>
    <div slot="footer">
      <button>Cancel</button>
      <button>OK</button>
    </div>
  </test-dialog>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-dialog',
      );
      ok(webComponent, 'Should find test-dialog component');
      strictEqual(webComponent.slots.length, 3);

      const headerSlot = webComponent.slots.find(
        (slot) => slot.name === 'header',
      );
      ok(headerSlot);
      ok(headerSlot.fragment.includes('Dialog Title'));

      const contentSlot = webComponent.slots.find(
        (slot) => slot.name === 'content',
      );
      ok(contentSlot);
      ok(contentSlot.fragment.includes('Dialog content goes here'));

      const footerSlot = webComponent.slots.find(
        (slot) => slot.name === 'footer',
      );
      ok(footerSlot);
      ok(footerSlot.fragment.includes('Cancel'));
    });

    it('should extract slots with dynamic slot names', async () => {
      const template = `
<template>
  <test-tabs>
    <div :slot="'tab-' + tabId">Tab content</div>
  </test-tabs>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-tabs',
      );
      ok(webComponent, 'Should find test-tabs component');
      strictEqual(webComponent.slots.length, 1);

      const dynamicSlot = webComponent.slots[0];
      // Vue analyzer falls back to 'default' when it can't resolve dynamic slot name
      strictEqual(dynamicSlot.name, 'default');
      ok(dynamicSlot.fragment.includes('Tab content'));
    });
  });

  describe('Slots using Vue-specific syntax', () => {
    it('should extract content with v-slot directive', async () => {
      const template = `
<template>
  <test-layout>
    <template v-slot:header>
      <h1>Page Title</h1>
    </template>
    <template v-slot:default>
      <p>Main content</p>
    </template>
    <template v-slot:footer>
      <footer>Footer content</footer>
    </template>
  </test-layout>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-layout',
      );
      ok(webComponent, 'Should find test-layout component');
      strictEqual(webComponent.slots.length, 3);
    });

    it('should extract content with v-slot shorthand syntax', async () => {
      const template = `
<template>
  <test-tabs>
    <template #header>
      <h2>Tab Header</h2>
    </template>
    <template #content="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </test-tabs>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-tabs',
      );
      ok(webComponent, 'Should find test-tabs component');
      strictEqual(webComponent.slots.length, 2);
    });

    it('should extract conditional slot content with v-if', async () => {
      const template = `
<template>
  <test-modal>
    <div v-if="showHeader" slot="header">
      Modal Header
    </div>
    <div v-if="showFooter" slot="footer">
      Modal Footer
    </div>
  </test-modal>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-modal',
      );
      ok(webComponent, 'Should find test-modal component');
      strictEqual(webComponent.slots.length, 2);

      const headerSlot = webComponent.slots.find(
        (slot) => slot.name === 'header',
      );
      ok(headerSlot);
      ok(headerSlot.fragment.includes('Modal Header'));

      const footerSlot = webComponent.slots.find(
        (slot) => slot.name === 'footer',
      );
      ok(footerSlot);
      ok(footerSlot.fragment.includes('Modal Footer'));
    });

    it('should extract iterative slot content with v-for', async () => {
      const template = `
<template>
  <test-list>
    <div v-for="item in items" :key="item.id" slot="item">
      {{ item.name }}
    </div>
  </test-list>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-list',
      );
      ok(webComponent, 'Should find test-list component');
      strictEqual(webComponent.slots.length, 1);

      const itemSlot = webComponent.slots.find((slot) => slot.name === 'item');
      ok(itemSlot);
      ok(itemSlot.fragment.includes('v-for'));
    });
  });

  describe('Complex scenarios', () => {
    it('should extract multiple components with mixed features', async () => {
      const template = `
<template>
  <test-header :title="pageTitle" fixed>
    <div slot="actions">
      <test-button variant="primary">Save</test-button>
    </div>
  </test-header>
  
  <test-main>
    <test-card :elevated="true">
      <h3 slot="title">Card Title</h3>
      <p>Card content</p>
    </test-card>
  </test-main>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for web components only
      const webComponents = result?.filter((comp) =>
        comp.component.startsWith('test-'),
      );
      ok(webComponents);
      strictEqual(webComponents.length, 4); // header, button, main, card

      // Check test-header
      const header = webComponents.find(
        (comp) => comp.component === 'test-header',
      );
      ok(header);
      strictEqual(header.attributes.length, 2);
      strictEqual(header.slots.length, 1);

      // Check nested test-button
      const button = webComponents.find(
        (comp) => comp.component === 'test-button',
      );
      ok(button);

      // Check test-card
      const card = webComponents.find((comp) => comp.component === 'test-card');
      ok(card);
      strictEqual(card.slots.length, 2); // title slot + default content
    });

    it('should handle empty components', async () => {
      const template = `
<template>
  <test-divider />
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-divider');
      strictEqual(result[0].attributes.length, 0);
      strictEqual(result[0].slots.length, 0);
    });

    it('should extract line numbers correctly', async () => {
      const template = `
<template>
  <div>
    <test-button>Test</test-button>
  </div>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-button',
      );
      ok(webComponent, 'Should find test-button component');
      strictEqual(webComponent.lines.start, 4);
      strictEqual(webComponent.lines.end, 4);
    });
  });

  describe('Vue SFC with script and style', () => {
    it('should extract components from complete SFC file', async () => {
      const template = `
<script setup>
import { ref } from 'vue'
const message = ref('Hello Vue!')
</script>

<template>
  <test-component :message="message" class="main">
    <div slot="header">Header content</div>
    <p>{{ message }}</p>
  </test-component>
</template>

<style scoped>
.main {
  color: blue;
}
</style>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-component');
      strictEqual(result[0].attributes.length, 2); // :message and class
      strictEqual(result[0].slots.length, 2); // header slot + default content

      const messageAttr = result[0].attributes.find(
        (attr) => attr.name === 'bind',
      );
      strictEqual(messageAttr?.value, 'message');
      strictEqual(messageAttr?.computed, true);

      const classAttr = result[0].attributes.find(
        (attr) => attr.name === 'class',
      );
      strictEqual(classAttr?.value, 'main');
      strictEqual(classAttr?.computed, false);
    });

    it('should handle Vue components with events and directives', async () => {
      const template = `
<template>
  <test-form @submit="handleSubmit" v-loading="isLoading">
    <test-input
      v-model="formData.name"
      :placeholder="nameLabel"
      @input="validateName"
      slot="name-field"
    />
    <test-button
      :disabled="!isValid"
      type="submit"
      variant="primary"
    >
      Submit
    </test-button>
  </test-form>
</template>
      `;

      const result = analyzeCode(template, vueAnalyzer);

      // Filter for web components only
      const webComponents = result?.filter((comp) =>
        comp.component.startsWith('test-'),
      );
      ok(webComponents);
      strictEqual(webComponents.length, 3); // form, input, button

      // Check test-form
      const form = webComponents.find((comp) => comp.component === 'test-form');
      ok(form);
      ok(form.attributes.length > 0); // Should have @submit and v-loading

      // Check test-input
      const input = webComponents.find(
        (comp) => comp.component === 'test-input',
      );
      ok(input);
      ok(input.attributes.length > 0); // Should have v-model, :placeholder, @input

      // Check test-button
      const button = webComponents.find(
        (comp) => comp.component === 'test-button',
      );
      ok(button);
      ok(button.attributes.length > 0); // Should have :disabled, type, variant
    });
  });
});
