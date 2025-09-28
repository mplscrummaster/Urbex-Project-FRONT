<script setup></script>

<template>
  <div class="successCard">
    <img src="/public/icons/success-placeholder.png" alt="success icon" />
    <div class="succesInfos">
      <div class="succesTitle">Tout feu tout flamme</div>
      <div class="successDescription">Realiser une serie de 7 defis</div>
      <div class="progress-bar">
        <div class="progress"></div>
      </div>
      <div class="progress-text">2/4 succès</div>
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

  img {

    width: 5rem;
    height: 5rem;
    display: flex;
    justify-self: center;
    align-self: center;
  }

  .succesInfos {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 1rem;
  }

  .progress-bar {
    width: 100%;
    height: 10px;
    background: #444;
    border-radius: 5px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background: #3b82f6;
    border-radius: 5px;
    transition: width 0.3s;
    width: 50%;
  }
}
</style>