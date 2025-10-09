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
    height: 100dvh;
    position: relative;
    overflow-y: auto; // active le scroll vertical
    overflow-x: hidden;
    padding-bottom: var(--tabbar-height, 150px);
  }
</style>