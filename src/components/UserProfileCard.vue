<script setup>
  import SuccessCard from './SuccessCard.vue'
  import { useUsersStore } from '@/stores/users'
  import { onMounted, ref } from 'vue'

  const storeUsers = useUsersStore()
  const maxXp = 3000;

  let nickname = ref(null)
  let bio = ref(null)
  let percentXp = ref(null);
  let xp = ref(null)
  let urlImg = ref(null)

  onMounted(async () => {
    const playerDatas = ref(await storeUsers.getMeInfo());
    nickname.value = playerDatas.value.nickname;
    bio.value = playerDatas.value.bio;
    xp.value = playerDatas.value.xp;
    console.log("xp", xp.value)
    percentXp.value = (xp.value / maxXp) * 100;
    console.log("xp", percentXp.value)
    urlImg.value = playerDatas.value.url_img_avatar ?? "/public/img/profile-placeholder.png";
    console.log("playerDatas.url_img_avatar", playerDatas.value.url_img_avatar);

  })

</script>

<template>
  <div class="userCard">
    <header class="userCard__header">
      <img class="userCard__picture" :src="urlImg" alt="userImg" />
      <div class="userCard__infos">
        <div class="userCard__nickname"> {{ nickname }} </div>
        <div class="userCard__description">{{ bio ?? "Pas de bio" }}</div>
      </div>
      <div class="userCard__progress">
        <span class="userCard__progressText">{{ xp + "/" + maxXp }}</span>
        <div class="userCard__progressBar" :style="{ width: percentXp + '%' }"></div>
      </div>
      <button class="userCard__modifyInfos">Modifier le profil</button>
    </header>
    <main class="userCard__successList">
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
  .userCard {
    border-radius: 1rem;

    &__header {
      padding: 2rem;
      display: flex;
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
      background-color: rgb(21, 0, 255);
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

      &::after {
        content: 'modify';
        color: red;
      }
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
  }
</style>
