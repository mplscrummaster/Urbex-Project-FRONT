<script setup></script>

<template>
  <div class="navbar user-bar">
    <RouterLink active-class="active" to="/scenario">Scenario</RouterLink>
    <RouterLink active-class="active" to="/globalmap">Map</RouterLink>
    <RouterLink active-class="active" to="/currentmap">Current</RouterLink>
    <RouterLink active-class="active" to="/leaderboard">Leaderboard</RouterLink>
    <RouterLink active-class="active" to="/userProfile">User</RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.user-bar {
  width: 100%;
  position: fixed;
  bottom: 0;
}

.active {
  color: red;
  border: 2px solid red;
}
</style>
