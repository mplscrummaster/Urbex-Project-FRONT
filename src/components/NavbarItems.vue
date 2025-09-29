<script setup>
import { useUsersStore } from '@/stores/users'
const storeUsers = useUsersStore()
</script>

<template>
  <div class="navbar home-bar" :class="{ hidden: storeUsers.currentIdUser }">
    <RouterLink v-if="!storeUsers.currentIdUser" to="/login">Login</RouterLink>
    <RouterLink v-if="!storeUsers.currentIdUser" to="/register">Inscrire</RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.home-bar {
  position: fixed;
  top: 0;
  width: 100%;
}
</style>
