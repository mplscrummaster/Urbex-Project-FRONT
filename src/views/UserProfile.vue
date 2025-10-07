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

