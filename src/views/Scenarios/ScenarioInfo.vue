<script setup>
  import ScenarioInfoComponent from '@/components/ScenarioInfoComponent.vue'

</script>
<template>
  <div class="scenario-page">
    <header class="scenario-page__sticky" v-if="scenarioTitle">
      <h1 class="scenario-page__title">{{ scenarioTitle }}</h1>
    </header>
    <ScenarioInfoComponent />
  </div>
 </template>
<style lang="scss" scoped>
.scenario-page__sticky { position:sticky; top:0; z-index:30; backdrop-filter:blur(8px); background:linear-gradient(180deg,rgba(10,14,22,.88),rgba(10,14,22,.55) 70%,rgba(10,14,22,0)); padding:.85rem 0 .4rem; margin:0 0 .4rem; }
.scenario-page__title { margin:0; font-size:1.05rem; font-weight:600; letter-spacing:.5px; background:linear-gradient(90deg,#fff,#b5c9ff); -webkit-background-clip:text; background-clip:text; color:transparent; }
@media (min-width: 760px) {
  .scenario-page__sticky { padding:1rem 0 .55rem; }
  .scenario-page__title { font-size:1.25rem; }
}
</style>
