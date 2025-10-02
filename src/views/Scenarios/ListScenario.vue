<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'

const router = useRouter()
const scenariosStore = useScenariosStore()

// Auth gate (lightweight – relies on token presence only)
if (!localStorage.getItem('tokenUser')) router.replace('/')

const activeFilter = ref('all')
const uiLoading = ref(true)
const uiError = ref(null)

async function load() {
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

function changeFilter(e) {
  const btn = e.target.closest('button.container__filter')
  if (!btn) return
  const filterName = btn.innerText.trim()
  const filters = document.querySelectorAll('.container__filter')
  filters.forEach((f) => f.classList.remove('active'))
  btn.classList.add('active')
  activeFilter.value = filterName
}

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

async function toggleBookmark(s, ev) {
  ev.stopPropagation()
  try {
    await scenariosStore.toggleBookmark(s.id)
  } catch (e) {
    console.warn('Bookmark error', e.message)
  }
}

function openScenario(s) {
  router.push({ name: 'scenario-info', params: { id: s.id } })
}
</script>

<template>
  <div class="container">
    <div class="container__filters" @click.prevent="changeFilter($event)">
      <button class="container__filter active">all</button>
      <button class="container__filter">terminés</button>
      <button class="container__filter">commencés</button>
      <button class="container__filter">pas encore</button>
    </div>

    <div v-if="uiLoading" class="loading-state">Chargement des scénarios…</div>
    <div v-else-if="uiError" class="error-state">Erreur: {{ uiError }}</div>
    <div v-else-if="!filteredScenarios.length" class="empty-state">Aucun scénario</div>

    <div v-for="s in filteredScenarios" :key="s.id" :id="'scenario-'+s.id" :class="{
      card: true,
      completed: s.status === 'completed',
      'in-progress': s.status === 'started',
      'not-started': s.status === 'not_started'
    }" @click="openScenario(s)">
      <h3 class="card__title">{{ s.title }}</h3>
      <button class="card__bookmark" :class="{ active: s.bookmarked }" @click="toggleBookmark(s, $event)" :title="s.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'">
        <span class="material-symbols-outlined" :class="{ fill: s.bookmarked }">{{ s.bookmarked ? 'bookmark' : 'bookmark_add' }}</span>
      </button>
      <p class="card__author">Statut: {{ s.status === 'not_started' ? 'pas commencé' : s.status === 'started' ? 'en cours' : 'terminé' }}</p>
      <div class="card__progress">
        <div class="card__progress-bar" :style="{ width: (Math.round((s.progressRatio||0)*100)) + '%' }"></div>
      </div>
      <p class="card__steps">
        <span v-if="s._preciseProgressLoaded">
          {{ s._completedMissions }}/{{ s._totalMissions }} ({{ Math.round(s.progressRatio * 100) }}%)
        </span>
        <span v-else>
          {{ Math.round(s.progressRatio * 100) }}%
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #2a2a2a;
    padding-block: 1rem 5rem;

    &__filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    &__filter {
      background: #1e1e1e;
      border: none;
      border-radius: 16px;
      padding: 6px 14px;
      font-size: 14px;
      color: #aaa;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: #2a2a2a;
      }

      &.active {
        background: #3b82f6;
        color: #fff;
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
</style>
