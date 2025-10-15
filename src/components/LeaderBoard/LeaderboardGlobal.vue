<script setup>
  import { useUsersStore } from '@/stores/users'
  import { onMounted, ref } from 'vue'
  import LeaderboardUserItem from './LeaderboardUserItem.vue'

  const usersStore = useUsersStore()

  const usersArray = ref(null)

  onMounted(async () => {
    const data = await usersStore.getAllUsers()
    const me = await usersStore.getMeInfo()

    //Tri decroissant des utilisateur en fonction du score
    usersArray.value = data.sort((a, b) => b.score - a.score)

    //==
    // Modification de notre user dans le tableau pour matcher la structure du friends
    // ==

    console.log("usersArray", usersArray.value);
    //Je cherche le me dans le tableau
    const meInArray = usersArray.value.find(user => user.id === me.id)
    const meInArrayIndex = usersArray.value.indexOf(meInArray)
    //Je remplace l'objet de mon "me" par l'objet de getMeInfo (structure différente)
    usersArray.value[meInArrayIndex] = me;
    //Pour fonctionner avec le leaderboardUserItem, je dois changer la structure de mon user
    //Voir dans leaderboardUserItem le fonctionnement

  })
</script>

<template>

  <div v-for="(user, key) in usersArray" :key="key">
    <LeaderboardUserItem :user="user" :id="key" />
  </div>
</template>

<style scoped lang="scss"></style>
