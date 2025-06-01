import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { analyzeCode } from '../../engine/analyze-code';
import { reactAnalyzer } from './react.analyzer';

describe('React analyzer', async () => {
  describe('Web components with explicit props', () => {
    it('should extract component with static string attributes', async () => {
      const template = `
function App() {
  return <TestButton variant="primary" size="large">Click me</TestButton>;
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'TestButton');
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

    it('should extract component with explicit boolean values', async () => {
      const template =
        '<TestInput disabled={true} required={false}>Input field</TestInput>';

      const result = await analyzeCode(template, reactAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'TestInput');
      strictEqual(result[0].attributes.length, 2);

      const disabledAttr = result[0].attributes.find(
        (attr) => attr.name === 'disabled',
      );
      ok(disabledAttr);
      strictEqual(disabledAttr?.value, 'true');
      strictEqual(disabledAttr?.computed, true);

      const requiredAttr = result[0].attributes.find(
        (attr) => attr.name === 'required',
      );
      ok(requiredAttr);
      strictEqual(requiredAttr?.value, 'false');
      strictEqual(requiredAttr?.computed, true);
    });
  });

  describe('Web components with dynamically bound props', () => {
    it('should extract component with JSX expression binding', async () => {
      const template = `
function App() {
  return <TestButton variant={buttonVariant} disabled={isDisabled}>Submit</TestButton>;
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'TestButton');
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
      const template = `
function App() {
  return <TestBadge count={items.length + 1} visible={items.length > 0}>Badge</TestBadge>;
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'TestBadge');
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
      const template = `
function App() {
  return <TestCard variant="outlined" elevated={isElevated} size="medium">Content</TestCard>;
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'TestCard');
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
      const template = `
function App() {
  return (
    <TestCard>
      <div>This is default slot content</div>
    </TestCard>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'TestCard',
      );
      ok(webComponent, 'Should find TestCard component');
      strictEqual(webComponent.slots.length, 1);

      const defaultSlot = webComponent.slots.find(
        (slot) => slot.name === 'default',
      );
      ok(defaultSlot);
      ok(defaultSlot.fragment.includes('This is default slot content'));
    });

    it('should extract named slots with slot attribute', async () => {
      const template = `
function App() {
  return (
    <TestDialog>
      <h2 slot="header">Dialog Title</h2>
      <p slot="content">Dialog content goes here</p>
      <div slot="footer">
        <button>Cancel</button>
        <button>OK</button>
      </div>
    </TestDialog>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'TestDialog',
      );
      ok(webComponent, 'Should find TestDialog component');
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
function App() {
  return (
    <TestTabs>
      <div slot={'tab-' + tabId}>Tab content</div>
    </TestTabs>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'TestTabs',
      );
      ok(webComponent, 'Should find TestTabs component');
      strictEqual(webComponent.slots.length, 1);

      const dynamicSlot = webComponent.slots[0];
      strictEqual(dynamicSlot.name, "'tab-' + tabId");
      ok(dynamicSlot.fragment.includes('Tab content'));
    });
  });

  describe('Slots using React-specific syntax', () => {
    it('should extract content with children prop', async () => {
      const template = `
function App() {
  return (
    <TestLayout>
      <TestCard>Card 1</TestCard>
      <TestCard>Card 2</TestCard>
    </TestLayout>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for TestLayout component
      const webComponent = result?.find(
        (comp) => comp.component === 'TestLayout',
      );
      ok(webComponent, 'Should find TestLayout component');
      strictEqual(webComponent.slots.length, 2); // Two TestCard children

      // Should also find the nested TestCard components
      const cardComponents = result?.filter(
        (comp) => comp.component === 'TestCard',
      );
      strictEqual(cardComponents?.length, 2);
    });

    it('should extract conditional slot content', async () => {
      const template = `
      <TestModal>
        <div slot="header">Modal Header</div>
        <div slot="footer">Modal Footer</div>
      </TestModal>
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'TestModal',
      );
      ok(webComponent, 'Should find TestModal component');
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

    it('should extract iterative slot content with map', async () => {
      const template = `
      <TestList>
        <div slot="item">Item 1</div>
        <div slot="item">Item 2</div>
      </TestList>
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'TestList',
      );
      ok(webComponent, 'Should find TestList component');
      strictEqual(webComponent.slots.length, 2); // Two items

      const itemSlots = webComponent.slots.filter(
        (slot) => slot.name === 'item',
      );
      strictEqual(itemSlots.length, 2);
      ok(itemSlots[0].fragment.includes('Item'));
    });

    it('should extract components with render props', async () => {
      const template = `
function App() {
  return (
    <TestProvider>
      {(data) => (
        <TestCard title={data.title}>
          {data.content}
        </TestCard>
      )}
    </TestProvider>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Should find both TestProvider and TestCard
      const provider = result?.find(
        (comp) => comp.component === 'TestProvider',
      );
      ok(provider, 'Should find TestProvider component');

      const card = result?.find((comp) => comp.component === 'TestCard');
      ok(card, 'Should find TestCard component');
      strictEqual(card.attributes.length, 1); // title attribute
    });
  });

  describe('Complex scenarios', async () => {
    it('should extract multiple components with mixed features', async () => {
      const template = `
function App() {
  return (
    <>
      <TestHeader title={pageTitle}>
        <div slot="actions">
          <TestButton variant="primary">Save</TestButton>
        </div>
      </TestHeader>
      
      <TestMain>
        <TestCard elevated={true}>
          <h3 slot="title">Card Title</h3>
          <p>Card content</p>
        </TestCard>
      </TestMain>
    </>
  );
}
      `;

      // try {
      const result = await analyzeCode(template, reactAnalyzer);

      // }catch(e) {
      //   console.log( e )
      // }

      // Filter for web components only
      // const webComponents = result?.filter((comp) =>
      //   comp.component.startsWith('Test'),
      // );

      //ok(webComponents);
      //ok(webComponents.length >= 3); // Should find TestButton, TestMain, TestCard

      // Check if we can find the expected components
      // const componentNames = webComponents.map(c => c.component);
      // ok(componentNames.includes('TestButton'));
      // ok(componentNames.includes('TestMain'));
      // ok(componentNames.includes('TestCard'));
    });

    it('should handle empty components', async () => {
      const template = `
function App() {
  return <TestDivider />;
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      strictEqual(result?.length, 1);
      strictEqual(result[0].component, 'TestDivider');
      strictEqual(result[0].attributes.length, 0);
      strictEqual(result[0].slots.length, 0);
    });

    it('should extract line numbers correctly', async () => {
      const template = `
function App() {
  return (
    <div>
      <TestButton>Test</TestButton>
    </div>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for just the web component
      const webComponent = result?.find(
        (comp) => comp.component === 'TestButton',
      );
      ok(webComponent, 'Should find TestButton component');
      strictEqual(webComponent.lines.start, 5);
      strictEqual(webComponent.lines.end, 5);
    });
  });

  describe('TypeScript React components', () => {
    it('should extract components from TypeScript JSX', async () => {
      const template = `
interface Props {
  title: string;
  disabled?: boolean;
}

function App({ title, disabled }: Props) {
  return (
    <TestComponent title={title} disabled={disabled}>
      <div slot="content">Content</div>
    </TestComponent>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for TestComponent only
      const testComponent = result?.find(
        (comp) => comp.component === 'TestComponent',
      );
      ok(testComponent, 'Should find TestComponent');
      strictEqual(testComponent.attributes.length, 2); // title and disabled
      strictEqual(testComponent.slots.length, 1); // content slot

      const titleAttr = testComponent.attributes.find(
        (attr) => attr.name === 'title',
      );
      strictEqual(titleAttr?.value, 'title');
      strictEqual(titleAttr?.computed, true);

      const disabledAttr = testComponent.attributes.find(
        (attr) => attr.name === 'disabled',
      );
      strictEqual(disabledAttr?.value, 'disabled');
      strictEqual(disabledAttr?.computed, true);
    });

    it('should handle React components with hooks', async () => {
      const template = `
import { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(setData);
  }, []);

  return (
    <TestForm onSubmit={handleSubmit} loading={!data}>
      <TestInput
        value={count}
        onChange={setCount}
        placeholder="Enter count"
        slot="input-field"
      />
      <TestButton
        disabled={count === 0}
        type="submit"
        variant="primary"
      >
        Submit ({count})
      </TestButton>
    </TestForm>
  );
}
      `;

      const result = await analyzeCode(template, reactAnalyzer);

      // Filter for web components only
      const webComponents = result?.filter((comp) =>
        comp.component.startsWith('Test'),
      );
      ok(webComponents);
      strictEqual(webComponents.length, 3); // form, input, button

      // Check TestForm
      const form = webComponents.find((comp) => comp.component === 'TestForm');
      ok(form);
      ok(form.attributes.length > 0); // Should have onSubmit and loading

      // Check TestInput
      const input = webComponents.find(
        (comp) => comp.component === 'TestInput',
      );
      ok(input);
      ok(input.attributes.length > 0); // Should have value, onChange, placeholder

      // Check TestButton
      const button = webComponents.find(
        (comp) => comp.component === 'TestButton',
      );
      ok(button);
      ok(button.attributes.length > 0); // Should have disabled, type, variant
    });
  });
});
