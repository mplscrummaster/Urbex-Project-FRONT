<script setup>
  import { useUsersStore } from '@/stores/users'
  const storeUsers = useUsersStore()
  const decconectUser = () => {
    storeUsers.tokenUser = null
    localStorage.clear()
  }
</script>

<template>
<<<<<<< HEAD
  <div class="navbar home-bar" v-if="!storeUsers.isAuthenticated">
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink to="/register">Inscrire</RouterLink>
=======
  <div class="navbar home-bar">
    <RouterLink v-if="!storeUsers.tokenUser" to="/login">Login</RouterLink>
    <RouterLink v-if="!storeUsers.tokenUser" to="/register">Inscrire</RouterLink>
    <RouterLink to="/" v-else @click="decconectUser"> Se déconnecter
    </RouterLink>
>>>>>>> origin/dev
  </div>
</template>
<style lang="scss" scoped>
.home-bar {
  top: 0;
  position: fixed;
  height: 60px;
  background: rgba(15, 15, 15, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 30px;
  gap: 30px;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  a {
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 16px;
    letter-spacing: 2px;
    color: #f5f5f5;
    position: relative;
    text-decoration: none;
    transition: all 0.3s ease;

    &::after {
      content: "";
      left: 0;
      bottom: -4px;
      width: 100%;
      height: 2px;
      background: #1c7832;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    &:hover {
      color: #1c7832;
      text-shadow: 0 0 6px #1c7832, 0 0 12px #1c7832;

      &::after {
        transform: scaleX(1);
      }
    }
  }
}
</style>
