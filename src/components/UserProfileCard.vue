<script setup>
import SuccessCard from './SuccessCard.vue'
</script>

<template>
  <div class="userCard">
    <header class="userCard__header">
      <div class="userCard__infos">
        <div class="userCard__fullname">
          <span class="userCard__firstname">Jaylo</span>
          <span> </span>
          <span class="userCard__lastname">Barot</span>
        </div>
        <div class="userCard__description">Explorateur de grotte</div>
      </div>
      <img class="userCard__picture" src="/public/img/profile-placeholder.png" alt="userImg" />
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
    display: grid;
    grid-template-columns: 1fr auto;
    border-bottom: 1px solid white;
  }
  &__picture {
    border-radius: 100rem;
    width: 10rem;

    &::after {
      content: 'modify';
      color: red;
    }
  }
  &__fullname {
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
