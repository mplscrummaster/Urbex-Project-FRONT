<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioCard from '@/components/ScenarioCard.vue'

const activeFilter = ref('all')
const router = useRouter()
const scenariosStore = useScenariosStore()

onMounted(async () => {
  await scenariosStore.fetchMine()
  // lancer enrichissement précis en arrière-plan
  scenariosStore.enrichProgress()
})

// Possibilité: relancer enrichissement si items changent (ex: après un toggle futur)
watch(
  () => scenariosStore.items.length,
  () => {
    scenariosStore.enrichProgress()
  }
)

const changeFilter = (e) => {
  const txt = e.target.innerText
  const filters = document.querySelectorAll('.container__filter')
  filters.forEach((f) => f.classList.remove('active'))
  e.target.classList.add('active')
  activeFilter.value = txt
}

const filteredScenarios = computed(() => {
  const list = scenariosStore.items
  if (activeFilter.value === 'all') return list
  if (activeFilter.value === 'terminés') return list.filter((s) => s.status === 'completed')
  if (activeFilter.value === 'commencés') return list.filter((s) => s.status === 'started')
  if (activeFilter.value === 'pas encore') return list.filter((s) => s.status === 'not_started')
  return list
})

const scenarioClicked = (scenario) => {
  router.push(`/scenario/${scenario.id}`)
}

</script>

<template>
  <div class="container">
    <!-- Фільтри -->
    <div class="container__filters" @click.prevent="changeFilter($event)">
      <button class="container__filter">all</button>
      <button class="container__filter">terminés</button>
      <button class="container__filter">commencés</button>
      <button class="container__filter">pas encore</button>
    </div>

    <!-- Сценарії -->
    <div v-if="scenariosStore.loading" style="color:#aaa;">Chargement...</div>
    <div v-else-if="!filteredScenarios.length" style="color:#aaa;">Aucun scénario bookmarké pour l'instant.</div>
    <div v-else class="cards-list">
      <ScenarioCard
        v-for="scenario in filteredScenarios"
        :key="scenario.id"
        :scenario="scenario"
        @select="scenarioClicked"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as *;

.container {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding-block: 1rem 5rem;
  position: relative;

  &__filters {
    display: flex;
    gap: .6rem;
    margin-bottom: .5rem;
    flex-wrap: wrap;
  }
  &__filter {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: 999px;
    padding: .45rem 1.1rem;
    font-size: .7rem;
    letter-spacing: .5px;
    text-transform: uppercase;
    color: $color-text-dim;
    cursor: pointer;
    font-weight:600;
    display:inline-flex; align-items:center; gap:.35rem;
    transition: background $transition, color $transition, border-color $transition;
    &:hover { background:$color-surface-alt; color:$color-text; }
    &.active { background:$color-accent; color:#fff; border-color:$color-accent; box-shadow:0 0 0 1px rgba(59,130,246,.4); }
  }
}

.cards-list { display:flex; flex-direction:column; gap:14px; }

</style>
