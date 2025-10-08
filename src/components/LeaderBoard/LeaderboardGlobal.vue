<script setup>
  import { useUsersStore } from '@/stores/users'
  import { onMounted, ref } from 'vue'
  import LeaderboardUser from './LeaderboardUserItem.vue'

  const usersStore = useUsersStore()

  let usersArray = ref(null)

  onMounted(async () => {
    const data = await usersStore.getAllUsers()
    //Tri decroissant des utilisateur en fonction du score
    usersArray.value = data.sort((a, b) => b.score - a.score)
  })
</script>

<template>
  <div v-for="(user, key) in usersArray" :key="key">
    <LeaderboardUser :user="user" :id="key" />
  </div>
</template>

<style scoped lang="scss"></style>
