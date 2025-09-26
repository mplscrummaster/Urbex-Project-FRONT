<script setup>
import { useUsersStore } from '@/stores/users';
const storeUsers = useUsersStore();
</script>

<template>
  <div class="navbar home-bar">
    <RouterLink v-if="!storeUsers.currentIdUser" to="/">Home</RouterLink>
    <RouterLink v-if="!storeUsers.currentIdUser" to="/login">Login</RouterLink>
    <RouterLink v-if="!storeUsers.currentIdUser" to="/inscrire">Inscrire</RouterLink>
    <RouterLink to="/" v-else @click="storeUsers.currentIdUser = null">
      Se déconnecter
    </RouterLink>
  </div>

</template>
