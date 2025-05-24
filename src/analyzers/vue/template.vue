<script setup>
import HelloWorld from './components/HelloWorld.vue';
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld :msg="'Vite + Vue' + 0" />

  <vwc-slotted-components></vwc-slotted-components>

  <vwc-named-slots>
    <span slot="title">Web components</span>
    <span slot="subtitle">Testing</span>
  </vwc-named-slots>

  <vwc-slotted>
    Hello there testing
  </vwc-slotted>

  <SlottedComponent>
    Default slot content
  </SlottedComponent>

  <NamedSlots>
    <template v-slot:title>Vue components</template>
    <template v-slot:subtitle>Testing</template>
    Something else
  </NamedSlots>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
