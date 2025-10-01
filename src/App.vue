<script setup>
import NavbarItems from './components/NavbarItems.vue'
import BarUserNavigation from './components/NavbarUserNavigation.vue'
import { useUsersStore } from '@/stores/users'
import '/src/assets/main.scss'
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
    <RouterView class="content" />
    <BarUserNavigation v-show="storeUsers.currentIdUser != null" />
    <!--
    <button @click.prevent=count>{{ baseStore.getCounter }}</button>

    <label for="">Modifier le titre (a chaque changement)</label>
    <input type="text" @input=modifyTitle>

    <label for="">Modifier le titre (a chaque perte de focus)</label>
    <input type="text" @change=modifyTitle>-->
  </main>
</template>

<<<<<<< HEAD
<style lang="scss"></style>
=======
<style lang="scss">
body {
  margin: 0;
  background-color: #2b2b2b;
}
main {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.content {
  padding-inline: 2rem;
}

.navbar {
  background: #222;
  color: #fff;
  padding-block: 12px;
  font-size: 18px;
  display: flex;
  gap: 1rem;
  justify-content: space-around;
}

.navbar a {
  all: unset;
  color: inherit;
  cursor: pointer;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 1rem;
  background-color: #2b2b2b;

  &:hover {
    transition: 0.3s all;
    color: #0000ca;
    box-shadow: 0 0 0 1px #0000ca;
  }
}

.hidden {
  display: none;
}
</style>
>>>>>>> 9e1ffe85685f73fd35a6760a8ead893b3f626712
