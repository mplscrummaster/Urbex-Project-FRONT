<script setup>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref, computed, nextTick, watch } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioCard from '@/components/ScenarioCard.vue'

const router = useRouter()
const route = useRoute()
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

// Selected scenario id: from URL ?scenario=, else from localStorage
const persistedSelectedId = ref(null)
onMounted(() => {
  try {
    const v = Number(localStorage.getItem('currentScenarioId'))
    if (Number.isFinite(v)) persistedSelectedId.value = v
  } catch { /* ignore */ }
})
const selectedScenarioId = computed(() => {
  const raw = route.query?.scenario
  const id = Number(raw)
  if (Number.isFinite(id)) return id
  return Number.isFinite(persistedSelectedId.value) ? persistedSelectedId.value : null
})

// Sorting rules: completed (recent first) > current started (explicitly selected if started, else most recent) > other started by startedAt desc > not_started by title
const sortedBuckets = computed(() => {
  const list = (scenariosStore.items || []).slice()
  const parseTs = (s) => (s ? Date.parse(s) || 0 : 0)
  const byTitle = (a, b) => (a.title || '').localeCompare(b.title || '')
  const completed = list.filter((s) => s.status === 'completed').sort((a, b) => (parseTs(b.completedAt) - parseTs(a.completedAt)) || byTitle(a, b))
  const started = list.filter((s) => s.status === 'started').sort((a, b) => parseTs(b.startedAt) - parseTs(a.startedAt))
  let current = null
  if (selectedScenarioId.value) {
    current = started.find((s) => s.id === selectedScenarioId.value) || null
  }
  if (!current) current = started[0] || null
  const othersStarted = current ? started.filter((s) => s.id !== current.id) : started.slice(1)
  const notStarted = list.filter((s) => s.status === 'not_started').sort(byTitle)
  const all = current ? [...completed, current, ...othersStarted, ...notStarted] : [...completed, ...started, ...notStarted]
  return { all, completed, started, notStarted, currentId: current?.id || null, current, othersStarted }
})

const filteredScenarios = computed(() => {
  switch (activeFilter.value) {
    case 'terminés':
      return sortedBuckets.value.completed
    case 'commencés':
      return sortedBuckets.value.started
    case 'pas encore':
      return sortedBuckets.value.notStarted
    default:
      return sortedBuckets.value.all
  }
})

// Auto-scroll to the current (most recently started) scenario when visible in the list
const scrollToCurrent = async () => {
  await nextTick()
  const currentId = sortedBuckets.value.currentId
  if (!currentId) return
  // Only scroll if current appears in the displayed array
  const exists = filteredScenarios.value.some((s) => s.id === currentId)
  if (!exists) return
  const el = document.getElementById(`scenario-${currentId}`)
  if (el) {
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch { /* noop */ }
  }
}

watch(() => uiLoading.value, (nv, ov) => { if (ov && !nv) scrollToCurrent() })
watch(activeFilter, () => scrollToCurrent())
watch(selectedScenarioId, () => scrollToCurrent())

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
      <!-- ALL: show all groups with separators -->
      <template v-if="activeFilter === 'all'">
        <div v-if="sortedBuckets.completed.length" class="group">
          <div class="group__title">Terminés</div>
          <div class="group__list">
            <div v-for="s in sortedBuckets.completed" :key="s.id" class="cards-list__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.current" class="group">
          <div class="group__title">En cours</div>
          <div class="group__list">
            <div class="cards-list__item" :id="`scenario-${sortedBuckets.current.id}`">
              <ScenarioCard :scenario="sortedBuckets.current" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.othersStarted.length" class="group">
          <div class="group__title">Commencés</div>
          <div class="group__list">
            <div v-for="s in sortedBuckets.othersStarted" :key="s.id" class="cards-list__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.notStarted.length" class="group">
          <div class="group__title">Pas encore commencés</div>
          <div class="group__list">
            <div v-for="s in sortedBuckets.notStarted" :key="s.id" class="cards-list__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>

      <!-- TERMINÉS only -->
      <template v-else-if="activeFilter === 'terminés'">
        <div class="group">
          <div class="group__title">Terminés</div>
          <div class="group__list">
            <div v-for="s in sortedBuckets.completed" :key="s.id" class="cards-list__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>

      <!-- COMMENCÉS (current + others) -->
      <template v-else-if="activeFilter === 'commencés'">
        <div v-if="sortedBuckets.current" class="group">
          <div class="group__title">En cours</div>
          <div class="group__list">
            <div class="cards-list__item" :id="`scenario-${sortedBuckets.current.id}`">
              <ScenarioCard :scenario="sortedBuckets.current" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.othersStarted.length" class="group">
          <div class="group__title">Commencés</div>
          <div class="group__list">
            <div v-for="s in sortedBuckets.othersStarted" :key="s.id" class="cards-list__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>

      <!-- PAS ENCORE -->
      <template v-else-if="activeFilter === 'pas encore'">
        <div class="group">
          <div class="group__title">Pas encore commencés</div>
          <div class="group__list">
            <div v-for="s in sortedBuckets.notStarted" :key="s.id" class="cards-list__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>
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
    padding: 1rem clamp(12px, 4vw, 24px) 5rem;
    margin: 0 auto;
    width: 100%;
    max-width: 960px;

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
.cards-list__item { scroll-margin-block: 40vh; }

.group { display:flex; flex-direction:column; gap:10px; }
.group + .group { margin-top: 12px; }
.group__title { font-size: .9rem; font-weight: 700; letter-spacing: .4px; color: $color-text-dim; text-transform: uppercase; padding: 2px 4px; }
.group__list { display:flex; flex-direction:column; gap:14px; }

</style>
