<script setup>
  import UserProfileCard from '@/components/UserProfileCard.vue'
  import { useRouter } from 'vue-router'
  import { useUsersStore } from '@/stores/users'
  const router = useRouter()
  const users = useUsersStore()

  if (localStorage.getItem("tokenUser") === null) router.replace("/")

  const logout = () => {
    try { users.logout() } finally { router.replace('/') }
  }

  const showAddFriend = () => {
    const addFriendForm = document.querySelector("#addFriendForm")
    const showAddFriendBtn = document.querySelector("#showAddFriendBtn")
    const btnLogout = document.querySelector("#btnLogout")
    addFriendForm.classList.remove("hidden")
    showAddFriendBtn.classList.add("hidden")
    btnLogout.classList.add("hidden")
  }

  const addFriend = async () => {

    const addFriendForm = document.querySelector("#addFriendForm")
    const showAddFriendBtn = document.querySelector("#showAddFriendBtn")
    const btnLogout = document.querySelector("#btnLogout")
    const nicknameFriend = document.querySelector("#nicknameFriend")
    const addFriendSuccess = document.querySelector("#addFriendSuccess")
    const addFriendFail = document.querySelector("#addFriendFail")

    try {
      //On récupère l'ami
      const friendSearch = await users.getFriend(nicknameFriend.value)
      //On ajoute l'ami en api
      await users.setFriend(users.currentIdUser, friendSearch._id_player)
      //S'il n'y a pas d'erreur de note store, alors on affiche qu'on a bien ajouté l'ami

      btnLogout.classList.remove("hidden")
      addFriendSuccess.classList.remove("hidden")

      //après 3sec, la div disparait
      setTimeout(() => {
        addFriendSuccess.classList.add("hidden")

      }, 3000)

    } catch (error) {
      // console.log("Erreur : Impossible d'ajouter l'amis")
      //On affiche a l'user pendant 3 sec que c'est un fail
      addFriendFail.classList.remove("hidden")
      setTimeout(() => {
        addFriendFail.classList.add("hidden")
      }, 3000)

    }

  }

  const unshowAddFriendForm = () => {
    const addFriendForm = document.querySelector("#addFriendForm")
    addFriendForm.classList.add("hidden")
    showAddFriendBtn.classList.remove("hidden")

  }
</script>

<template>
  <header class="profile with-tabbar-padding">
    <div class="profile__header">
      <h1 class="profile__title">Mon Profil</h1>
    </div>
    <UserProfileCard />

    <div class="profile__actions">
      <form class="addFriend hidden" id="addFriendForm">
        <label for="">nickname de ton amis !</label>
        <input type="text" placeholder="nickname" name="nicknameFriend" id="nicknameFriend">
        <div class="addFriend__buttons">
          <button type="button" class="addFriend__cancel" @click="unshowAddFriendForm">
            annuler
          </button>
          <button type="button" class="addFriend__submit" id="addFriendBtn" @click="addFriend">Ajouter
            l'ami
          </button>
        </div>

      </form>

      <div class="profile__addFriendSuccess hidden" id="addFriendSuccess">Amis ajouté</div>
      <div class="profile__addFriendFail hidden" id="addFriendFail">Impossible d'ajouter l'ami</div>

      <button type="button" class="profile__addFriendBtn" id="showAddFriendBtn" @click="showAddFriend">Ajouter un
        ami</button>
      <button type="button" class="btn-logout" id="btnLogout" @click="logout">
        <span class="material-symbols-outlined">logout</span>
        Se déconnecter
      </button>

    </div>
  </header>
</template>

<style lang="scss" scoped>
  .p-profile {
    position: relative;
    height: 100dvh; // conteneur plein viewport
    overflow-y: auto; // active le scroll vertical
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--tabbar-height, 72px); // pour éviter que la TabBar masque le bas
  }
</style>
