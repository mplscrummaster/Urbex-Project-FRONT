<script setup>
  import LeaderboardUser from './LeaderboardUserItem.vue'
  const week = Array.from({ length: 10 }, (_, i) => ({
    nickname: `Joueur ${i + 1}`,
    url_img_avatar: '/urbex-front/public/img/profile-placeholder.png',
    score: 200 - i * 7,
  }))
</script>

<template>

  <div v-for="(user, key) in week" :key="key">
    <LeaderboardUser :user="user" :id="key" />
  </div>
</template>

<style scoped lang="scss"></style>
