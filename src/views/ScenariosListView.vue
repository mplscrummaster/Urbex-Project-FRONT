<script setup>
/*
  Liste des scénarios
  --------------------------------------------------
  Objectifs
  - Afficher tous les scénarios bookmarkés, triés et filtrés par statut
  - Permettre la navigation rapide vers le scénario courant ou un autre
  - Auto-scroll sur le scénario en cours après chargement ou changement de filtre

  Principes
  - Données gérées via Pinia (scenariosStore)
  - Tri et regroupement en buckets: terminés, en cours, commencés, pas encore
  - Filtrage dynamique via boutons
  - Sélection du scénario courant via URL (?scenario=) ou localStorage
  - Navigation vers la fiche scénario au clic
*/
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref, computed, nextTick, watch } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioCard from '@/components/ScenarioCard.vue'
import { useTutorial } from '@/composables/useTutorial.js'

const router = useRouter()
const route = useRoute()
const scenariosStore = useScenariosStore()
const { autoTutorial } = useTutorial()

// Authentification basique : redirige si pas de token local
if (!localStorage.getItem('tokenUser')) router.replace('/')

// Filtre actif et liste des filtres disponibles
const activeFilter = ref('all')
const filters = ['all', 'terminés', 'commencés', 'pas encore']
// États UI pour le chargement et les erreurs
const uiLoading = ref(true)
const uiError = ref(null)

// Charge tous les scénarios bookmarkés depuis l’API/store
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
// Chargement au montage
onMounted(load)

// Sélectionne le filtre actif
const selectFilter = (name) => {
  activeFilter.value = name
}

// ID du scénario sélectionné : priorité à ?scenario= dans l'URL, sinon localStorage
const persistedSelectedId = ref(null)
onMounted(() => {
  try {
    const v = Number(localStorage.getItem('currentScenarioId'))
    if (Number.isFinite(v)) persistedSelectedId.value = v
  } catch {
    /* ignorer */
  }
  //start tutorial

})
const selectedScenarioId = computed(() => {
  const raw = route.query?.scenario
  const id = Number(raw)
  if (Number.isFinite(id)) return id
  return Number.isFinite(persistedSelectedId.value) ? persistedSelectedId.value : null
})

/*
  Tri et regroupement des scénarios :
  - Terminés : par date de complétion décroissante puis titre
  - En cours : scénario explicitement sélectionné (si started), sinon le plus récent
  - Commencés : autres started par date décroissante
  - Pas encore : par titre
  - all : concatène tous les groupes dans l'ordre
*/
const sortedBuckets = computed(() => {
  const list = (scenariosStore.items || []).slice()
  const parseTs = (s) => (s ? Date.parse(s) || 0 : 0)
  const byTitle = (a, b) => (a.title || '').localeCompare(b.title || '')
  const completed = list
    .filter((s) => s.status === 'completed')
    .sort((a, b) => parseTs(b.completedAt) - parseTs(a.completedAt) || byTitle(a, b))
  const started = list
    .filter((s) => s.status === 'started')
    .sort((a, b) => parseTs(b.startedAt) - parseTs(a.startedAt))
  let current = null
  if (selectedScenarioId.value) {
    current = started.find((s) => s.id === selectedScenarioId.value) || null
  }
  if (!current) current = started[0] || null
  const othersStarted = current ? started.filter((s) => s.id !== current.id) : started.slice(1)
  const notStarted = list.filter((s) => s.status === 'not_started').sort(byTitle)
  const all = current
    ? [...completed, current, ...othersStarted, ...notStarted]
    : [...completed, ...started, ...notStarted]
  return {
    all,
    completed,
    started,
    notStarted,
    currentId: current?.id || null,
    current,
    othersStarted,
  }
})

// Filtrage dynamique selon le filtre actif
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

// Auto-scroll sur le scénario courant (si visible dans la liste)
const scrollToCurrent = async () => {
  await nextTick()
  const currentId = sortedBuckets.value.currentId
  if (!currentId) return
  // Only scroll if current appears in the displayed array
  const exists = filteredScenarios.value.some((s) => s.id === currentId)
  if (!exists) return
  const el = document.getElementById(`scenario-${currentId}`)
  if (el) {
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch {
      /* noop */
    }
  }
}

// Watchers : déclenchent le scroll automatique après chargement ou changement de filtre/sélection
watch(
  () => uiLoading.value,
  (nv, ov) => {
    if (ov && !nv) scrollToCurrent()
  },
)
watch(activeFilter, () => scrollToCurrent())
watch(selectedScenarioId, () => scrollToCurrent())

// Navigation vers la fiche scénario au clic
const scenarioClicked = (s) => {
  router.push({ name: 'scenario-detail', params: { id: s.id }, query: { from: 'list' } })
}
onMounted(async () => {
  await nextTick()
  setTimeout(() => autoTutorial('scenarios'), 300)
})

</script>

<template>
  <div class="p-scenarios">
    <div class="p-scenarios__filters">
      <button v-for="name in filters" :key="name" class="p-scenarios__filter" :class="{ active: activeFilter === name }"
        :aria-label="`Filtrer les scénarios : ${name}`" :disabled="activeFilter === name"
        @click.prevent="selectFilter(name)">
        {{ name }}
      </button>
    </div>

    <div v-if="scenariosStore.loading" class="p-scenarios__state p-scenarios__state--loading">
      Chargement...
    </div>
    <div v-else-if="uiError" class="p-scenarios__state p-scenarios__state--error">
      Erreur lors du chargement des scénarios : {{ uiError }}
    </div>
    <div v-else-if="!filteredScenarios.length" class="p-scenarios__state p-scenarios__state--empty">
      Aucun scénario bookmarké pour l'instant.
    </div>
    <div v-else class="p-scenarios__list" role="list">
      <!-- ALL: show all groups with separators -->
      <template v-if="activeFilter === 'all'">
        <div v-if="sortedBuckets.completed.length" class="p-scenarios__section">
          <div class="p-scenarios__section-title">Terminés</div>
          <div class="p-scenarios__section-list">
            <div v-for="s in sortedBuckets.completed" :key="s.id" class="p-scenarios__item" :id="`scenario-${s.id}`"
              role="listitem" :aria-current="sortedBuckets.currentId === s.id ? 'true' : undefined">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.current" class="p-scenarios__section">
          <div class="p-scenarios__section-title">En cours</div>
          <div class="p-scenarios__section-list">
            <div class="p-scenarios__item" :id="`scenario-${sortedBuckets.current.id}`" role="listitem"
              aria-current="true">
              <ScenarioCard :scenario="sortedBuckets.current" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.othersStarted.length" class="p-scenarios__section">
          <div class="p-scenarios__section-title">Commencés</div>
          <div class="p-scenarios__section-list">
            <div v-for="s in sortedBuckets.othersStarted" :key="s.id" class="p-scenarios__item" :id="`scenario-${s.id}`"
              role="listitem" :aria-current="sortedBuckets.currentId === s.id ? 'true' : undefined">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.notStarted.length" class="p-scenarios__section">
          <div class="p-scenarios__section-title">Pas encore commencés</div>
          <div class="p-scenarios__section-list">
            <div v-for="s in sortedBuckets.notStarted" :key="s.id" class="p-scenarios__item" :id="`scenario-${s.id}`"
              role="listitem" :aria-current="sortedBuckets.currentId === s.id ? 'true' : undefined">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>

      <!-- TERMINÉS only -->
      <template v-else-if="activeFilter === 'terminés'">
        <div class="p-scenarios__section">
          <div class="p-scenarios__section-title">Terminés</div>
          <div class="p-scenarios__section-list">
            <div v-for="s in sortedBuckets.completed" :key="s.id" class="p-scenarios__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>

      <!-- COMMENCÉS (current + others) -->
      <template v-else-if="activeFilter === 'commencés'">
        <div v-if="sortedBuckets.current" class="p-scenarios__section">
          <div class="p-scenarios__section-title">En cours</div>
          <div class="p-scenarios__section-list">
            <div class="p-scenarios__item" :id="`scenario-${sortedBuckets.current.id}`">
              <ScenarioCard :scenario="sortedBuckets.current" @select="scenarioClicked" />
            </div>
          </div>
        </div>
        <div v-if="sortedBuckets.othersStarted.length" class="p-scenarios__section">
          <div class="p-scenarios__section-title">Commencés</div>
          <div class="p-scenarios__section-list">
            <div v-for="s in sortedBuckets.othersStarted" :key="s.id" class="p-scenarios__item"
              :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>

      <!-- PAS ENCORE -->
      <template v-else-if="activeFilter === 'pas encore'">
        <div class="p-scenarios__section">
          <div class="p-scenarios__section-title">Pas encore commencés</div>
          <div class="p-scenarios__section-list">
            <div v-for="s in sortedBuckets.notStarted" :key="s.id" class="p-scenarios__item" :id="`scenario-${s.id}`">
              <ScenarioCard :scenario="s" @select="scenarioClicked" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
