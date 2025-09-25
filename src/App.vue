<script setup>
import NavbarItems from './components/NavbarItems.vue';
import BarUserNavigation from './components/BarUserNavigation.vue';
import { useUsersStore } from '@/stores/users';
const storeUsers = useUsersStore();
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
body {
  margin: 0;
}

main {
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #222;
  color: #fff;
  padding: 12px 24px;
  font-size: 18px;
  display: flex;
  gap: 1rem;
  left: 0;
  right: 0;
  justify-content: space-around;
}

.navbar a {
  all: unset;
  color: inherit;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: aquamarine;
  }

  /* Add any custom styles you want */
}

.home-bar {
  position: fixed;
  top: 0;
}

.user-bar {
  position: fixed;
  /* toujours visible */
  bottom: 0;
  /* collée en bas */
  padding: 1rem;
  z-index: 1000;
  /* au-dessus du contenu */
}
</style>
