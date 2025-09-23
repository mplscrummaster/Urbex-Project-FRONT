<script setup>
import { useUsersStore } from '@/stores/users';
const storeUsers = useUsersStore();
</script>

<template>
  <div class="navbar">
    <div v-if="!storeUsers.currentIdUser">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/inscrire">Inscrire</RouterLink>
    </div>
    <RouterLink to="/" v-else @click="storeUsers.currentIdUser = null">
      Se déconnecter
    </RouterLink>
  </div>

</template>

<style lang="scss" scoped>
.navbar>* {
  display: flex;
  gap: 1rem;
}
</style>
