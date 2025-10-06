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
    <!-- Spacer to prevent content from being hidden behind the fixed bottom user bar -->
    <div v-show="storeUsers.tokenUser != null" class="user-bar-spacer" aria-hidden="true"></div>
    <BarUserNavigation v-show="storeUsers.tokenUser != null" />
  </main>
</template>

<style lang="scss">
@use '@/styles/theme.scss' as *;

body { margin: 0; }

:root { --user-bar-h: 64px; }

main {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.user-bar-spacer { height: calc(var(--user-bar-h) + env(safe-area-inset-bottom)); }

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

.hidden { display: none; }
</style>
