<script setup>
  import UserProfileCard from '@/components/UserProfileCard.vue'
  import { useRouter } from 'vue-router'
  import { useUsersStore } from '@/stores/users'
  import { useTutorial } from '@/composables/useTutorial'
  import { onMounted } from 'vue'
  const router = useRouter()
  const users = useUsersStore()
  const { autoTutorial } = useTutorial()

  onMounted(() => {
    autoTutorial("user_profile")
  })

  if (localStorage.getItem('tokenUser') === null) router.replace('/')

  const logout = () => {
    try {
      users.logout()
    } finally {
      router.replace('/')
    }
  }

  //⏬ Ajout d'ami
  const addFriend = async () => {
    const btnLogout = document.querySelector('#btnLogout')
    const nicknameFriendAdd = document.querySelector('#nicknameFriendAdd')
    const addFriendSuccess = document.querySelector('#addFriendSuccess')
    const addFriendFail = document.querySelector('#addFriendFail')

    try {
      //On récupère l'ami
      const friendSearch = await users.getFriend(nicknameFriendAdd.value)
      console.log("friendSearch._id_player", friendSearch._id_player);

      //On ajoute l'ami en api
      await users.addFriend(users.currentIdUser, friendSearch._id_player)
      //S'il n'y a pas d'erreur de note store, alors on affiche qu'on a bien ajouté l'ami

      btnLogout.classList.remove('hidden')
      addFriendSuccess.classList.remove('hidden')

      //après 3sec, la div disparait
      setTimeout(() => {
        addFriendSuccess.classList.add('hidden')
      }, 3000)
    } catch (error) {
      console.log("Erreur : Impossible d'ajouter l'ami || ", error?.message || error)
      //On affiche a l'user pendant 3 sec que c'est un fail
      addFriendFail.classList.remove('hidden')
      setTimeout(() => {
        addFriendFail.classList.add('hidden')
      }, 3000)
    }
  }
  //⏫ Fin ajout d'ami

  //⏬ Suppresion d'ami
  const deleteFriend = async () => {
    const btnLogout = document.querySelector('#btnLogout')
    const nicknameFriendDelete = document.querySelector('#nicknameFriendDelete')
    const deleteFriendSuccess = document.querySelector('#deleteFriendSuccess')
    const deleteFriendFail = document.querySelector('#deleteFriendFail')

    try {
      //On récupère l'ami
      const friendSearch = await users.getFriend(nicknameFriendDelete.value)
      //On ajoute l'ami en api
      await users.deleteFriend(users.currentIdUser, friendSearch._id_player)
      //S'il n'y a pas d'erreur de note store, alors on affiche qu'on a bien ajouté l'ami

      btnLogout.classList.remove('hidden')
      deleteFriendSuccess.classList.remove('hidden')

      //après 3sec, la div disparait
      setTimeout(() => {
        deleteFriendSuccess.classList.add('hidden')
      }, 3000)
    } catch (error) {
      console.log("Erreur : Impossible de supprimer l'ami || ", error?.message || error)
      //On affiche a l'user pendant 3 sec que c'est un fail
      deleteFriendFail.classList.remove('hidden')
      setTimeout(() => {
        deleteFriendFail.classList.add('hidden')
      }, 3000)
    }
  }
  //⏫ Fin suppresion d'ami

  //⏬ Affichage/cachage des formulaires d'ajout/suppression d'ami
  const showAddFriend = () => {
    const addFriendForm = document.querySelector('#addFriendForm')
    const showAddFriendBtn = document.querySelector('#showAddFriendBtn')
    const showDeleteFriendBtn = document.querySelector('#showDeleteFriendBtn')
    const btnLogout = document.querySelector('#btnLogout')

    showAddFriendBtn.classList.add('hidden')
    showDeleteFriendBtn.classList.add('hidden')
    btnLogout.classList.add('hidden')
    addFriendForm.classList.remove('hidden')
  }
  const showDeleteFriend = () => {
    const deleteFriendForm = document.querySelector('#deleteFriendForm')
    const showAddFriendBtn = document.querySelector('#showAddFriendBtn')
    const showDeleteFriendBtn = document.querySelector('#showDeleteFriendBtn')
    const btnLogout = document.querySelector('#btnLogout')

    showAddFriendBtn.classList.add('hidden')
    showDeleteFriendBtn.classList.add('hidden')
    btnLogout.classList.add('hidden')
    deleteFriendForm.classList.remove('hidden')
  }
  const unshowAddFriendForm = () => {
    const addFriendForm = document.querySelector('#addFriendForm')
    const showAddFriendBtn = document.querySelector('#showAddFriendBtn')
    const showDeleteFriendBtn = document.querySelector('#showDeleteFriendBtn')
    const btnLogout = document.querySelector('#btnLogout')

    addFriendForm.classList.add('hidden')
    showAddFriendBtn.classList.remove('hidden')
    showDeleteFriendBtn.classList.remove('hidden')
    btnLogout.classList.remove('hidden')
  }
  const unshowDeleteFriendForm = () => {
    const deleteFriendForm = document.querySelector('#deleteFriendForm')
    const showAddFriendBtn = document.querySelector('#showAddFriendBtn')
    const showDeleteFriendBtn = document.querySelector('#showDeleteFriendBtn')
    const btnLogout = document.querySelector('#btnLogout')

    deleteFriendForm.classList.add('hidden')
    showAddFriendBtn.classList.remove('hidden')
    showDeleteFriendBtn.classList.remove('hidden')
    btnLogout.classList.remove('hidden')
  }
  //⏫ Fin affichage/cachage des formulaires d'ajout/suppression d'ami

</script>

<template>
  <header class="profile with-tabbar-padding">
    <div class="profile__header">
      <h1 class="profile__title">Mon Profil</h1>
    </div>
    <UserProfileCard class="profile__content" />
    <div class="profile__actions">
      <!--⏬ Formulaire d'ajout d'ami -->
      <form class="addFriend hidden" id="addFriendForm">
        <label for>Ajouter un ami</label>
        <input type="text" placeholder="nickname" name="nicknameFriendAdd" id="nicknameFriendAdd" />
        <div class="addFriend__buttons">
          <button type="button" class="addFriend__cancel" @click="unshowAddFriendForm">annuler</button>
          <button type="button" class="addFriend__submit" id="addFriendBtn" @click="addFriend">Ajouter l'ami</button>
        </div>
      </form>
      <!--⏫ Fin Formulaire d'ajout d'ami -->

      <!--⏬ Formulaire de suppression d'ami -->
      <form class="deleteFriend hidden" id="deleteFriendForm">
        <label for>Supprimer un ami</label>
        <input type="text" placeholder="nickname" name="nicknameFriendDelete" id="nicknameFriendDelete" />
        <div class="deleteFriend__buttons">
          <button type="button" class="deleteFriend__cancel" @click="unshowDeleteFriendForm">annuler</button>
          <button type="button" class="deleteFriend__submit" id="deleteFriendBtn" @click="deleteFriend">Supprimer
            l'ami</button>
        </div>
      </form>
      <!--⏫ Fin Formulaire de suppression d'ami -->

      <!--⏬ Notifications-->
      <div class="profile__addFriendSuccess hidden" id="addFriendSuccess">Ami ajouté</div>
      <div class="profile__addFriendFail hidden" id="addFriendFail">Impossible d'ajouter l'ami</div>
      <div class="profile__deleteFriendSuccess hidden" id="deleteFriendSuccess">Ami supprimé</div>
      <div class="profile__deleteFriendFail hidden" id="deleteFriendFail">Impossible de supprimer l'ami</div>
      <!--⏫ Fin notifications -->

      <!--⏬ Boutons-->
      <button type="button" class="profile__addFriendBtn" id="showAddFriendBtn" @click="showAddFriend">Ajouter un
        ami</button>
      <button type="button" class="profile__deleteFriendBtn" id="showDeleteFriendBtn"
        @click="showDeleteFriend">Supprimer
        un
        ami</button>
      <button type="button" class="btn-logout" id="btnLogout" @click="logout">
        <span class="material-symbols-outlined">logout</span>
        Se déconnecter
      </button>
      <!--⏫ Fin boutons -->

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
