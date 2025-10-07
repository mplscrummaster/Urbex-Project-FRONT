<script setup>
import BarUserNavigation from './components/NavbarUserNavigation.vue'
import { useUsersStore } from '@/stores/users'
import '/src/assets/main.scss'
const storeUsers = useUsersStore()
/*  import { useBaseStore } from "./stores/base.js";
  import { ref } from "vue";
 
  const baseStore = useBaseStore();
  const title = ref('App');
 
const count = () => {
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
    <BarUserNavigation v-show="storeUsers.tokenUser != null" />
  </main>
</template>

<style lang="scss">
@use '@/styles/theme.scss' as *;

body {
  margin: 0;
}

main {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* per-view spacing: handled inside each view to avoid global margins */

.navbar {
  background: $color-surface;
  color: $color-text;
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
  border-radius: $radius-md;
  background-color: $color-surface-alt;

  &:hover {
    transition: $transition;
    color: $color-accent;
    box-shadow: 0 0 0 1px $color-accent;
  }
}

.hidden {
  display: none;
}
</style>
