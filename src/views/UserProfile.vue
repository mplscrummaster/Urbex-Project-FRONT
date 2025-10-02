<script setup>
  import UserProfileCard from '@/components/UserProfileCard.vue'
  import { useRouter } from 'vue-router'
  const router = useRouter()

  if (localStorage.getItem("tokenUser") === null)
    router.replace("/")

</script>

<template>
  <header class="profile">
    <div class="profile__header">
      <h1 class="profile__title">Mon Profil</h1>
    </div>
    <UserProfileCard />
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
  }
</style>
