<script setup>
import ConclusionMission from './ConclusionMission.vue';
import IntroductionMission from './IntroductionMission.vue';
import StepsMission from './StepsMission.vue';

</script>
<template>
  <h1>Title</h1>
  <h2>Created by: Anonym</h2>
  <div class="listMissions">
    <IntroductionMission />
    <StepsMission name="1" />
    <StepsMission name="2" />
    <StepsMission name="3" />
    <StepsMission name="4" />
    <StepsMission name="final" />
    <ConclusionMission />
  </div>
</template>
<style>
.listMissions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  background: #bdbdbd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(177, 176, 176, 0.4);
  display: grid;
  grid-template-columns: 1fr auto;
}

.arrow {
  display: flex;
  align-self: center;
  width: 2rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.fade-enter-active,
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