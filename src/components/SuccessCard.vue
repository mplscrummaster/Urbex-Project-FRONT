<script setup></script>

<template>
  <div class="successCard">
    <img
      class="successCard__picture"
      src="/public/icons/success-placeholder.png"
      alt="success icon"
    />
    <div class="successCard__infos">
      <div class="successCard__title">Tout feu tout flamme</div>
      <div class="successCard__description">Realiser une serie de 7 defis</div>
      <div class="successCard__progress_bar">
        <div class="successCard__progress"></div>
      </div>
      <div class="successCard__progress_text">2/4 succès</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.successCard {
  background-color: gray;
  border-radius: 1rem;
  width: 80%;
  display: flex;
  padding: 1rem;
  box-shadow: 0 5px 10px 1px black;

  &__picture {
    width: 5rem;
    height: 5rem;
    border-radius: 0.5rem;
    display: flex;
    justify-self: center;
    align-self: center;
  }

  &__infos {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 1rem;
  }

  &__progress_bar {
    width: 100%;
    height: 10px;
    background: #444;
    border-radius: 5px;
    overflow: hidden;
  }

  &__progress {
    height: 100%;
    background: #3b82f6;
    border-radius: 5px;
    transition: width 0.3s;
    width: 50%;
  }
}
</style>
