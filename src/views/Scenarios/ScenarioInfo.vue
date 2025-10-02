<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioInfoComponent from '@/components/ScenarioInfoComponent.vue'

const route = useRoute()
const store = useScenariosStore()
const router = useRouter()
function goBack() {
  // If there is a navigation history, go back, else fallback to scenario list
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'scenario' })
  }
}
const scenarioId = computed(() => Number(route.params.id))

// Try to pull title from full cache first, fallback to list item, fallback legacy field
const scenarioTitle = computed(() => {
  const full = store.fullCache[scenarioId.value]
  if (full?.scenario?.title) return full.scenario.title
  if (full?.scenario?.title_scenario) return full.scenario.title_scenario
  const listItem = store.items.find(s => s.id === scenarioId.value)
  return listItem?.title || ''
})

onMounted(async () => {
  if (!store.fullCache[scenarioId.value]) {
    try { await store.fetchFull(scenarioId.value) } catch { /* ignore */ }
  }
})
</script>

<template>
  <div class="scenario-page">
    <header class="scenario-page__sticky" v-if="scenarioTitle">
      <button class="scenario-page__back" type="button" @click="goBack" aria-label="Retour">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="scenario-page__title">{{ scenarioTitle }}</h1>
    </header>
    <div class="scenario-page__body">
      <ScenarioInfoComponent />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scenario-page { width:100%; }
.scenario-page__sticky { position:sticky; top:0; z-index:40; backdrop-filter:blur(10px); background:linear-gradient(180deg,rgba(12,16,26,.92),rgba(12,16,26,.55) 70%,rgba(12,16,26,0)); padding:.85rem 0 .45rem; margin:0 0 .35rem; border-bottom:1px solid rgba(255,255,255,.05); display:flex; align-items:center; gap:.6rem; }
.scenario-page__back { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); color:#fff; border-radius:8px; padding:.35rem .55rem .3rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background .25s,border-color .25s; }
.scenario-page__back:hover { background:rgba(255,255,255,.15); border-color:rgba(255,255,255,.25); }
.scenario-page__back .material-symbols-outlined { font-size:20px; line-height:1; }
.scenario-page__title { margin:0; font-size:1.15rem; font-weight:650; letter-spacing:.6px; background:linear-gradient(90deg,#ffffff,#b5c9ff); -webkit-background-clip:text; background-clip:text; color:transparent; text-shadow:0 0 8px rgba(181,201,255,.15); }
.scenario-page__body { max-width:860px; margin:0 auto; padding:0 1rem; }
@media (min-width:760px){
  .scenario-page__sticky { padding:1rem 0 .65rem; }
  .scenario-page__title { font-size:1.5rem; }
  .scenario-page__body { padding:0 1.2rem; }
}
</style>
