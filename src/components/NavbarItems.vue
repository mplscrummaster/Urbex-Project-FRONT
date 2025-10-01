<script setup>
import { useUsersStore } from '@/stores/users'
const storeUsers = useUsersStore()
</script>

<template>
  <div class="navbar home-bar" v-if="!storeUsers.isAuthenticated">
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink to="/register">Inscrire</RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.home-bar {
  position: fixed;
  top: 0;
  width: 100%;
}
</style>
