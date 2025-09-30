<template>
  <div class="navbar leader-bar">
    <RouterLink active-class="active" to="/LeaderboardGlobal">Global</RouterLink>
    <RouterLink active-class="active" to="/LeaderboardWeeks">Semaine</RouterLink>
    <RouterLink active-class="active" to="/LeaderboardFriends">Amies</RouterLink>
  </div>

</template>

<style scoped>
.active {
  color: red;
}
</style>
