<template>
  <div class="navbar leader-bar">
    <RouterLink active-class="active" :to="{ name: 'leaderboard-global' }">Global</RouterLink>
    <RouterLink active-class="active" :to="{ name: 'leaderboard-friends' }">Amis</RouterLink>
  </div>

</template>

<style lang="scss" scoped>
  @use '@/styles/abstracts' as *;

  .leader-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
  }

  .leader-bar :deep(a) {
    color: $color-text-dim;
    text-decoration: none;
    padding: 8px 14px;
    border-radius: $radius-md;
    position: relative;
    transition: color $transition, background $transition;
  }

  .leader-bar :deep(a:hover) {
    color: $color-text;
    background: rgba(255, 255, 255, .06);
  }

  .leader-bar :deep(a.active) {
    color: $color-text;
    background: $color-accent-soft;
  }

  .leader-bar :deep(a.active)::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 6px;
    height: 2px;
    border-radius: 2px;
    background: $color-accent;
  }
</style>
