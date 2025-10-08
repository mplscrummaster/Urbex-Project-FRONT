<script setup>
  import LeaderboardUser from './LeaderboardUserItem.vue'
  const friends = Array.from({ length: 5 }, (_, i) => ({
    nickname: `Joueur ${i + 1}`,
    url_img_avatar: '/urbex-front/public/img/profile-placeholder.png',
    score: 200 - i * 7,
  }))
</script>

<template>
  <div v-for="(user, key) in friends" :key="key">
    <LeaderboardUser :user="user" :id="key" class="friend" />
  </div>
</template>

<style scoped lang="scss"></style>
