<script setup>
import UserProfileCard from '@/components/UserProfileCard.vue'
</script>

<template>
  <header>
    <div class="header">
      <h1>Mon Profil</h1>
      <img class="settings-icon" src="/icons/settings.svg" alt="params" />
    </div>
    <UserProfileCard />
  </header>
</template>

<style lang="scss" scoped>
header {
  padding: 2rem;
  color: white;

  .header {
    display: flex;
  }
}

h1 {
  font-size: 2.5rem;
  text-align: center;
  width: 100%;
}

.settings-icon {
  width: 8dvw;
  display: flex;
  align-self: center;

  &:hover {
    cursor: pointer;
  }
}
</style>
