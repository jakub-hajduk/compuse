import { strictEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';
import { analyzeCode } from '../../engine/analyze-code';
import { angularAnalyzer } from './angular.analyzer';

describe('Angular analyzer', () => {
  describe('Web components with explicit props', () => {
    it('should extract component with static string attributes', async () => {
      const template =
        '<test-button variant="primary" size="large">Click me</test-button>';

      const result = await analyzeCode(template, angularAnalyzer);

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
      const template =
        '<test-input disabled required readonly>Input field</test-input>';

      const result = await analyzeCode(template, angularAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-input');
      strictEqual(result[0].attributes.length, 3);

      const disabledAttr = result[0].attributes.find(
        (attr) => attr.name === 'disabled',
      );
      strictEqual(disabledAttr?.value, '');
      strictEqual(disabledAttr?.computed, false);
    });
  });

  describe('Web components with dynamically bound props', () => {
    it('should extract component with property binding', async () => {
      const template =
        '<test-button [variant]="buttonVariant" [disabled]="isDisabled">Submit</test-button>';

      const result = await analyzeCode(template, angularAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-button');
      strictEqual(result[0].attributes.length, 2);

      const variantAttr = result[0].attributes.find(
        (attr) => attr.name === 'variant',
      );
      strictEqual(variantAttr?.value, 'buttonVariant');
      strictEqual(variantAttr?.computed, true);

      const disabledAttr = result[0].attributes.find(
        (attr) => attr.name === 'disabled',
      );
      strictEqual(disabledAttr?.value, 'isDisabled');
      strictEqual(disabledAttr?.computed, true);
    });

    it('should extract component with complex expressions', async () => {
      const template =
        '<test-badge [count]="items.length + 1" [visible]="items.length > 0">Badge</test-badge>';

      const result = await analyzeCode(template, angularAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-badge');
      strictEqual(result[0].attributes.length, 2);

      const countAttr = result[0].attributes.find(
        (attr) => attr.name === 'count',
      );
      strictEqual(countAttr?.value, 'items.length + 1');
      strictEqual(countAttr?.computed, true);

      const visibleAttr = result[0].attributes.find(
        (attr) => attr.name === 'visible',
      );
      strictEqual(visibleAttr?.value, 'items.length > 0');
      strictEqual(visibleAttr?.computed, true);
    });

    it('should extract component with mixed static and dynamic attributes', async () => {
      const template =
        '<test-card variant="outlined" [elevated]="isElevated" size="medium">Content</test-card>';

      const result = await analyzeCode(template, angularAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-card');
      strictEqual(result[0].attributes.length, 3);

      const variantAttr = result[0].attributes.find(
        (attr) => attr.name === 'variant',
      );
      strictEqual(variantAttr?.value, 'outlined');
      strictEqual(variantAttr?.computed, false);

      const elevatedAttr = result[0].attributes.find(
        (attr) => attr.name === 'elevated',
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
      const template =
        '<test-card><div>This is default slot content</div></test-card>';

      const result = await analyzeCode(template, angularAnalyzer);

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
      const template =
        '<test-dialog><h2 slot="header">Dialog Title</h2><p slot="content">Dialog content goes here</p><div slot="footer"><button>Cancel</button><button>OK</button></div></test-dialog>';

      const result = await analyzeCode(template, angularAnalyzer);

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
      const template =
        '<test-tabs><div slot="tab-content">Tab content</div></test-tabs>';

      const result = await analyzeCode(template, angularAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-tabs',
      );
      ok(webComponent, 'Should find test-tabs component');
      strictEqual(webComponent.slots.length, 1);

      const dynamicSlot = webComponent.slots[0];
      strictEqual(dynamicSlot.name, 'tab-content');
      ok(dynamicSlot.fragment.includes('Tab content'));
    });
  });

  describe('Slots using Angular-specific syntax', () => {
    it('should extract content projection with ng-content', async () => {
      const template =
        '<test-wrapper><ng-content select="header"></ng-content><ng-content></ng-content></test-wrapper>';

      const result = await analyzeCode(template, angularAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-wrapper',
      );
      ok(webComponent, 'Should find test-wrapper component');
      strictEqual(webComponent.slots.length, 2);
    });

    it('should extract content with Angular structural directives', async () => {
      const template =
        '<test-list><div class="ngfor-item" slot="item">{{ item.name }}</div></test-list>';

      const result = await analyzeCode(template, angularAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-list',
      );
      ok(webComponent, 'Should find test-list component');
      strictEqual(webComponent.slots.length, 1);

      const itemSlot = webComponent.slots.find((slot) => slot.name === 'item');
      ok(itemSlot);
      ok(itemSlot.fragment.includes('ngfor-item'));
    });

    it('should extract conditional slot content', async () => {
      const template =
        '<test-modal><div class="header-content" slot="header">Modal Header</div><div class="footer-content" slot="footer">Modal Footer</div></test-modal>';

      const result = await analyzeCode(template, angularAnalyzer);

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
      ok(headerSlot.fragment.includes('header-content'));

      const footerSlot = webComponent.slots.find(
        (slot) => slot.name === 'footer',
      );
      ok(footerSlot);
      ok(footerSlot.fragment.includes('footer-content'));
    });
  });

  describe('Complex scenarios', () => {
    it('should extract multiple components with mixed features', async () => {
      const template =
        '<test-header title="pageTitle" fixed><div slot="actions"><test-button variant="primary">Save</test-button></div></test-header><test-main><test-card [elevated]="true"><h3 slot="title">Card Title</h3><p>Card content</p></test-card></test-main>';

      const result = await analyzeCode(template, angularAnalyzer);

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
      const template = '<test-divider></test-divider>';

      const result = await analyzeCode(template, angularAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-divider');
      strictEqual(result[0].attributes.length, 0);
      strictEqual(result[0].slots.length, 0);
    });

    it('should extract line numbers correctly', async () => {
      const template = '<div>\n<test-button>Test</test-button>\n</div>';

      const result = await analyzeCode(template, angularAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'test-button',
      );
      ok(webComponent, 'Should find test-button component');
      // Angular parser counts lines starting from 1, not 0
      strictEqual(webComponent.lines.start, 1);
      strictEqual(webComponent.lines.end, 1);
    });
  });

  describe('Component file extraction', () => {
    it('should extract template from Angular component file', async () => {
      const componentCode = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: \`
    <test-button [disabled]="isDisabled">
      Click me
    </test-button>
  \`,
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  isDisabled = false;
}
      `;

      const result = await analyzeCode(componentCode, angularAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'test-button');
      strictEqual(result[0].attributes.length, 1);

      const disabledAttr = result[0].attributes.find(
        (attr) => attr.name === 'disabled',
      );
      strictEqual(disabledAttr?.value, 'isDisabled');
      strictEqual(disabledAttr?.computed, true);
    });
  });
});
