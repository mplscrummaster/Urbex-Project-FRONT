<script setup>
  import NavbarItems from './components/NavbarItems.vue';
  import { useBaseStore } from "./stores/base.js";
  import { ref } from "vue";

  const baseStore = useBaseStore();
  const title = ref('App');

  const count = () => {
    console.log("count")
    baseStore.incrementCounter();
  }

  const modifyTitle = (event) => {
    title.value = event.target.value;
  }

</script>

<template>
  <main>
    <h1>{{ title }}</h1>
    <NavbarItems />
    <RouterView />

    <button @click.prevent=count>{{ baseStore.getCounter }}</button>

    <label for="">Modifier le titre (a chaque changement)</label>
    <input type="text" @input=modifyTitle>

    <label for="">Modifier le titre (a chaque perte de focus)</label>
    <input type="text" @change=modifyTitle>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    flex-direction: column;
  }
</style>
