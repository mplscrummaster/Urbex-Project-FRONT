<script setup>
import ConclusionMission from './ConclusionMission.vue';
import IntroductionMission from './IntroductionMission.vue';
import StepsMission from './StepsMission.vue';

</script>
<template>
  <h1>Scenario Info Component</h1>
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
<style scoped>
.listMissions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>