<script setup>
  import SuccessCard from './SuccessCard.vue'
  import { useUsersStore } from '@/stores/users'
  import { onMounted, ref } from 'vue'

  const storeUsers = useUsersStore()

  let username = ref(null)
  let bio = ref(null)
  let percentXp = ref(null);
  let xp = ref(null)
  let urlImg = ref(null)

  const maxXp = 3000;
  const headerProfile = ref(null)
  const modifyInputs = ref(null)
  // Editable fields
  const usernameModify = ref('')
  const bioModify = ref('')
  const urlImgModify = ref('')

  onMounted(async () => {
    const playerDatas = ref(await storeUsers.getMeInfo());
    username.value = playerDatas.value.nickname;
    bio.value = playerDatas.value.bio;
    xp.value = playerDatas.value.xp;
    percentXp.value = (xp.value / maxXp) * 100;
    urlImg.value = playerDatas.value.url_img_avatar ?? "/img/profile-placeholder.png";
    // Initialize editable fields with current values
    usernameModify.value = username.value || ''
    bioModify.value = bio.value || ''
    urlImgModify.value = urlImg.value || ''

  })

  const ModifyProfil = () => {
    //1) Cacher le header du profil
    headerProfile.value.classList.add("hidden")
    modifyInputs.value.classList.remove("hidden")

    //2) Afficher le form pour modifier le profil
  }

  const EndModifyProfil = async () => {
    headerProfile.value.classList.remove("hidden")
    modifyInputs.value.classList.add("hidden")

    const results = await storeUsers.setMeInfo(usernameModify.value, bioModify.value, urlImgModify.value)
    // Optionally refresh local display after save
    if (results) {
      username.value = results.nickname ?? usernameModify.value
      bio.value = results.bio ?? bioModify.value
      urlImg.value = results.url_img_avatar ?? urlImgModify.value
    }
  }

</script>

<template>
  <div class="userCard">
    <header class="userCard__header" ref="headerProfile">
      <img class="userCard__picture" :src="urlImg" alt="userImg" />
      <div class="userCard__infos">
        <div class="userCard__nickname"> {{ username }} </div>
        <div class="userCard__description">{{ bio ?? "Pas de bio" }}</div>
      </div>
      <div class="userCard__progress">
        <span class="userCard__progressText">{{ xp + "/" + maxXp + " xp" }}</span>
        <div class="userCard__progressBar" :style="{ width: percentXp + '%' }"></div>
      </div>
      <button class="userCard__modifyInfos" @click.prevent="ModifyProfil">Modifier le profil</button>
    </header>

    <form class="modifyForm hidden" ref="modifyInputs">
      <span class="modifyForm__description">Change tes infos ici !</span>
      <label for="username">Username</label>
      <input type="text" placeholder="Username" v-model="usernameModify">
      <label for="username">Bio</label>
      <input type="text" placeholder="Bio" v-model="bioModify">
      <label for="username">Url d'avatar</label>
      <input type="text" placeholder="Url img" v-model="urlImgModify">
      <button class="modifyForm__submit" @click.prevent="EndModifyProfil">Modifier</button>
    </form>

    <main class="userCard__successList hidden">
      <h1 class="userCard__successList--title">Succès</h1>
      <SuccessCard />
      <SuccessCard />
      <SuccessCard />
      <SuccessCard />
      <SuccessCard />
    </main>
  </div>
</template>

<style lang="scss" scoped>
  @use '@/styles/abstracts' as *;

  .userCard {
    border-radius: 1rem;

    &__header {
      padding: 2rem;
      display: flex;
      gap: 1rem;
      flex-direction: column;
      align-items: center;
      border-bottom: 1px solid white;
    }

    &__infos {
      display: flex;
      flex-direction: column;
    }

    &__progress {
      height: 2rem;
      background-color: rgb(63, 63, 63);
      border-radius: 2rem;
      width: 100%;
    }

    &__progressBar {
      height: 2rem;
      border-radius: 2rem;
      background-color: $color-accent;
      display: flex;
      justify-content: center;
      align-items: center;

    }

    &__progressText {
      position: absolute;
      left: 40%;
      margin: 7px;
    }

    &__picture {
      border-radius: 100rem;
      width: 10rem;

    }

    &__nickname {
      font-size: 4rem;
    }

    &__description {
      font-size: 2rem;
      opacity: 0.8;

    }

    &__successList {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding-block-start: 1rem;
      padding-block-end: 2rem;

      &--title {
        font-size: 3rem;
      }
    }

    &__modifyInfos {
      transition: all .2s ease-out;
      cursor: pointer;
      background-color: $color-accent;
      color: white;
      width: fit-content;
      padding: .8rem 1.5rem;
      border: none;
      border-radius: 1rem;

      &:hover {
        background-color: $color-success;

      }
    }
  }

  .modifyForm {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .7rem;

    &__description {
      padding-inline-start: .3rem;
    }

    input {
      background-color: gray;
      border: none;
      border: 2px solid rgb(74, 74, 74);
      border-radius: 1rem;
      padding: .5rem;
      width: 100%;
      box-shadow: inset 0 0 10px 0 #00000063;

      &:focus {
        outline: none;
        border: 2px solid $color-accent;

      }
    }

    &__submit {
      transition: all .3s ease-out;
      cursor: pointer;
      background-color: $color-accent;
      color: white;
      width: fit-content;
      padding: .8rem 1.5rem;
      border: none;
      border-radius: 1rem;

      &:hover {
        background-color: #0e00ab;

      }
    }
  }

  .hidden {
    display: none;
  }
</style>
