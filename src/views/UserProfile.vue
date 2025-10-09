<script setup>
  import UserProfileCard from '@/components/UserProfileCard.vue'
  import { useRouter } from 'vue-router'
  import { useUsersStore } from '@/stores/users'
  const router = useRouter()
  const users = useUsersStore()

  if (localStorage.getItem("tokenUser") === null) router.replace("/")

  const logout = () => {
    try { users.logout() } finally { router.replace('/') }
  }

</script>

<template>
  <header class="profile with-tabbar-padding">
    <div class="profile__header">
      <h1 class="profile__title">Mon Profil</h1>
    </div>
    <UserProfileCard />
    <div class="profile__actions">
      <button type="button" class="btn-logout" @click="logout">
        <span class="material-symbols-outlined">logout</span>
        Se déconnecter
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
  .p-profile {
    position: relative;
    height: 100dvh; // conteneur plein viewport
    overflow-y: auto; // active le scroll vertical
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--tabbar-height, 72px); // pour éviter que la TabBar masque le bas
  }
</style>
