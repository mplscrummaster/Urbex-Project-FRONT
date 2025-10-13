<script setup>
import { useUsersStore } from '@/stores/users'
import { onMounted, ref } from 'vue'
import LeaderboardUserItem from './LeaderboardUserItem.vue'

const usersStore = useUsersStore()

const friendsArray = ref(null)
const meId = ref(null)

onMounted(async () => {
  //je récup les amis
  let data = await usersStore.getAllFriends()
  //Je me récupère moi
  const me = await usersStore.getMeInfo();

  console.log("friends", data);

  //Ajout de mes infos dans le tableau
  //(on ne récupère pas les infos du current user dans getAllFriends, donc on l'ajoute )
  data = [...data, me]
  //Tri decroissant des utilisateur en fonction du score
  friendsArray.value = data.sort((a, b) => b.score - a.score)
})
</script>

<template>
  <div v-for="(user, key) in friendsArray" :key="key">
    <LeaderboardUserItem :user="user" :id="key" />
  </div>
</template>

<style scoped lang="scss"></style>
