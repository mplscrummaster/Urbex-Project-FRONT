<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'

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

async function toggleBookmark(e, scenario) {
  e.stopPropagation()
  const confirmCallback = async () => {
    return window.confirm('En retirant ce scénario, toute votre progression sera définitivement effacée. Confirmer ?')
  }
  try {
    await scenariosStore.toggleBookmark(scenario.id, { confirmCallback })
  } catch (err) {
    alert(err.message)
  }
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
    <div
      v-else
      v-for="scenario in filteredScenarios"
      :key="scenario.id"
      :id="scenario.id"
      :class="['card', scenario.status === 'completed' ? 'completed' : scenario.status === 'started' ? 'in-progress' : 'not-started']"
      @click="scenarioClicked(scenario)"
    >
      <button class="bookmark-btn" :class="{ active: scenario.bookmarked }" @click="(e) => toggleBookmark(e, scenario)" :title="scenario.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'">
        <span class="material-symbols-outlined" :class="{ fill: scenario.bookmarked }">{{ scenario.bookmarked ? 'bookmark' : 'bookmark_add' }}</span>
      </button>
      <h3 class="card__title">{{ scenario.title }}</h3>
      <p class="card__author">Scénario par {{ scenario.author }}</p>
      <div class="card__progress">
        <div
          class="card__progress-bar"
          :style="{ width: Math.round(scenario.progressRatio * 100) + '%' }"
        ></div>
      </div>
      <p class="card__steps">
        <span v-if="scenario._preciseProgressLoaded">
          {{ scenario._completedMissions }}/{{ scenario._totalMissions }} ({{ Math.round(scenario.progressRatio * 100) }}%)
        </span>
        <span v-else>
          {{ Math.round(scenario.progressRatio * 100) }}%
        </span>
      </p>
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

.card {
  @extend .elevated;
  position: relative;
  padding: 1rem 1rem .9rem;
  display:flex;
  flex-direction:column;
  gap:.55rem;
  cursor:pointer;
  border:1px solid $color-border;
  transition: border-color $transition, transform $transition, background $transition;
  &:hover { border-color:$color-accent; transform:translateY(-3px); background:$color-surface-alt; }
  &.completed { box-shadow:0 0 0 1px rgba($color-success,.4); }
  &.in-progress { box-shadow:0 0 0 1px rgba(255,200,60,.35); }
  &__title { margin:0; font-size:1rem; font-weight:600; color:$color-text; letter-spacing:.3px; }
  &__author { margin:0; font-size:.65rem; text-transform:uppercase; letter-spacing:1px; color:$color-text-dim; font-weight:500; }
  &__progress { @extend .progress-bar-shell; margin-top:.25rem; }
  &__progress-bar { @extend .progress-bar-fill; }
  &__steps { margin:0; font-size:.6rem; color:$color-text-dim; font-weight:500; letter-spacing:.5px; }
}

.bookmark-btn { position:absolute; top:.45rem; right:.45rem; background:rgba(0,0,0,.25); border:1px solid $color-border; border-radius:8px; padding:.25rem .45rem .2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background $transition, border-color $transition, box-shadow $transition; }
.bookmark-btn:hover { background:$color-surface; border-color:$color-accent; }
.bookmark-btn .material-symbols-outlined { font-size:20px; line-height:1; color:$color-text-dim; transition:color $transition; }
.bookmark-btn.active .material-symbols-outlined { color:$color-accent; }
.bookmark-btn .material-symbols-outlined.fill { font-variation-settings: 'FILL' 1; }

.card:not(.completed):not(.in-progress).not-started .card__progress-bar { background:#475569; }

</style>
