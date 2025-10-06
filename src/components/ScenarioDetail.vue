<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useScenariosStore } from '@/stores/scenarios'
import { ScenariosAPI, MissionsAPI } from '@/services/api'

const route = useRoute()
const scenariosStore = useScenariosStore()
// Reactive scenario id based on route param
const routeId = computed(() => Number(route.params.id))

const loading = ref(true)
const error = ref(null)
const full = ref(null)
// intro / outro collapse
const showIntro = ref(false)
const showOutro = ref(false)
// mission-specific collapse state: id -> open bool (only one true max)
const openMissions = ref({})

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
  // Gating: prevent opening conclusion until all missions are completed (unless already completed scenario)
  if (!outroUnlocked.value) return
  const willOpen = !showOutro.value
  closeAll()
  showOutro.value = willOpen
}

const toggleMission = (missionId) => {
  const mission = (full.value?.missions || []).find(m => m.id === missionId)
  if (mission && missionLocked(mission)) return
  const currently = !!openMissions.value[missionId]
  closeAll()
  if (!currently) openMissions.value[missionId] = true
}

// Open a mission from route query (?mission=ID), returns true if opened
const openMissionFromQuery = async () => {
  const q = route.query
  const raw = q?.mission
  if (raw == null) return false
  const mid = Number(raw)
  if (!Number.isFinite(mid)) return false
  const m = (full.value?.missions || []).find(x => Number(x.id) === mid)
  if (!m) return false
  // allow opening even if completed; block if locked
  if (missionLocked(m) && !isCompleted(m.id)) return false
  closeAll()
  openMissions.value[m.id] = true
  showIntro.value = false
  showOutro.value = false
  await nextTick()
  try { document.getElementById(`mission-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch { /* noop */ }
  return true
}

const loadScenario = async () => {
  loading.value = true
  error.value = null
  try {
  // Only force fetch if not in cache; avoids duplicate parallel requests with parent view prefetch
  full.value = await scenariosStore.fetchFull(routeId.value, !scenariosStore.fullCache[routeId.value])
    // Reset collapses and answers
    showIntro.value = false
    showOutro.value = false
    openMissions.value = {}
    missionAnswers.value = {}
    // Load progress (adds lock states)
  await loadProgress()
    // Try open targeted mission from query first
    const opened = await openMissionFromQuery()
    if (!opened) {
      if (scenarioStatus.value === 'not_started') {
        showIntro.value = true
      } else {
        const first = (full.value?.missions || []).find(m => !missionLocked(m))
        if (first) openMissions.value[first.id] = true
      }
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadScenario)
// Start geolocation watcher alongside data load
onMounted(() => startGeolocation())

// Watch route id changes to reload scenario data
watch(routeId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    loadScenario()
  }
})

// Watch for query mission change to open the requested mission
watch(() => route.query?.mission, async (nv, ov) => {
  if (nv !== ov && full.value) {
    await openMissionFromQuery()
  }
})

const missions = computed(() => (full.value?.missions || []).slice().sort((a, b) => a.position - b.position))
// Normalize completed mission IDs to strings for robust comparison
const completedIdSet = computed(() => {
  const ids = full.value?.progress?.completedMissionIds || []
  return new Set(ids.map((v) => String(v)))
})
const isCompleted = (missionId) => completedIdSet.value.has(String(missionId))
// Answers state
const missionAnswers = ref({})
// Start/finish scenario action state holders
const starting = ref(false)
const startError = ref(null)
const finishing = ref(false)
const finishError = ref(null)
// Geolocation gating additions
const userLat = ref(null)
const userLon = ref(null)
const geoError = ref(null)
let geoWatchId = null
const RANGE_METERS = 50
const startGeolocation = () => {
  if (!navigator.geolocation) { geoError.value = 'Géolocalisation non supportée'; return }
  geoWatchId = navigator.geolocation.watchPosition(
    pos => { userLat.value = pos.coords.latitude; userLon.value = pos.coords.longitude },
    err => { geoError.value = err.message || 'Erreur géolocalisation' },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
  )
}
const stopGeolocation = () => { if (geoWatchId!=null && navigator.geolocation) { navigator.geolocation.clearWatch(geoWatchId); geoWatchId=null } }
const distanceMeters = (lat1, lon1, lat2, lon2) => {
  if ([lat1,lon1,lat2,lon2].some(v=>v==null)) return Infinity
  const R=6371000, toRad=d=>d*Math.PI/180
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1)
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
const missionInRange = (m) => { if (m.latitude==null || m.longitude==null) return true; return distanceMeters(userLat.value,userLon.value,m.latitude,m.longitude) <= RANGE_METERS }
const missionDistance = (m) => { if (m.latitude==null || m.longitude==null) return null; const d=distanceMeters(userLat.value,userLon.value,m.latitude,m.longitude); return Number.isFinite(d)?Math.round(d):null }
// Initialize a mission answer entry lazily
const initMissionAnswer = (mid) => {
  if (!missionAnswers.value[mid]) {
    missionAnswers.value[mid] = { value: '', status: 'idle', error: null }
  }
}
// Mission lock helpers (with robust fallbacks)
const missionLocked = (m) => {
  if (!m) return true
  // If scenario is not started, keep everything locked
  if (scenarioStatus.value === 'not_started') return true
  // Completed missions are never locked
  if (isCompleted(m.id)) return false
  // If backend provided explicit lock state, respect it
  if (typeof m.locked === 'boolean') return m.locked
  // Fallback 1: prerequisites list -> require all to be completed
  if (Array.isArray(m.prerequisites) && m.prerequisites.length) {
    return !m.prerequisites.every((pid) => completedIdSet.value.has(String(pid)))
  }
  // Fallback 2: sequential by position -> lock until all previous positions completed
  const prev = (missions.value || []).filter((x) => x.position != null && m.position != null && x.position < m.position)
  if (prev.length) {
    return !prev.every((x) => isCompleted(x.id))
  }
  return false
}
const missionLockReason = (m) => {
  if (scenarioStatus.value === 'not_started') return 'Commencez le scénario pour accéder aux missions'
  if (m.locked) return 'Complétez les missions prérequises'
  return ''
}
// Bookmark toggle
const bookmarking = ref(false)
const bookmarkError = ref(null)
const toggleBookmarkDetail = async () => {
  if (!full.value) return
  bookmarkError.value = null
  const isBookmarked = full.value.progress?.scenario.bookmarked
  const needsConfirm = isBookmarked && full.value.progress?.scenario.status !== 'not_started'
  const confirmCallback = async () => {
    if (!needsConfirm) return true
    return window.confirm('Retirer ce scénario supprimera aussi toute votre progression. Confirmer ?')
  }
  try {
    bookmarking.value = true
    await scenariosStore.toggleBookmark(full.value.scenario.id, { confirmCallback })
    // Recharger full si toujours présent (si unbookmark et statut not_started -> retiré de la liste mais on peut rester sur page)
    try {
  full.value = await scenariosStore.fetchFull(routeId.value, true)
    } catch {
      // ignorer (ex: progression supprimée)
    }
  } catch (e) {
    bookmarkError.value = e.message
  } finally {
    bookmarking.value = false
  }
}
const startScenario = async () => {
  if (!full.value) return
  startError.value = null
  try {
    starting.value = true
  await ScenariosAPI.start(routeId.value)
    // pas besoin de re-fetch complet tout de suite; recharger surtout la progression
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
  try {
    finishing.value = true
  await ScenariosAPI.complete(routeId.value)
  await loadProgress()
  } catch (e) {
    finishError.value = e.message
  } finally {
    finishing.value = false
  }
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
    // If this mission just became completed, keep it open for review
    openMissions.value[m.id] = true
    entry.status = 'ok'
  } catch (e) {
    entry.status = 'idle'
    entry.error = e.message
  }
}
// Charger/rafraîchir la progression utilisateur
const loadProgress = async () => {
  try {
  const prog = await ScenariosAPI.getProgress(routeId.value)
    if (full.value) {
      // Some progress endpoints return missions with `_id_mission` instead of `id`
      const completedIds = (prog.missions || [])
        .filter((m) => m.completed)
        .map((m) => (m.id != null ? m.id : m._id_mission))
        .filter((v) => v != null)
        .map((v) => String(v))
      // Merge lock/prerequisite state
      const byId = {}
      for (const pm of prog.missions || []) {
        const mid = pm.id != null ? pm.id : pm._id_mission
        if (mid != null) byId[String(mid)] = { locked: !!pm.locked, prerequisites: pm.prerequisites || [] }
      }
      if (Array.isArray(full.value.missions)) {
        full.value.missions = full.value.missions.map((m) => {
          const info = byId[String(m.id)] || {}
          return {
            ...m,
            locked: info.locked || false,
            prerequisites: info.prerequisites || [],
          }
        })
      }
      full.value.progress = {
        scenario: prog.progress,
        completedMissionIds: completedIds,
      }
    }
  } catch {
    // laisser sans progression -> fallback not_started (silent)
  }
}

// Derive scenario status if backend status is missing (no call to missionLocked to avoid cycles)
const scenarioStatus = computed(() => {
  const s = full.value?.progress?.scenario?.status
  if (s) return s
  const list = full.value?.missions || []
  if (!list.length) return 'not_started'
  // all completed -> completed
  if (list.every((m) => completedIdSet.value.has(String(m.id)))) return 'completed'
  // any completion -> started
  if (completedIdSet.value.size > 0) return 'started'
  // infer unlocked ignoring scenario gate
  const isUnlockedWithoutGate = (m) => {
    if (!m) return false
    if (isCompleted(m.id)) return true
    if (typeof m.locked === 'boolean') return !m.locked
    if (Array.isArray(m.prerequisites) && m.prerequisites.length) {
      return m.prerequisites.every((pid) => completedIdSet.value.has(String(pid)))
    }
    // sequential fallback by position
    if (m.position != null) {
      const prev = list.filter((x) => x.position != null && x.position < m.position)
      return prev.every((x) => completedIdSet.value.has(String(x.id)))
    }
    return true
  }
  if (list.some((m) => isUnlockedWithoutGate(m))) return 'started'
  return 'not_started'
})
// All missions completed?
const allMissionsCompleted = computed(() => {
  if (!full.value) return false
  const list = full.value.missions || []
  if (!list.length) return false
  return list.every((m) => completedIdSet.value.has(String(m.id)))
})
// Outro unlocked if all missions completed or scenario already marked completed
const outroUnlocked = computed(() => allMissionsCompleted.value || scenarioStatus.value === 'completed')
// Cleanup geolocation watcher when component unmounts
onBeforeUnmount(stopGeolocation)
</script>

<template>
  <div class="scenario-wrapper">
    <div v-if="loading" class="placeholder">Chargement...</div>
    <div v-else-if="error" class="error">Erreur: {{ error }}</div>
    <div v-else-if="!full" class="empty">Introuvable</div>
    <div v-else class="scenario">
      <header class="scenario__header">
  <h1 class="scenario__title">{{ full.scenario.title || full.scenario.title_scenario }}</h1>
        <div class="scenario__meta">
          <span class="scenario__status">Statut: {{ scenarioStatus }}</span>
          <span v-if="full.progress?.scenario.bookmarked" class="scenario__badge">Bookmark</span>
        </div>
        <button class="bookmark-btn" :class="{ active: full.progress?.scenario.bookmarked }" :disabled="bookmarking" @click="toggleBookmarkDetail" :title="full.progress?.scenario.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'">
          <span class="material-symbols-outlined" :class="{ fill: full.progress?.scenario.bookmarked }">{{ full.progress?.scenario.bookmarked ? 'bookmark' : 'bookmark_add' }}</span>
        </button>
        <p v-if="bookmarkError" class="error-msg" style="margin-top:.4rem;">{{ bookmarkError }}</p>
      </header>

      <!-- INTRO -->
      <div class="card intro-card" :class="{ started: scenarioStatus !== 'not_started' }">
        <div v-if="scenarioStatus !== 'not_started'" class="intro-complete-indicator" aria-label="Introduction vue" title="Introduction vue">
          <span class="material-symbols-outlined">check</span>
        </div>
        <h2 class="card__title">Introduction</h2>
        <button
          type="button"
          class="arrow material-symbols-outlined"
          :class="{ rotated: showIntro }"
          @click="toggleIntro"
          aria-label="Basculer l'introduction"
        >
          expand_more
        </button>
        <Transition name="fade">
          <div v-show="showIntro" class="card__body">
            <div v-if="!full.introBlocks.length" class="muted">Aucune introduction.</div>
            <div v-for="b in full.introBlocks" :key="b.id" class="block" :class="b.type">
              <p v-if="b.type === 'text'">{{ b.content_text }}</p>
              <figure v-else-if="b.type === 'image'">
                <img :src="b.url_media" :alt="b.caption || 'image'" />
                <figcaption v-if="b.caption">{{ b.caption }}</figcaption>
              </figure>
            </div>
            <div class="divider" />
            <div class="intro-actions">
              <button v-if="scenarioStatus === 'not_started'" class="btn-primary" :disabled="starting" @click="startScenario">
                {{ starting ? 'Démarrage…' : "Commencer l'aventure" }}
              </button>
              <p v-else class="already-started text-dim">Scénario déjà démarré.</p>
              <p v-if="startError" class="error-msg">{{ startError }}</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- MISSIONS -->
      <div class="missions-group">
        <div
          v-for="m in missions"
          :key="m.id"
          :id="`mission-${m.id}`"
          class="missionCard"
          :class="{ completed: isCompleted(m.id), locked: missionLocked(m), open: openMissions[m.id] }"
        >
          <div v-if="isCompleted(m.id)" class="mission-complete-indicator" aria-label="Mission complétée" title="Mission complétée">
            <span class="material-symbols-outlined">check</span>
          </div>
          <h2 class="missionCard__title">Mission {{ m.position }} - {{ m.title }}</h2>
          <button
            type="button"
            class="arrow material-symbols-outlined"
            :class="{ rotated: openMissions[m.id], disabled: missionLocked(m) && !isCompleted(m.id) }"
            @click="toggleMission(m.id)"
            :title="missionLockReason(m)"
            aria-label="Basculer la mission"
          >
            expand_more
          </button>
          <Transition name="fade">
            <div class="missionCard__info" v-show="openMissions[m.id]">
              <div v-if="!m.blocks.length" class="muted">Pas de contenu.</div>
              <p v-if="missionLocked(m) && !isCompleted(m.id)" class="locked-hint">{{ missionLockReason(m) }}</p>
              <div v-for="b in m.blocks" :key="b.id" class="block" :class="b.type">
                <p v-if="b.type === 'text'">{{ b.content_text }}</p>
                <figure v-else-if="b.type === 'image'">
                  <img :src="b.url_media" :alt="b.caption || 'image'" />
                  <figcaption v-if="b.caption">{{ b.caption }}</figcaption>
                </figure>
              </div>
              <div
                v-if="scenarioStatus !== 'not_started' && !isCompleted(m.id) && !missionLocked(m)"
                class="mission-answer"
              >
                <div class="question" v-if="m.riddle_text">
                  <span class="material-symbols-outlined">help</span>
                  {{ m.riddle_text }}
                </div>
                <div class="question" v-else>
                  <span class="material-symbols-outlined">help</span>
                  Entrez la réponse de cette mission
                </div>
                <div v-if="!missionInRange(m)" class="geo-hint">
                  <span class="material-symbols-outlined">near_me_disabled</span>
                  Cette mission est située à environ {{ missionDistance(m) }} mètres d'ici. Rendez-vous sur place pour répondre.
                </div>
                <div class="answer-row" v-else>
                  <input
                    :disabled="missionAnswers[m.id] && missionAnswers[m.id].status === 'checking'"
                    @focus="initMissionAnswer(m.id)"
                    :value="(missionAnswers[m.id] ? missionAnswers[m.id].value : '')"
                    @input="(e) => { initMissionAnswer(m.id); missionAnswers[m.id].value = e.target.value }"
                    @keyup.enter.prevent="submitMission(m)"
                    type="text"
                    class="answer-input"
                    placeholder="Votre réponse"
                  />
                  <button
                    class="btn-secondary"
                    :disabled="missionAnswers[m.id]?.status === 'checking' || !missionAnswers[m.id]?.value"
                    @click="submitMission(m)"
                  >
                    <span v-if="missionAnswers[m.id]?.status === 'checking'">…</span>
                    <span v-else>Valider</span>
                  </button>
                </div>
                <div class="feedback">
                  <span v-if="missionAnswers[m.id]?.status === 'ok'" class="ok">Mission validée ✔</span>
                  <span v-else-if="missionAnswers[m.id]?.status === 'wrong'" class="wrong">Mauvaise réponse</span>
                  <span v-else-if="missionAnswers[m.id]?.error" class="wrong">{{ missionAnswers[m.id].error }}</span>
                </div>
              </div>
              <!-- Completed mission review (show riddle & answer once solved) -->
              <div v-else-if="isCompleted(m.id)" class="mission-review">
                <div class="question" v-if="m.riddle_text">
                  <span class="material-symbols-outlined">help</span>
                  {{ m.riddle_text }}
                </div>
                <div class="question" v-else>
                  <span class="material-symbols-outlined">help</span>
                  Énigme
                </div>
                <div class="review-answer">
                  <span class="label">Réponse :</span>
                  <span class="value">{{ (m.answer_word || '').trim() || '—' }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- OUTRO -->
      <div class="card outro-card" :class="{ completed: scenarioStatus === 'completed', locked: !outroUnlocked }">
        <div v-if="scenarioStatus === 'completed'" class="outro-complete-indicator" aria-label="Scénario terminé" title="Scénario terminé">
          <span class="material-symbols-outlined">check</span>
        </div>
        <h2 class="card__title">Conclusion</h2>
        <button
          type="button"
          class="arrow material-symbols-outlined"
          :class="{ rotated: showOutro, disabled: !outroUnlocked }"
          @click="toggleOutro"
          aria-label="Basculer la conclusion"
        >
          expand_more
        </button>
        <Transition name="fade">
          <div class="card__body" v-show="showOutro">
            <div v-if="!full.outroBlocks.length" class="muted">Aucune conclusion.</div>
            <div v-for="b in full.outroBlocks" :key="b.id" class="block" :class="b.type">
              <p v-if="b.type === 'text'">{{ b.content_text }}</p>
              <figure v-else-if="b.type === 'image'">
                <img :src="b.url_media" :alt="b.caption || 'image'" />
                <figcaption v-if="b.caption">{{ b.caption }}</figcaption>
              </figure>
            </div>
            <div class="divider" />
            <div class="outro-actions">
              <button class="btn-primary" :disabled="finishing || !allMissionsCompleted" @click="finishScenario">
                {{ finishing ? 'Validation…' : 'Terminer le scénario' }}
              </button>
              <p v-if="finishError" class="error-msg">{{ finishError }}</p>
            </div>
          </div>
        </Transition>
      </div>

    </div>
  </div>
</template>

<style scoped>
.scenario-wrapper { padding: .4rem .6rem 1.2rem; }
.scenario__header { position: sticky; top: 48px; z-index: 5; background: rgba(10,14,22,.85); backdrop-filter: blur(8px); padding: .4rem .25rem .3rem; margin: 0 -.25rem .6rem; display: flex; align-items: center; gap: .5rem; border-bottom: 1px solid rgba(255,255,255,.06); }
.scenario__title { margin: 0; font-size: 1.1rem; font-weight: 600; }
.scenario__meta { display: flex; gap: .5rem; align-items: center; margin-left: auto; }
.scenario__status { font-size: .85rem; color: #d3daf1; opacity: .85; }
.scenario__badge { background: #334155; color: #cbd5e1; padding: .15rem .45rem; border-radius: 999px; font-size: .75rem; border: 1px solid rgba(255,255,255,.15); }
.bookmark-btn { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15); color: #cbd5e1; padding: .35rem .6rem; border-radius: 10px; cursor: pointer; }
.bookmark-btn.active { color: #fff; border-color: rgba(255,255,255,.35); }
.bookmark-btn .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'opsz' 24 }
.bookmark-btn .material-symbols-outlined.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'opsz' 24 }
.card { background: rgba(15,17,26,.55); padding: .75rem .75rem; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; margin: .75rem 0; position: relative; overflow: hidden; }
.intro-card, .outro-card { overflow: visible; }
.card .divider { height: 1px; background: rgba(255,255,255,.08); margin: .8rem 0; }
.card__title { margin: 0; font-size: 1rem; font-weight: 600; letter-spacing: .5px; }
.intro-card.started .card__title { opacity: .75; }
.arrow { width: 28px; height: 28px; position: absolute; right: .5rem; top: .45rem; display: inline-flex; align-items:center; justify-content:center; border: none; background: transparent; color: #60a5fa; cursor: pointer; z-index: 1; transition: transform .18s ease, color .18s ease, opacity .18s ease; }
.arrow.rotated { transform: rotate(180deg); }
.arrow:hover { color: #93c5fd; }
.arrow.disabled { color: #64748b; opacity: .7; cursor: default; }
.missions-group { display: flex; flex-direction: column; gap: .75rem; }
.missionCard { position: relative; background: rgba(20,22,31,.55); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; overflow: visible; box-shadow: 0 1px 2px rgba(0,0,0,.25); }
.missionCard.open { border-color: rgba(255,255,255,.18); box-shadow: 0 2px 8px rgba(0,0,0,.2); }
.missionCard.completed { background: rgba(25,28,38,.5); }
.missionCard.locked .missionCard__title { opacity: .6 }
.missionCard__title { margin: 0; padding: .6rem 2.2rem .55rem .75rem; font-size: .95rem; font-weight: 600; display: flex; align-items: center; gap: .5rem; }
.missionCard__info { padding: .35rem .6rem .75rem; }
.mission-complete-indicator { position: absolute; right: -7px; top: -7px; display: inline-flex; width: 22px; height: 22px; border-radius: 999px; background: rgba(31,41,55,.9); color:#34d399; border:2px solid rgba(52,211,153,.5); align-items:center; justify-content:center; box-shadow: 0 2px 8px rgba(0,0,0,.4); z-index: 2; pointer-events: none; }
.mission-complete-indicator .material-symbols-outlined { font-size: 16px; }
.intro-complete-indicator, .outro-complete-indicator { position: absolute; right: -7px; top: -7px; display: inline-flex; width: 22px; height: 22px; border-radius: 999px; background: rgba(31,41,55,.9); color:#34d399; border:2px solid rgba(52,211,153,.5); align-items:center; justify-content:center; box-shadow: 0 2px 8px rgba(0,0,0,.4); z-index: 2; pointer-events: none; }
.intro-complete-indicator .material-symbols-outlined, .outro-complete-indicator .material-symbols-outlined { font-size: 16px; }
.block { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: .55rem .6rem; margin: .5rem 0; }
.block.image { padding: .35rem; overflow: hidden; }
.block.image img { width: 100%; height: auto; display: block; border-radius: 8px; }
.mission-answer { background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.1); border-radius: 10px; padding: .55rem; margin-top: .6rem; }
.mission-answer .question { display:flex; align-items:flex-start; gap:.4rem; font-weight:600; color:#e5e7eb; letter-spacing:.2px; margin-bottom:.35rem; }
.mission-answer .question .material-symbols-outlined { font-size:18px; opacity:.9; color:#93c5fd; line-height:1; }
.mission-review .question { display:flex; align-items:flex-start; gap:.4rem; font-weight:600; color:#dbeafe; letter-spacing:.2px; margin-bottom:.35rem; }
.mission-review .question .material-symbols-outlined { font-size:18px; opacity:.95; color:#93c5fd; line-height:1; }
.answer-row { display: flex; align-items: center; gap: .5rem; }
.answer-input { flex: 1; background: #111827; border: 1px solid #334155; border-radius: 8px; color: #e5e7eb; padding: .5rem .65rem; outline: none; }
.btn-secondary { background: #1f2937; border: 1px solid #374151; color: #e5e7eb; padding: .45rem .75rem; border-radius: 8px; cursor: pointer; }
.btn-secondary:hover { background: #243244; border-color: #415169; }
.feedback { min-height: 1.2rem; margin-top: .35rem; font-size: .9rem; }
.ok { color: #34d399; }
.wrong { color: #f87171; }
.geo-hint { display:flex; align-items:flex-start; gap:.35rem; background: rgba(56,189,248,.08); border:1px solid rgba(56,189,248,.22); color:#cdeffd; padding:.45rem .55rem; border-radius:8px; margin:.35rem 0 .5rem; font-size:.9rem; }
.geo-hint .material-symbols-outlined { font-size:18px; line-height:1; color:#7dd3fc; }
.locked-hint { font-size: .85rem; color: #d1d9e6; opacity: .85; margin: .25rem 0; }
.meta-badge { background: rgba(255,255,255,.07); display: inline-flex; align-items:center; gap: .3rem; padding: .18rem .4rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.15); }
.meta-badge.small { font-size: .8rem; }
.outro-card.completed .card__title { opacity: .75; }
.outro-card.locked { opacity: 1; }
.outro-card.locked .card__title { opacity: .6 }
.outro-card.locked .card__body { opacity: .9 }
.outro-actions { display: flex; gap: .5rem; align-items: center; }
.btn-primary { background: linear-gradient(90deg,#4338ca,#6366f1); border: none; color: #fff; padding: .55rem .9rem; border-radius: 8px; cursor: pointer; }
.btn-primary:disabled { opacity: .65; cursor: not-allowed; }
.error-msg { color: #ef4444; margin: .2rem 0 0; }
.placeholder, .empty, .error { padding: 1rem; text-align: center; color: #d1d5db; }
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>