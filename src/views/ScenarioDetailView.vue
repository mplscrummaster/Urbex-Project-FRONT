<script setup>
/*
  Détail d'un scénario
  --------------------------------------------------
  Objectifs
  - Afficher toutes les infos d'un scénario : intro, missions, conclusion, progression
  - Permettre la navigation, le bookmarking, le démarrage et la validation du scénario
  - Gérer l'état des missions (verrouillées, complétées, réponses, distance)
 
  Principes
  - Données gérées via Pinia (scenariosStore)
  - Navigation contextuelle (retour vers la bonne vue)
  - Collapsibles pour intro, missions, outro
  - Géolocalisation pour missions à proximité
  - Gestion des erreurs et des états UI
*/

import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScenariosStore } from '@/stores/scenarios'
import { ScenariosAPI, MissionsAPI } from '@/services/api'
import CollapsibleCard from '@/components/CollapsibleCard.vue'
import { useTutorial } from '@/composables/useTutorial'
// --- Variables réactives et helpers manquants ---
const full = ref(null)
const openMissions = ref({})
const showIntro = ref(false)
const showOutro = ref(false)
const loading = ref(false)
const error = ref(null)
const { autoTutorial } = useTutorial()
const closeAll = () => {
  Object.keys(openMissions.value).forEach((k) => {
    openMissions.value[k] = false
  })
}
// Fonction pour ouvrir/fermer le collapse d'intro
const toggleIntro = () => {
  showIntro.value = !showIntro.value
}
// Fonction pour ouvrir/fermer le collapse de la conclusion
const toggleOutro = () => {
  showOutro.value = !showOutro.value
}
// Nettoyage de l'état lors du changement de scénario
const resetScenarioState = () => {
  showIntro.value = false
  showOutro.value = false
  openMissions.value = {}
  missionAnswers.value = {}
  startError.value = null
  finishError.value = null
  bookmarkError.value = null
}
import ScenarioMissionItem from '@/components/MissionCollapsibleCard.vue'

const route = useRoute()
const router = useRouter()

// Fonction de retour à la vue précédente ou à la liste des scénarios
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'scenarios-list' })
  }
}
const store = useScenariosStore()

const scenarioId = computed(() => Number(route.params.id))
// Prefer title from cache for the sticky header
const scenarioTitle = computed(() => {
  // ID du scénario courant (depuis l'URL)
  const id = scenarioId.value
  // Titre du scénario (cache ou store)
  const cached = store.fullCache[id]

  // Navigation retour : selon le contexte (map, liste, historique)
  if (cached?.scenario?.title) return cached.scenario.title
  if (cached?.scenario?.title_scenario) return cached.scenario.title_scenario
  return store.items.find((s) => s.id === id)?.title || ''
})

const toggleMission = (missionId) => {
  const mission = (full.value?.missions || []).find((m) => m.id === missionId)
  if (mission && missionLocked(mission)) return
  const currently = !!openMissions.value[missionId]
  closeAll()
  if (!currently) openMissions.value[missionId] = true
}

const openMissionFromQuery = async () => {
  const q = route.query
  const raw = q?.mission
  if (raw == null) return false
  const mid = Number(raw)
  if (!Number.isFinite(mid)) return false
  const m = (full.value?.missions || []).find((x) => Number(x.id) === mid)
  if (!m) return false
  if (missionLocked(m) && !isCompleted(m.id)) return false
  closeAll()
  openMissions.value[m.id] = true
  showIntro.value = false
  showOutro.value = false
  await nextTick()
  try {
    document
      .getElementById(`mission-${m.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch {
    /* ignore */
  }
  return true
}

const missions = computed(() => {
  return (full.value?.missions || []).slice().sort((a, b) => a.position - b.position)
})
const completedIdSet = computed(() => {
  const ids = full.value?.progress?.completedMissionIds || []
  return new Set(ids.map((v) => String(v)))
})
const isCompleted = (missionId) => completedIdSet.value.has(String(missionId))
const missionAnswers = ref({})
const starting = ref(false)
const startError = ref(null)
const finishing = ref(false)
const finishError = ref(null)
const userLat = ref(null)
const userLon = ref(null)
const geoError = ref(null)
let geoWatchId = null
const RANGE_METERS = 50
const startGeolocation = () => {
  if (!navigator.geolocation) {
    geoError.value = 'Géolocalisation non supportée'
    return
  }
  geoWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      userLat.value = pos.coords.latitude
      userLon.value = pos.coords.longitude
    },
    (err) => {
      geoError.value = err.message || 'Erreur géolocalisation'
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 },
  )
}
const stopGeolocation = () => {
  if (geoWatchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(geoWatchId)
    geoWatchId = null
  }
}
const distanceMeters = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((v) => v == null)) return Infinity
  const R = 6371000,
    toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
const missionInRange = (m) => {
  if (m.latitude == null || m.longitude == null) return true
  return distanceMeters(userLat.value, userLon.value, m.latitude, m.longitude) <= RANGE_METERS
}
const missionDistance = (m) => {
  if (m.latitude == null || m.longitude == null) return null
  const d = distanceMeters(userLat.value, userLon.value, m.latitude, m.longitude)
  return Number.isFinite(d) ? d : null
}
const formatDistance = (meters) => {
  if (meters == null || !Number.isFinite(meters)) return null
  const d = Math.max(0, meters)
  if (d >= 1000) {
    const km = d / 1000
    const value = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10
    return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`
  }
  if (d > 100) {
    const tens = Math.round(d / 10) * 10
    return `${tens.toLocaleString('fr-FR')} m`
  }
  return `${Math.round(d).toLocaleString('fr-FR')} m`
}
const missionDistanceText = (m) => {
  const d = missionDistance(m)
  const label = formatDistance(d)
  return label || ''
}
const initMissionAnswer = (mid) => {
  if (!missionAnswers.value[mid]) {
    missionAnswers.value[mid] = { value: '', status: 'idle', error: null }
  }
}
const missionLocked = (m) => {
  if (!m) return true
  if (scenarioStatus.value === 'not_started') return true
  if (isCompleted(m.id)) return false
  if (typeof m.locked === 'boolean') return m.locked
  if (Array.isArray(m.prerequisites) && m.prerequisites.length) {
    return !m.prerequisites.every((pid) => completedIdSet.value.has(String(pid)))
  }
  const prev = (missions.value || []).filter(
    (x) => x.position != null && m.position != null && x.position < m.position,
  )
  if (prev.length) {
    return !prev.every((x) => isCompleted(x.id))
  }
  return false
}
const missionLockReason = (m) => {
  if (scenarioStatus.value === 'not_started')
    return 'Commencez le scénario pour accéder aux missions'
  if (m.locked) return 'Complétez les missions prérequises'
  return ''
}
const bookmarking = ref(false)
const bookmarkError = ref(null)
const toggleBookmarkDetail = async () => {
  if (!full.value) return
  bookmarkError.value = null
  const currentlyBookmarked = isBookmarked.value
  const needsConfirm = isBookmarked.value && full.value.progress?.scenario.status !== 'not_started'
  // Demande de confirmation avant de modifier l'état local
  if (needsConfirm) {
    const confirmed = window.confirm(
      'Retirer ce scénario supprimera aussi toute votre progression. Confirmer ?',
    )
    if (!confirmed) return
  }
  let prevBookmark = null
  let currentId = null
  let storeItem = null
  try {
    bookmarking.value = true
    currentId = full.value.scenario.id
    storeItem = store.items.find((s) => s.id === currentId)
    prevBookmark = storeItem ? storeItem.bookmarked : null
    const nextState = !currentlyBookmarked
    // Applique le changement visuel seulement si confirmé
    if (storeItem) storeItem.bookmarked = nextState
    if (!full.value.progress) full.value.progress = { scenario: {} }
    if (!full.value.progress.scenario) full.value.progress.scenario = {}
    full.value.progress.scenario.bookmarked = nextState
    if (full.value.scenario) full.value.scenario.bookmarked = nextState
    await store.toggleBookmark(full.value.scenario.id, {
      fromState: currentlyBookmarked,
    })
    try {
      full.value = await store.fetchFull(scenarioId.value, true)
    } catch {
      /* ignore */
    }
    // reconciled with server
  } catch (e) {
    bookmarkError.value = e.message
    console.error('[Detail] toggleBookmark failed', e)
    // Revert optimistic on failure
    try {
      const id = full.value?.scenario?.id
      const item = id ? store.items.find((s) => s.id === id) : null
      if (item && prevBookmark != null) item.bookmarked = prevBookmark
    } catch {
      /* ignore */
    }
  } finally {
    bookmarking.value = false
  }
}
const startScenario = async () => {
  if (!full.value) return
  startError.value = null
  try {
    starting.value = true
    await ScenariosAPI.start(scenarioId.value)
    await loadProgress()
    try {
      localStorage.setItem('currentScenarioId', String(scenarioId.value))
    } catch {
      /* ignore */
    }
  } catch (e) {
    startError.value = e.message
  } finally {
    starting.value = false
  }
}
const finishScenario = async () => {
  if (!full.value) return
  finishError.value = null
  try {
    finishing.value = true
    await ScenariosAPI.complete(scenarioId.value)
    await loadProgress()
  } catch (e) {
    finishError.value = e.message
  } finally {
    finishing.value = false
  }
}
const playCtaLabel = computed(() => {
  if (scenarioStatus.value === 'completed') return 'Rejouer'
  if (scenarioStatus.value === 'started') return 'Reprendre'
  return 'Jouer'
})
const onPlayClick = async () => {
  const id = scenarioId.value
  if (!id) return
  if (scenarioStatus.value === 'completed') {
    const ok = window.confirm(
      'Rejouer ce scénario va supprimer toute votre progression pour celui-ci. Continuer ?',
    )
    if (!ok) return
    try {
      await ScenariosAPI.unbookmark(id)
      await ScenariosAPI.start(id)
      await loadProgress()
    } catch (e) {
      console.error(e)
    }
  }
  try {
    localStorage.setItem('currentScenarioId', String(id))
  } catch {
    /* ignore */
  }
  router.push({ name: 'game-map', query: { scenario: id } }).catch(() => { })
}
const submitMission = async (m) => {
  initMissionAnswer(m.id)
  const entry = missionAnswers.value[m.id]
  entry.error = null
  if (!entry.value) {
    entry.error = 'Réponse requise'
    return
  }
  const expected = (m.answer_word || '').trim().toLowerCase()
  const given = entry.value.trim().toLowerCase()
  if (!expected || given !== expected) {
    entry.status = 'wrong'
    entry.error = 'Réponse incorrecte'
    return
  }
  entry.status = 'checking'
  try {
    await MissionsAPI.complete(m.id)
    await loadProgress(true)
    openMissions.value[m.id] = true
    entry.status = 'ok'
  } catch (e) {
    entry.status = 'idle'
    entry.error = e.message
  }
}
const loadProgress = async () => {
  try {
    const prog = await ScenariosAPI.getProgress(scenarioId.value)
    if (full.value) {
      const completedIds = (prog.missions || [])
        .filter((m) => m.completed)
        .map((m) => (m.id != null ? m.id : m._id_mission))
        .filter((v) => v != null)
        .map((v) => String(v))
      const byId = {}
      for (const pm of prog.missions || []) {
        const mid = pm.id != null ? pm.id : pm._id_mission
        if (mid != null)
          byId[String(mid)] = { locked: !!pm.locked, prerequisites: pm.prerequisites || [] }
      }
      if (Array.isArray(full.value.missions)) {
        full.value.missions = full.value.missions.map((m) => {
          const info = byId[String(m.id)] || {}
          return { ...m, locked: info.locked || false, prerequisites: info.prerequisites || [] }
        })
      }
      full.value.progress = { scenario: prog.progress, completedMissionIds: completedIds }
    }
  } catch {
    /* silent */
  }
}
// Prefer explicit server progress status; avoid heuristic fallback that can mislabel as "started"
const scenarioStatus = computed(() => {
  const s = full.value?.progress?.scenario?.status
  return s || 'not_started'
})
const allMissionsCompleted = computed(() => {
  if (!full.value) return false
  const list = full.value.missions || []
  if (!list.length) return false
  return list.every((m) => completedIdSet.value.has(String(m.id)))
})
const outroUnlocked = computed(
  () => allMissionsCompleted.value || scenarioStatus.value === 'completed',
)

// Bookmark state: prefer Pinia list (authoritative for favorites), fallback to full.*
const isBookmarked = computed(() => {
  const id = scenarioId.value
  const fromList = store.items.find((s) => s.id === id)
  if (fromList && typeof fromList.bookmarked === 'boolean') return fromList.bookmarked
  const p = full.value?.progress?.scenario?.bookmarked
  if (typeof p === 'boolean') return p
  const s = full.value?.scenario?.bookmarked
  return typeof s === 'boolean' ? s : false
})

const loadScenario = async () => {
  loading.value = true
  error.value = null
  try {
    full.value = await store.fetchFull(scenarioId.value, !store.fullCache[scenarioId.value])
    showIntro.value = false
    showOutro.value = false
    openMissions.value = {}
    missionAnswers.value = {}
    await loadProgress()
    const opened = await openMissionFromQuery()
    if (!opened) {
      if (scenarioStatus.value === 'not_started') {
        showIntro.value = true
      } else {
        const first = (full.value?.missions || []).find((m) => !missionLocked(m))
        if (first) openMissions.value[first.id] = true
      }
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Fusion des montages et nettoyage d'état
onMounted(() => {
  loadScenario()
  startGeolocation()
  autoTutorial("scenario_detail")
})
watch(scenarioId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    resetScenarioState()
    loadScenario()
  }
})
watch(
  () => route.query?.mission,
  async (nv, ov) => {
    if (nv !== ov && full.value) await openMissionFromQuery()
  },
)
onBeforeUnmount(stopGeolocation)
</script>

<template>
  <div class="p-scenario-detail">
    <div class="p-scenario-detail__header">
      <div class="p-scenario-detail__header-top">
        <button class="back-btn" type="button" @click="goBack" aria-label="Retour">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="p-scenario-detail__title">{{ scenarioTitle || '…' }}</h1>
        <button class="p-scenario-detail__bookmark-btn"
          :class="{ 'p-scenario-detail__bookmark-btn--active': isBookmarked }" :disabled="bookmarking"
          @click="toggleBookmarkDetail" :title="isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'">
          <span class="material-symbols-outlined" :class="{ 'p-scenario-detail__bookmark-icon--fill': isBookmarked }">
            bookmark
          </span>
        </button>
      </div>
      <div class="p-scenario-detail__toolbar">
        <button class="p-scenario-detail__play-btn" @click="onPlayClick" :title="playCtaLabel + ' sur la carte'">
          <span class="material-symbols-outlined">play_arrow</span>
          <span class="p-scenario-detail__play-label">{{ playCtaLabel }}</span>
        </button>

        <p v-if="bookmarkError" class="p-scenario-detail__error-msg">
          {{ bookmarkError }}
        </p>
      </div>
    </div>
    <div class="p-scenario-detail__body">
      <div v-if="loading" class="p-scenario-detail__placeholder">Chargement...</div>
      <div v-else-if="error" class="p-scenario-detail__error">Erreur: {{ error }}</div>
      <div v-else-if="!full" class="p-scenario-detail__empty">Introuvable</div>
      <div v-else class="p-scenario-detail__content">
        <!-- INTRO via CollapsibleCard -->
        <CollapsibleCard title="Introduction" :open="showIntro" :disabled="false" variant="intro"
          :completed="scenarioStatus !== 'not_started'" :locked="false" @toggle="toggleIntro">
          <template #indicator>
            <div v-if="scenarioStatus !== 'not_started'" class="c-collapsible-card__indicator"
              aria-label="Introduction vue" title="Introduction vue">
              <span class="material-symbols-outlined">check</span>
            </div>
          </template>
          <!-- BEGIN Intro Block A (original rendering) -->
          <div v-if="!full.introBlocks.length" class="c-collapsible-card__muted">
            Aucune introduction.
          </div>
          <div v-for="b in full.introBlocks" :key="b.id" class="c-collapsible-card__block"
            :class="b.type === 'image' ? 'c-collapsible-card__block--image' : ''">
            <p v-if="b.type === 'text'">{{ b.content_text }}</p>
            <figure v-else-if="b.type === 'image'">
              <img :src="b.url_media" :alt="b.caption || 'image'" />
              <figcaption v-if="b.caption">{{ b.caption }}</figcaption>
            </figure>
          </div>
          <!-- END Intro Block A (original rendering) -->

          <div class="c-collapsible-card__divider" />
          <div class="c-collapsible-card__intro-actions">
            <button v-if="scenarioStatus === 'not_started'"
              class="c-collapsible-card__btn c-collapsible-card__btn--primary" :disabled="starting"
              @click="startScenario" aria-label="Commencer l'aventure">
              {{ starting ? 'Démarrage…' : "Commencer l'aventure" }}
            </button>
            <p v-else class="c-collapsible-card__already-started">Scénario déjà démarré.</p>
            <p v-if="startError" class="c-collapsible-card__error-msg">{{ startError }}</p>
          </div>
        </CollapsibleCard>

        <!-- MISSIONS via ScenarioMissionItem -->
        <div class="p-scenario-detail__missions">
          <ScenarioMissionItem v-for="m in missions" :key="m.id" :mission="m" :open="openMissions[m.id]"
            :locked="missionLocked(m)" :completed="isCompleted(m.id)" :scenario-status="scenarioStatus"
            :answer-entry="missionAnswers[m.id] || null" :in-range="missionInRange(m)"
            :distance-text="missionDistanceText(m)" :lock-reason="missionLockReason(m)" @toggle="toggleMission"
            @init-answer="initMissionAnswer" @update-answer="
              ({ id, value }) => {
                initMissionAnswer(id)
                missionAnswers[id].value = value
              }
            " @submit="submitMission" />
        </div>

        <!-- OUTRO via CollapsibleCard -->
        <CollapsibleCard title="Conclusion" :open="showOutro" :disabled="!outroUnlocked" variant="outro"
          :completed="scenarioStatus === 'completed'" :locked="!outroUnlocked" @toggle="toggleOutro">
          <template #indicator>
            <div v-if="scenarioStatus === 'completed'" class="c-collapsible-card__indicator"
              aria-label="Scénario terminé" title="Scénario terminé">
              <span class="material-symbols-outlined">check</span>
            </div>
          </template>
          <!-- BEGIN Outro Block A (original rendering) -->
          <div v-if="!full.outroBlocks.length" class="p-scenario-detail__muted">
            Aucune conclusion.
          </div>
          <div v-for="b in full.outroBlocks" :key="b.id" class="c-collapsible-card__block"
            :class="b.type === 'image' ? 'c-collapsible-card__block--image' : ''">
            <p v-if="b.type === 'text'">{{ b.content_text }}</p>
            <figure v-else-if="b.type === 'image'">
              <img :src="b.url_media" :alt="b.caption || 'image'" />
              <figcaption v-if="b.caption">{{ b.caption }}</figcaption>
            </figure>
          </div>
          <!-- END Outro Block A (original rendering) -->

          <div class="c-collapsible-card__divider" />
          <div class="c-collapsible-card__outro-actions">
            <button class="c-collapsible-card__btn c-collapsible-card__btn--primary"
              :disabled="finishing || !allMissionsCompleted" @click="finishScenario" aria-label="Terminer le scénario">
              {{ finishing ? 'Validation…' : 'Terminer le scénario' }}
            </button>
            <p v-if="finishError" class="c-collapsible-card__error-msg">{{ finishError }}</p>
          </div>
        </CollapsibleCard>
      </div>
    </div>
  </div>
</template>
