<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioCard from '@/components/ScenarioCard.vue'

const router = useRouter()
const scenariosStore = useScenariosStore()

// Auth gate (lightweight – relies on token presence only)
if (!localStorage.getItem('tokenUser')) router.replace('/')

const activeFilter = ref('all')
const filters = ['all', 'terminés', 'commencés', 'pas encore']
const uiLoading = ref(true)
const uiError = ref(null)

const load = async () => {
  uiLoading.value = true
  uiError.value = null
  try {
    await scenariosStore.refreshAll()
  } catch (e) {
    uiError.value = e.message
  } finally {
    uiLoading.value = false
  }
}
onMounted(load)

const selectFilter = (name) => { activeFilter.value = name }

const filteredScenarios = computed(() => {
  const list = scenariosStore.items
  switch (activeFilter.value) {
    case 'terminés':
      return list.filter((s) => s.status === 'completed')
    case 'commencés':
      return list.filter((s) => s.status === 'started')
    case 'pas encore':
      return list.filter((s) => s.status === 'not_started')
    default:
      return list
  }
})

const scenarioClicked = (s) => {
  router.push({ name: 'scenario-detail', params: { id: s.id }, query: { from: 'list' } })
}
</script>

<template>
  <div class="container">
    <div class="container__filters">
      <button
        v-for="name in filters"
        :key="name"
        class="container__filter"
        :class="{ active: activeFilter === name }"
        @click.prevent="selectFilter(name)"
      >{{ name }}</button>
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
    gap: 12px;
    background-color: $color-bg-alt;
    padding-block: 1rem 5rem;

    &__filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    &__filter {
      background: $color-surface;
      border: none;
      border-radius: 16px;
      padding: 6px 14px;
      font-size: 14px;
      color: $color-text-dim;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: $color-surface-alt;
      }

      &.active {
        background: $color-accent;
        color: $color-text;
      }
    }
  }

  .card {
    background: #1e1e1e;
    border:1px solid #333;
    border-radius: 10px;
    padding: 14px 14px 12px;
    position:relative;
    box-shadow: 0 2px 4px rgba(0,0,0,.4);
    transition: background .25s, border-color .25s;
    cursor:pointer;
    &:hover { background:#242424; }
    &__bookmark { position:absolute; top:6px; right:6px; background:rgba(255,255,255,.07); border:1px solid #444; border-radius:8px; padding:2px 6px 0; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .25s,border-color .25s; }
    &__bookmark:hover { background:#2a2a2a; }
    &__bookmark .material-symbols-outlined { font-size:20px; line-height:1; color:#888; }
    &__bookmark .material-symbols-outlined.fill { font-variation-settings:'FILL' 1; color:#3b82f6; }
    &__bookmark.active { border-color:#3b82f6; }

    &__marked {
      filter: invert(39%) sepia(98%) saturate(749%) hue-rotate(203deg) brightness(91%) contrast(86%);
      color: yellow;
    }

    &__title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      color: #fff;
      text-decoration: underline;
    }

    &__author {
      margin: 4px 0;
      font-size: 13px;
      color: #aaa;
    }

    &__progress {
      margin-top: 6px;
      background: #333;
      height: 6px;
      border-radius: 4px;
      overflow: hidden;
      grid-column-start: 0;
      grid-row-start: 3;
    }

    &__progress-bar {
      background: #3b82f6;
      /* синій */
      height: 100%;
      transition: width 0.3s ease;
    }

    &__steps {
      margin-top: 4px;
      font-size: 12px;
      color: #ccc;
    }

    &.completed { border-color: #3b995d; }
    &.in-progress { border-color:#5d8ddb; }
  }

  .loading-state, .error-state, .empty-state { padding:1rem; font-size:.85rem; color:#ccc; }
  .hidden { display:none; }
.cards-list { display:flex; flex-direction:column; gap:14px; }

</style>
