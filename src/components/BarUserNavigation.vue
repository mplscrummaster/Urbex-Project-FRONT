<script setup>

</script>

<template>
  <div class="navbar">
    <RouterLink to="/scenario">Scenario</RouterLink>
    <RouterLink to="/globalmap">Map</RouterLink>
    <RouterLink to="/currentmission">Current</RouterLink>
    <RouterLink to="/leaderboard">Leaderboard</RouterLink>
    <RouterLink to="/user">User</RouterLink>
  </div>

</template>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  /* toujours visible */
  bottom: 0;
  /* collée en bas */
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  justify-content: space-around;
  color: white;
  z-index: 1000;
  /* au-dessus du contenu */
}
</style>