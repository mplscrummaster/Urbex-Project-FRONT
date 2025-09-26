<script setup>
  import NavbarItems from './components/NavbarItems.vue'
  import BarUserNavigation from './components/BarUserNavigation.vue'
  import { useUsersStore } from '@/stores/users'
  const storeUsers = useUsersStore()
  /*  import { useBaseStore } from "./stores/base.js";
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
  */
</script>

<template>
  <main>
    <NavbarItems />
    <RouterView />
    <BarUserNavigation v-show="storeUsers.currentIdUser != null" />
    <!--
    <button @click.prevent=count>{{ baseStore.getCounter }}</button>

    <label for="">Modifier le titre (a chaque changement)</label>
    <input type="text" @input=modifyTitle>

    <label for="">Modifier le titre (a chaque perte de focus)</label>
    <input type="text" @change=modifyTitle>-->
  </main>
</template>

<style>
  main {
    display: flex;
    flex-direction: column;
  }

  body {
    margin: 0;
    background-color: #2b2b2b;
  }
</style>
