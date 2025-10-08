<script setup>
  import { useUsersStore } from '@/stores/users'
  import { onMounted, ref } from 'vue'
  import LeaderboardUser from './LeaderboardUserItem.vue'

  const usersStore = useUsersStore()

  let friendsArray = ref(null)

  onMounted(async () => {
    //je récup les amis
    let data = await usersStore.getAllFriends()
    //Je me récupère moi
    const me = await usersStore.getMeInfo();

    data = [...data, me];
    console.log("friends", data);
    console.log("me", me);

    //Tri decroissant des utilisateur en fonction du score
    friendsArray.value = data.sort((a, b) => b.score - a.score)
  })
</script>

<template>
  <div v-for="(user, key) in friendsArray" :key="key">
    <LeaderboardUser :user="user" :id="key" />
  </div>
</template>

<style scoped lang="scss"></style>
