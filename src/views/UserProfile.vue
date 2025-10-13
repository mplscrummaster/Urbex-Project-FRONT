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

  const addFriend = () => {
    const addFriendForm = document.querySelector("#addFriendForm")
    const showAddFriendBtn = document.querySelector("#showAddFriendBtn")
    const btnLogout = document.querySelector("#btnLogout")
    const nicknameFriend = document.querySelector("#nicknameFriend")

    //Faire une requête vers l'api

    //Récupérer la réponse

    //Si c'est ok, afficher un message et fermer l'interface
    addFriendForm.classList.add("hidden")
    showAddFriendBtn.classList.remove("hidden")
    btnLogout.classList.remove("hidden")
    console.log(`${nicknameFriend.value} à été ajouté à votre liste d'amis`);

    //Si c'est pas ok, demander de recommencer

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
