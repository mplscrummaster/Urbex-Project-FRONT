<script setup>
import { useUsersStore } from '@/stores/users'
const storeUsers = useUsersStore()
</script>

<template>
  <div class="navbar home-bar" :class="{ hidden: storeUsers.currentIdUser }">
    <RouterLink v-if="!storeUsers.currentIdUser" to="/login">Login</RouterLink>
<<<<<<< HEAD
    <RouterLink v-if="!storeUsers.currentIdUser" to="/inscrire">Inscrire</RouterLink>
    <RouterLink to="/" v-else @click="storeUsers.currentIdUser = null"> Se déconnecter </RouterLink>
  </div>
</template>

<style scoped>
=======
    <RouterLink v-if="!storeUsers.currentIdUser" to="/register">Inscrire</RouterLink>
  </div>
</template>

<style lang="scss" scoped>
>>>>>>> 9e1ffe85685f73fd35a6760a8ead893b3f626712
.home-bar {
  position: fixed;
  top: 0;
  width: 100%;
}
</style>
