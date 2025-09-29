<script setup></script>

<template>
  <div class="navbar user-bar">
    <RouterLink to="/scenario">Scenario</RouterLink>
    <RouterLink to="/globalmap">Map</RouterLink>
    <RouterLink to="/currentmission">Current</RouterLink>
    <RouterLink to="/leaderboard">Leaderboard</RouterLink>
    <RouterLink to="/userProfile">User</RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.user-bar {
  width: 100%;
}
</style>
