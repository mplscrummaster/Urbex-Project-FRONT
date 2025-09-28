<script setup>
import SuccessCard from './SuccessCard.vue';

</script>

<template>
  <div class="userCard">
    <header>
      <div class="userInfos">
        <div class="fullname">
          <span class="firstname">Jaylo</span>
          <span> </span>
          <span class="lastname">Barot</span>
        </div>
        <div class="userDescription">Explorateur de grotte</div>
      </div>
      <img class="userPicture" src="/public/img/profile-placeholder.png" alt="userImg" />
    </header>
    <main class="successList">
      <div class="title">Succès</div>
      <SuccessCard />
      <SuccessCard />
      <SuccessCard />
      <SuccessCard />
      <SuccessCard />
    </main>
  </div>
</template>

<style lang="scss" scoped>
header {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr auto;
  border-bottom: 1px solid white;

  .userPicture {
    border-radius: 100rem;
    width: 10rem;

    &::after {
      content: 'modify';
      color: red;
    }
  }
}

.userCard {
  border-radius: 1rem;
}

.fullname {
  font-size: 4rem;
}

.userDescription {
  font-size: 2rem;
  opacity: 0.8;
}

.successList {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-block-start: 1rem;
  padding-block-end: 2rem;

  .title {
    font-size: 3rem;
  }

}
</style>
