<script setup>
import { useUsersStore } from '@/stores/users'
const storeUsers = useUsersStore()
const decconectUser = () => {
  storeUsers.token = null
  localStorage.clear()
}
</script>

<template>
  <div class="navbar home-bar">
    <RouterLink v-if="!storeUsers.token" to="/login">Login</RouterLink>
    <RouterLink v-if="!storeUsers.token" to="/register">Inscrire</RouterLink>
    <RouterLink to="/" v-else @click="decconectUser"> Se déconnecter
    </RouterLink>
  </div>
</template>

<style scoped>
.home-bar {
  position: fixed;
  top: 0;
  width: 100%;
}

.hidden {
  display: none;
}
</style>
