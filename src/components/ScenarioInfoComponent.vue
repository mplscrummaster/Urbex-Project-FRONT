<script setup>
import ConclusionMission from './ConclusionMission.vue'
import IntroductionMission from './IntroductionMission.vue'
import StepsMission from './StepsMission.vue'
</script>
<template>
  <div class="scenario">
    <h1 class="scenario__title">Title</h1>
    <h2 class="scenario__creator">Created by: Anonym</h2>
    <div class="scenario__listMissions">
      <IntroductionMission />
      <StepsMission name="1" />
      <StepsMission name="2" />
      <StepsMission name="3" />
      <StepsMission name="4" />
      <StepsMission name="final" />
      <ConclusionMission />
    </div>
  </div>
</template>
<!--Style qui est propre a la vue-->
<style lang="scss" scoped>
.scenario {
  padding-block-start: 2rem;
  padding-block-end: 4rem;
  &__title,
  &__creator {
    color: white;
  }

  &__listMissions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
<!--Style qui est propre aux 3 composants-->
<style lang="scss">
.arrow {
  display: flex;
  align-self: center;
  width: 2rem;
  cursor: pointer;
  transition: transform 0.3s;
  &.rotated {
    transform: rotate(180deg);
  }
}

.arrow .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
