<script setup>
  import NavbarLeaderBoard from '@/components/NavbarLeaderBoard.vue'

</script>

<template>

  <NavbarLeaderBoard />
  <div class="leaderboard-list">
    <RouterView />
  </div>
</template>
<style lang="scss" scoped>
  @use '@/styles/abstracts' as *;

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 2rem;
    width: 100%;
  }
</style>