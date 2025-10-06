<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useScenariosStore } from '@/stores/scenarios'
import { ScenariosAPI, MissionsAPI } from '@/services/api'

const route = useRoute()
const scenariosStore = useScenariosStore()
const routeId = computed(() => Number(route.params.id))

// States
const loading = ref(true)
const error = ref(null)
const full = ref(null)
const showIntro = ref(false)
const showOutro = ref(false)
const openMissions = ref({})
const missionAnswers = ref({})
const starting = ref(false)
const finishing = ref(false)
const startError = ref(null)
const finishError = ref(null)

// Geolocation
const userLat = ref(null)
const userLon = ref(null)
const geoError = ref(null)
let geoWatchId = null
const RANGE_METERS = 50

const distanceMeters = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some(v => v == null)) return Infinity
  const R = 6371000
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const missionInRange = m => {
  if (m.latitude == null || m.longitude == null) return true
  return distanceMeters(userLat.value, userLon.value, m.latitude, m.longitude) <= RANGE_METERS
}

const missionDistance = m => {
  if (m.latitude == null || m.longitude == null) return null
  const d = distanceMeters(userLat.value, userLon.value, m.latitude, m.longitude)
  return Number.isFinite(d) ? Math.round(d) : null
}

// Collapses
const closeAll = () => {
  showIntro.value = false
  showOutro.value = false
  for (const k of Object.keys(openMissions.value)) openMissions.value[k] = false
}

const toggleIntro = () => {
  const willOpen = !showIntro.value
  closeAll()
  showIntro.value = willOpen
}

const toggleOutro = () => {
  if (!outroUnlocked.value) return
  const willOpen = !showOutro.value
  closeAll()
  showOutro.value = willOpen
}

const toggleMission = missionId => {
  const mission = full.value?.missions.find(m => m.id === missionId)
  if (mission && missionLocked(mission)) return
  const currently = !!openMissions.value[missionId]
  closeAll()
  if (!currently) openMissions.value[missionId] = true
}

// Load scenario and progress
const loadScenario = async () => {
  loading.value = true
  error.value = null
  try {
    full.value = await scenariosStore.fetchFull(routeId.value, !scenariosStore.fullCache[routeId.value])
    showIntro.value = false
    showOutro.value = false
    openMissions.value = {}
    missionAnswers.value = {}
    await loadProgress()
    if (scenarioStatus.value === 'not_started') showIntro.value = true
    else {
      const first = full.value.missions.find(m => !missionLocked(m))
      if (first) openMissions.value[first.id] = true
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Progress
const loadProgress = async () => {
  try {
    const prog = await ScenariosAPI.getProgress(routeId.value)
    if (!full.value) return
    const completedIds = (prog.missions || [])
      .filter(m => m.completed)
      .map(m => m.id ?? m._id_mission)
      .filter(Boolean)
    const byId = {}
    for (const pm of prog.missions || []) {
      const mid = pm.id ?? pm._id_mission
      if (mid != null) byId[mid] = { locked: !!pm.locked, prerequisites: pm.prerequisites || [] }
    }
    if (Array.isArray(full.value.missions)) {
      full.value.missions = full.value.missions.map(m => ({
        ...m,
        locked: byId[m.id]?.locked || false,
        prerequisites: byId[m.id]?.prerequisites || []
      }))
    }
    full.value.progress = { scenario: prog.progress, completedMissionIds: completedIds }
  } catch { alert('Impossible de charger votre progression') }
}

// Scenario helpers
const scenarioStatus = computed(() => full.value?.progress?.scenario?.status || 'not_started')
const allMissionsCompleted = computed(() => {
  if (!full.value) return false
  return full.value.missions.every(m => full.value.progress?.completedMissionIds.includes(m.id))
})
const outroUnlocked = computed(() => allMissionsCompleted.value || scenarioStatus.value === 'completed')

// Mission helpers
const isCompleted = missionId => full.value?.progress?.completedMissionIds?.includes(missionId)
const initMissionAnswer = mid => {
  if (!missionAnswers.value[mid]) missionAnswers.value[mid] = { value: '', status: 'idle', error: null }
}
const missionLocked = m => !m || (scenarioStatus.value === 'not_started') || (!isCompleted(m.id) && m.locked)
const missionLockReason = m => {
  if (scenarioStatus.value === 'not_started') return 'Commencez le scénario pour accéder aux missions'
  if (m.locked) return 'Complétez les missions prérequises'
  return ''
}

// Scenario actions
const startScenario = async () => {
  if (!full.value) return
  startError.value = null
  starting.value = true
  try {
    await ScenariosAPI.start(routeId.value)
    await loadProgress()
  } catch (e) {
    startError.value = e.message
  } finally {
    starting.value = false
  }
}

const finishScenario = async () => {
  if (!full.value) return
  finishError.value = null
  finishing.value = true
  try {
    await ScenariosAPI.complete(routeId.value)
    await loadProgress()
  } catch (e) {
    finishError.value = e.message
  } finally {
    finishing.value = false
  }
}

const submitMission = async m => {
  initMissionAnswer(m.id)
  const entry = missionAnswers.value[m.id]
  entry.error = null
  if (!entry.value) return (entry.error = 'Réponse requise')
  if ((m.answer_word || '').trim().toLowerCase() !== entry.value.trim().toLowerCase()) {
    entry.status = 'wrong'
    entry.error = 'Réponse incorrecte'
    return
  }
  entry.status = 'checking'
  try {
    await MissionsAPI.complete(m.id)
    await loadProgress(true)
    entry.status = 'ok'
  } catch (e) {
    entry.status = 'idle'
    entry.error = e.message
  }
}

// Geolocation
const startGeolocation = () => {
  if (!navigator.geolocation) return (geoError.value = 'Géolocalisation non supportée')
  geoWatchId = navigator.geolocation.watchPosition(
    pos => { userLat.value = pos.coords.latitude; userLon.value = pos.coords.longitude },
    err => { geoError.value = err.message || 'Erreur géolocalisation' },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
  )
}
const stopGeolocation = () => { if (geoWatchId != null) navigator.geolocation.clearWatch(geoWatchId) }

onMounted(() => { loadScenario(); startGeolocation() })
onBeforeUnmount(stopGeolocation)

watch(routeId, (newVal, oldVal) => { if (newVal !== oldVal) loadScenario() })
</script>

<template>
  <div class="scenarioWrapper">

    <!-- Loading / Error -->
    <div v-if="loading" class="placeholder">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!full" class="empty">Introuvable</div>

    <!-- Scenario Content -->
    <div v-else>

      <!-- Header -->
      <div class="scenarioHeader">
        <h1 class="cardTitle">{{ full.scenario.title || full.scenario.title_scenario }}</h1>
        <div class="scenarioMeta">
          <span>Status: {{ scenarioStatus }}</span>

          <!-- Bookmark button instead of badge -->
          <button class="bookmark-btn" :class="{ active: full.progress?.scenario.bookmarked }" :disabled="bookmarking"
            @click="toggleBookmarkDetail"
            :title="full.progress?.scenario.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'">
            <span class="material-symbols-outlined" :class="{ fill: full.progress?.scenario.bookmarked }">
              {{ full.progress?.scenario.bookmarked ? 'bookmark' : 'bookmark_add' }}
            </span>
          </button>
        </div>
      </div>


      <!-- Intro -->
      <div class="introCard">
        <div class="cardHeader" @click="toggleIntro">
          <h2 class="cardTitle">Introduction</h2>
          <img class="arrow" :class="{ rotated: showIntro }" src="/icons/arrow_drop_down_circle.svg" />
        </div>
        <transition name="fade">
          <div class="cardBody" v-show="showIntro">
            <div v-if="!full.introBlocks.length" class="muted">Aucune introduction.</div>
            <div v-for="b in full.introBlocks" :key="b.id" class="block" :class="b.type">
              <p v-if="b.type === 'text'">{{ b.content_text }}</p>
              <img v-else-if="b.type === 'image'" :src="b.url_media" :alt="b.caption || 'image'" />
            </div>
            <div class="actions">
              <button v-if="scenarioStatus === 'not_started'" class="btnPrimary" @click="startScenario"
                :disabled="starting">
                {{ starting ? 'Démarrage…' : 'Commencer' }}
              </button>
              <p v-else class="muted">Scénario déjà démarré.</p>
              <p v-if="startError" class="wrong">{{ startError }}</p>
            </div>
          </div>
        </transition>
      </div>

      <!-- Missions -->
      <div class="missionsGroup">
        <div v-for="m in full.missions" :key="m.id" class="missionCard"
          :class="{ completed: isCompleted(m.id), locked: missionLocked(m) }">
          <div class="missionCardHeader" @click="toggleMission(m.id)">
            <h2 class="missionCardTitle">Mission {{ m.position }} - {{ m.title }}</h2>
            <img class="arrow" :class="{ rotated: openMissions[m.id], disabled: missionLocked(m) }"
              src="/icons/arrow_drop_down_circle.svg" />
          </div>

          <transition name="fade">
            <div class="missionBody" v-show="openMissions[m.id]">
              <div v-if="missionLocked(m) && !isCompleted(m.id)" class="lockedHint">{{ missionLockReason(m) }}</div>

              <div v-for="b in m.blocks" :key="b.id" class="block" :class="b.type">
                <p v-if="b.type === 'text'">{{ b.content_text }}</p>
                <img v-else-if="b.type === 'image'" :src="b.url_media" :alt="b.caption || 'image'" />
              </div>

              <!-- Answer input -->
              <div v-if="!missionLocked(m) && !isCompleted(m.id) && scenarioStatus !== 'not_started'"
                class="missionAnswer">
                <div v-if="!missionInRange(m)" class="geoHint">Rendez-vous sur place pour répondre. Distance: {{
                  missionDistance(m) }} m</div>
                <div v-else class="answerRow">
                  <input type="text" placeholder="Votre réponse" :value="missionAnswers[m.id]?.value"
                    @input="e => { initMissionAnswer(m.id); missionAnswers[m.id].value = e.target.value }"
                    :disabled="missionAnswers[m.id]?.status === 'checking'" @keyup.enter.prevent="submitMission(m)" />
                  <button class="btnPrimary" @click="submitMission(m)"
                    :disabled="!missionAnswers[m.id]?.value || missionAnswers[m.id]?.status === 'checking'">
                    {{ missionAnswers[m.id]?.status === 'checking' ? '…' : 'Valider' }}
                  </button>
                </div>
                <div class="feedback">
                  <span v-if="missionAnswers[m.id]?.status === 'ok'" class="ok">✔ Mission validée</span>
                  <span v-else-if="missionAnswers[m.id]?.status === 'wrong'" class="wrong">❌ Mauvaise réponse</span>
                  <span v-else-if="missionAnswers[m.id]?.error" class="wrong">{{ missionAnswers[m.id].error }}</span>
                </div>
              </div>

              <!-- Completed mission review -->
              <div v-else-if="isCompleted(m.id)" class="missionReview">
                <div>Réponse: {{ (m.answer_word || '').trim() || '—' }}</div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Outro -->
      <div class="outroCard">
        <div class="cardHeader" @click="toggleOutro">
          <h2 class="cardTitle">Conclusion</h2>
          <img class="arrow" :class="{ rotated: showOutro, disabled: !outroUnlocked }"
            src="/icons/arrow_drop_down_circle.svg" />
        </div>
        <transition name="fade">
          <div class="cardBody" v-show="showOutro">
            <div v-if="!full.outroBlocks.length" class="muted">Aucune conclusion.</div>
            <div v-for="b in full.outroBlocks" :key="b.id" class="block" :class="b.type">
              <p v-if="b.type === 'text'">{{ b.content_text }}</p>
              <img v-else-if="b.type === 'image'" :src="b.url_media" :alt="b.caption || 'image'" />
            </div>
            <div class="actions">
              <button class="btnPrimary" @click="finishScenario" :disabled="!allMissionsCompleted || finishing">
                {{ finishing ? 'Validation…' : 'Terminer le scénario' }}
              </button>
              <p v-if="finishError" class="wrong">{{ finishError }}</p>
            </div>
          </div>
        </transition>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as *;

/* General wrapper */
.scenarioWrapper {
  padding: 0.4rem 0.5rem 0.8rem;
  font-family: 'Inter', sans-serif;
  color: #e5e7eb;
}

/* Header */
.scenarioHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 14, 22, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 5;
}

.cardTitle,
.missionCardTitle {
  margin: 0;
  padding: 0.4rem 0.5rem;
  font-size: 1rem;
}

.scenarioMeta {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}


/* Card base style */
.introCard,
.outroCard,
.missionCard,
.scenarioHeader {
  background: rgba(15, 17, 26, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin: 0.5rem 0;
  padding: 0.5rem;
  overflow: hidden;
}

/* Card header */
.cardHeader,
.missionCardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

/* Arrow icon */
.arrow {
  width: 24px;
  height: 24px;
  transition: transform 0.25s ease;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.arrow.disabled {
  opacity: 0.4;
  cursor: default;
}

/* Card body content */
.cardBody,
.missionBody {
  padding: 0.35rem 0.5rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.block {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
}

.block.image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 5px;
}

/* Missions */
.missionsGroup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.missionCard.completed {
  background: rgba(25, 28, 38, 0.5);
}

.missionCard.locked .missionCardTitle {
  opacity: 0.6;
}

.missionAnswer {
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 0.4rem;
  margin-top: 0.4rem;
}

.answerRow {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

input[type="text"] {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #111827;
  color: #e5e7eb;
  outline: none;
}

input[type="text"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btnPrimary {
  background: linear-gradient(90deg, #4338ca, #6366f1);
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
}

.btnPrimary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.feedback {
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.ok {
  color: #34d399;
}

.wrong {
  color: #f87171;
}

/* Misc */
.muted {
  opacity: 0.7;
  font-size: 0.85rem;
}

.lockedHint,
.geoHint {
  font-size: 0.8rem;
  opacity: 0.75;
  color: #d1d9e6;
}

.placeholder,
.empty,
.error {
  text-align: center;
  padding: 0.8rem;
  font-size: 0.95rem;
  color: #d1d5db;
}

.bookmark-btn {
  background: rgba(0, 0, 0, .25);
  border: 1px solid $color-border;
  border-radius: 8px;
  padding: .3rem .5rem .25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .25s, border-color .25s;
}

.bookmark-btn:hover {
  background: $color-surface-alt;
  border-color: $color-accent;
}

.bookmark-btn .material-symbols-outlined {
  font-size: 20px;
  line-height: 1;
  color: $color-text-dim;
  transition: color .25s;
}

.bookmark-btn.active .material-symbols-outlined {
  color: $color-accent;
}

.bookmark-btn .material-symbols-outlined.fill {
  font-variation-settings: 'FILL' 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
