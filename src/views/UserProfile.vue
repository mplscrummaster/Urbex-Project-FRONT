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
  .profile {
    padding: 2rem;
    color: white;

    &__header {
      display: flex;
      align-items: center;
    }

    &__title {
      font-size: 2.5rem;
      text-align: center;
      width: 100%;
    }

    &__settings_icon {
      width: 8vw;
      align-self: center;
      cursor: pointer;
    }

    &__actions {
      display: flex;
      justify-content: center;
      margin-top: 1.25rem;
    }
    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      background: rgba(239,68,68,.15);
      color: #fecaca;
      border: 1px solid rgba(239,68,68,.35);
      padding: .6rem .9rem;
      border-radius: 10px;
      cursor: pointer;
      transition: background .25s, border-color .25s;
    }
    .btn-logout:hover { background: rgba(239,68,68,.22); border-color: rgba(239,68,68,.55); }
  }
</style>
