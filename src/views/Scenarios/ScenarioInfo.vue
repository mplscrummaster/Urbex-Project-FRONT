<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioDetail from '@/components/ScenarioDetail.vue'

const route = useRoute()
const store = useScenariosStore()
const router = useRouter()
const scenarioId = computed(() => Number(route.params.id))
// Prefer title from fully loaded cache, fallback to list store items
const scenarioTitle = computed(() => {
  const id = scenarioId.value
  const cached = store.fullCache[id]
  if (cached?.scenario?.title) return cached.scenario.title
  if (cached?.scenario?.title_scenario) return cached.scenario.title_scenario
  return store.items.find(s => s.id === id)?.title || ''
})

// Preload full scenario (for title) if not yet cached
onMounted(() => {
  const id = scenarioId.value
  if (id && !store.fullCache[id]) {
    store.fetchFull(id).catch(() => {})
  }
})

// If route id changes, ensure cache
watch(scenarioId, (n) => {
  if (n && !store.fullCache[n]) {
    store.fetchFull(n).catch(() => {})
  }
})

function goBack() {
  const from = route.query.from
  const commune = route.query.commune
  const zoom = route.query.zoom
  const lat = route.query.lat
  const lon = route.query.lon
  if (from === 'map') {
    const q = { }
    if (commune) q.commune = commune
    if (zoom) q.zoom = zoom
    if (lat) q.lat = lat
    if (lon) q.lon = lon
    return router.push({ name: 'map-global', query: q })
  }
  if (from === 'list') return router.push({ name: 'scenarios-list' })
  if (history.length > 1) return router.back()
  return router.push({ name: 'scenarios-list' })
}
</script>

<template>
  <div class="scenario-page">
    <header class="scenario-page__sticky">
      <button class="back-btn" type="button" @click="goBack" aria-label="Retour">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
  <h1 class="scenario-page__title">{{ scenarioTitle || '…' }}</h1>
    </header>
    <div class="scenario-page__body">
  <ScenarioDetail />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scenario-page__sticky { position:sticky; top:0; z-index:30; backdrop-filter:blur(8px); background:linear-gradient(180deg,rgba(10,14,22,.88),rgba(10,14,22,.55) 70%,rgba(10,14,22,0)); padding:.65rem 0 .45rem; margin:0 0 .4rem; display:flex; align-items:center; gap:.4rem; }
.scenario-page__title { margin:0; font-size:1.05rem; font-weight:600; letter-spacing:.5px; background:linear-gradient(90deg,#fff,#b5c9ff); -webkit-background-clip:text; background-clip:text; color:transparent; flex:1; }
.back-btn { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.15); color:#d1d9e6; width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center; border-radius:12px; cursor:pointer; padding:0; line-height:1; backdrop-filter:blur(4px); transition:background .25s,border-color .25s,color .25s; }
.back-btn:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.35); color:#fff; }
.back-btn:active { transform:translateY(1px); }
.back-btn .material-symbols-outlined { font-size:22px; }
@media (min-width: 760px) {
  .scenario-page__sticky { padding:.85rem 0 .55rem; }
  .scenario-page__title { font-size:1.25rem; }
  .back-btn { width:40px; height:40px; }
}
</style>
