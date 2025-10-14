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
let level = ref(null)

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
  urlImg.value = playerDatas.value.url_img_avatar ?? "urbex-front/img/profile-placeholder.png";
  level.value = playerDatas.value.level;

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
      <div class="userCard__level">level {{ level }}</div>
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

.hidden {
  display: none;
}
</style>
