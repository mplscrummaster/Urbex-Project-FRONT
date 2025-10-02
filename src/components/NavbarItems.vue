<script setup>
  import { useUsersStore } from '@/stores/users'
  const storeUsers = useUsersStore()
  const decconectUser = () => {
    storeUsers.tokenUser = null
    localStorage.clear()
  }
</script>

<template>
  <div class="navbar home-bar">
    <RouterLink v-if="!storeUsers.tokenUser" to="/login">Login</RouterLink>
    <RouterLink v-if="!storeUsers.tokenUser" to="/register">Inscrire</RouterLink>
    <RouterLink to="/" v-else @click="decconectUser"> Se déconnecter
    </RouterLink>
  </div>
</template>

<style scoped>
  .home-bar {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 10000;

  }

  .hidden {
    display: none;
  }
</style>
