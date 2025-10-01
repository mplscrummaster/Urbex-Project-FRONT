<script setup>
import { onMounted, ref, computed, watch } from 'vue'
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

function closeAll() {
  showIntro.value = false
  showOutro.value = false
  for (const k of Object.keys(openMissions.value)) openMissions.value[k] = false
}

function toggleIntro() {
  const willOpen = !showIntro.value
  closeAll()
  showIntro.value = willOpen
}

function toggleOutro() {
  // Gating: prevent opening conclusion until all missions are completed (unless already completed scenario)
  if (!outroUnlocked.value) return
  const willOpen = !showOutro.value
  closeAll()
  showOutro.value = willOpen
}

function toggleMission(missionId) {
  const mission = (full.value?.missions || []).find(m => m.id === missionId)
  if (mission && missionLocked(mission)) return
  const currently = !!openMissions.value[missionId]
  closeAll()
  if (!currently) openMissions.value[missionId] = true
}

async function loadScenario() {
  loading.value = true
  error.value = null
  try {
    full.value = await scenariosStore.fetchFull(routeId.value, true)
    // Reset collapses and answers
    showIntro.value = false
    showOutro.value = false
    openMissions.value = {}
    missionAnswers.value = {}
    // Load progress (adds lock states)
    await loadProgress(true)
    if (scenarioStatus.value === 'not_started') {
      showIntro.value = true
    } else {
      const first = (full.value?.missions || []).find(m => !missionLocked(m))
      if (first) openMissions.value[first.id] = true
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadScenario)

// Watch route id changes to reload scenario data
watch(routeId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    loadScenario()
  }
})

const missions = computed(() => (full.value?.missions || []).slice().sort((a, b) => a.position - b.position))
const isCompleted = (missionId) => full.value?.progress?.completedMissionIds?.includes(missionId)
// Answers state
const missionAnswers = ref({})
function initMissionAnswer(id) {
  if (!missionAnswers.value[id]) missionAnswers.value[id] = { value: '', status: 'idle', error: null }
}
const starting = ref(false)
const startError = ref(null)
const finishing = ref(false)
const finishError = ref(null)
async function startScenario() {
  if (!full.value) return
  startError.value = null
  try {
    starting.value = true
  await ScenariosAPI.start(routeId.value)
    // pas besoin de re-fetch complet tout de suite; recharger surtout la progression
    await loadProgress(true)
  } catch (e) {
    startError.value = e.message
  } finally {
    starting.value = false
  }
}
async function finishScenario() {
  if (!full.value) return
  finishError.value = null
  try {
    finishing.value = true
  await ScenariosAPI.complete(routeId.value)
    await loadProgress(true)
  } catch (e) {
    finishError.value = e.message
  } finally {
    finishing.value = false
  }
}
async function submitMission(m) {
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
    entry.status = 'ok'
  } catch (e) {
    entry.status = 'idle'
    entry.error = e.message
  }
}
// Charger/rafraîchir la progression utilisateur
async function loadProgress(force = false) {
  try {
  const prog = await ScenariosAPI.getProgress(routeId.value)
    if (full.value) {
      // Some progress endpoints return missions with `_id_mission` instead of `id`
      const completedIds = (prog.missions || [])
        .filter(m => m.completed)
        .map(m => (m.id != null ? m.id : m._id_mission))
        .filter(v => v != null)
      // Merge lock/prerequisite state
      const byId = {}
      for (const pm of (prog.missions || [])) {
        const mid = pm.id != null ? pm.id : pm._id_mission
        if (mid != null) byId[mid] = { locked: !!pm.locked, prerequisites: pm.prerequisites || [] }
      }
      if (Array.isArray(full.value.missions)) {
        full.value.missions = full.value.missions.map(m => ({
          ...m,
          locked: byId[m.id]?.locked || false,
          prerequisites: byId[m.id]?.prerequisites || []
        }))
      }
      full.value.progress = {
        scenario: prog.progress,
        completedMissionIds: completedIds,
      }
    }
  } catch (e) {
    if (force) console.warn('Impossible de charger la progression:', e.message)
    // laisser sans progression -> fallback not_started
  }
}

const scenarioStatus = computed(() => full.value?.progress?.scenario?.status || 'not_started')
// All missions completed?
const allMissionsCompleted = computed(() => {
  if (!full.value) return false
  const list = full.value.missions || []
  if (!list.length) return false
  const completedIds = full.value.progress?.completedMissionIds || []
  return list.every(m => completedIds.includes(m.id))
})
// Outro unlocked if all missions completed or scenario already marked completed
const outroUnlocked = computed(() => allMissionsCompleted.value || scenarioStatus.value === 'completed')
// Mission lock helpers
function missionLocked(m) {
  if (!m) return true
  if (scenarioStatus.value === 'not_started') return true
  if (isCompleted(m.id)) return false
  return !!m.locked
}
function missionLockReason(m) {
  if (scenarioStatus.value === 'not_started') return 'Commencez le scénario pour accéder aux missions'
  if (m.locked) return 'Complétez les missions prérequises'
  return ''
}
// Bookmark toggle
const bookmarking = ref(false)
const bookmarkError = ref(null)
async function toggleBookmarkDetail() {
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
</script>
<template>
  <div class="scenario-wrapper">
    <div v-if="loading" class="placeholder">Chargement...</div>
    <div v-else-if="error" class="error">Erreur: {{ error }}</div>
    <div v-else-if="!full" class="empty">Introuvable</div>
    <div v-else class="scenario">
      <header class="scenario__header">
        <h1 class="scenario__title">{{ full.scenario.title }}</h1>
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
        <div v-if="scenarioStatus !== 'not_started'" class="meta-badge small success" title="Introduction vue">
          <span class="material-symbols-outlined">check</span>
        </div>
        <h2 class="card__title">Introduction</h2>
        <img class="arrow" :class="{ rotated: showIntro }" src="/icons/arrow_drop_down_circle.svg" alt="toggle intro" @click="toggleIntro" />
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
          class="missionCard"
          :class="{ completed: isCompleted(m.id), locked: missionLocked(m) }"
        >
          <div v-if="isCompleted(m.id)" class="mission-complete-indicator" aria-label="Mission complétée" title="Mission complétée">
            <span class="material-symbols-outlined">check</span>
          </div>
          <h2 class="missionCard__title">Mission {{ m.position }} - {{ m.title }}</h2>
          <img
            class="arrow"
            :class="{ rotated: openMissions[m.id], disabled: missionLocked(m) && !isCompleted(m.id) }"
            src="/icons/arrow_drop_down_circle.svg"
            alt="toggle mission"
            @click="toggleMission(m.id)"
            :title="missionLockReason(m)"
          />
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
                <div class="question" v-if="m.riddle_text">{{ m.riddle_text }}</div>
                <div class="question" v-else>Entrez la réponse de cette mission</div>
                <div class="answer-row">
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
            </div>
          </Transition>
        </div>
      </div>

      <!-- OUTRO -->
      <div class="card outro-card" :class="{ completed: scenarioStatus === 'completed', locked: !outroUnlocked }">
        <div v-if="scenarioStatus === 'completed'" class="meta-badge small success" title="Scénario terminé">
          <span class="material-symbols-outlined">check</span>
        </div>
        <h2 class="card__title">Conclusion</h2>
        <img
          class="arrow"
          :class="{ rotated: showOutro, disabled: !outroUnlocked }"
          src="/icons/arrow_drop_down_circle.svg"
          alt="toggle outro"
          @click="toggleOutro"
          :title="!outroUnlocked ? 'Terminez toutes les missions pour déverrouiller la conclusion' : 'Afficher la conclusion'"
        />
        <Transition name="fade">
          <div v-show="showOutro" class="card__body">
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
              <template v-if="scenarioStatus === 'started'">
                <button
                  class="btn-primary finish-btn"
                  :disabled="finishing || !allMissionsCompleted"
                  @click="finishScenario"
                >
                  {{ finishing ? 'Validation…' : 'Terminer l\'aventure' }}
                </button>
                <p v-if="!allMissionsCompleted" class="info-msg">Terminez toutes les missions pour activer ce bouton.</p>
              </template>
              <p v-if="finishError" class="error-msg">{{ finishError }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/theme.scss' as *;
@use 'sass:color';

.scenario-wrapper { padding:1.2rem 0 5.5rem; }
.scenario { display:flex; flex-direction:column; gap:1.4rem; }
.scenario__header { display:flex; flex-direction:column; gap:.35rem; }
.scenario__title { margin:0; font-size:1.9rem; font-weight:650; background:linear-gradient(90deg,#fff,#b5c9ff); -webkit-background-clip:text; background-clip:text; color:transparent; letter-spacing:.5px; }
.scenario__meta { display:flex; gap:.75rem; flex-wrap:wrap; font-size:.65rem; text-transform:uppercase; letter-spacing:1px; color:$color-text-dim; }
.scenario__badge { @extend .pill-badge; }

// Unified card style
.card, .missionCard { @extend .elevated; background:$color-surface-alt; border:1px solid $color-border; border-radius:$radius-md; padding:14px 14px 12px; display:grid; grid-template-columns:1fr auto; position:relative; }
.card__title, .missionCard__title { margin:0; font-size:1rem; font-weight:600; color:$color-text; letter-spacing:.3px; }
.missionCard__title { position:relative; margin-right:2.2rem; }
.card__body, .missionCard__info { grid-column:1 / -1; margin-top:.6rem; display:flex; flex-direction:column; gap:.8rem; }
.missionCard { transition:background $transition,border-color $transition, box-shadow $transition; }
.missionCard.completed { /* neutral appearance */ position:relative; }
.missionCard.completed::before { display:none; }
.missionCard.locked { opacity:.55; position:relative; }
.missionCard.locked .missionCard__title { filter:grayscale(.2); }
.missionCard.locked .arrow { filter:grayscale(1) brightness(.55); cursor:not-allowed; }
.locked-hint { font-size:.65rem; color:$color-text-dim; background:rgba(255,255,255,.03); padding:.35rem .5rem; border:1px dashed $color-border; border-radius:$radius-sm; }
.missionCard:hover { background:$color-surface; }
.mission-complete-indicator { position:absolute; top:-8px; right:-8px; width:22px; height:22px; border-radius:50%; background:$color-success; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 2px $color-surface-alt, 0 2px 4px rgba(0,0,0,.45); pointer-events:none; z-index:5; }
.mission-complete-indicator .material-symbols-outlined { font-size:14px; line-height:1; color:#fff; font-variation-settings:'FILL' 1; }
.tick, .completed-badge, .completed-icon, .status-cluster, .dot { display:none !important; }
.meta-badge { position:absolute; top:-8px; right:-8px; width:22px; height:22px; border-radius:50%; background:$color-success; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 2px $color-surface-alt, 0 2px 4px rgba(0,0,0,.45); pointer-events:none; z-index:4; }
.meta-badge.small .material-symbols-outlined { font-size:14px; color:#fff; font-variation-settings:'FILL' 1; }
.outro-actions { display:flex; flex-direction:column; align-items:flex-start; gap:.5rem; }
.finish-btn { background:linear-gradient(90deg,$color-accent,#2563eb); }
.muted { font-size:.7rem; opacity:.55; }

.block.text { line-height:1.45; font-size:.85rem; color:$color-text; }
figure { margin:0; }
figure img { max-width:100%; border-radius:$radius-sm; display:block; }
figure figcaption { font-size:.55rem; opacity:.6; margin-top:2px; }

.arrow { width:1.9rem; cursor:pointer; transition: transform .3s, filter .3s; align-self:center; filter:brightness(.85); }
.arrow:hover { filter:brightness(1); }
.arrow.rotated { transform:rotate(180deg); }
.arrow.disabled { filter:grayscale(1) brightness(.5); cursor:not-allowed; }
.outro-card.locked { opacity:.6; }
.outro-card.locked .card__title { position:relative; }
.info-msg { font-size:.65rem; color:$color-text-dim; }

.placeholder, .error, .empty { color:$color-text-dim; }

/* Ensure consistent spacing between all collapsible sections (intro, each mission, conclusion) */
.missions-group { display:flex; flex-direction:column; gap:1.4rem; }

/* Fade reused */
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity:0; }

/* Buttons */
.btn-primary, .btn-secondary { cursor:pointer; font:inherit; font-weight:600; letter-spacing:.3px; border-radius:$radius-sm; padding:.55rem 1rem; border:1px solid transparent; transition:background $transition, color $transition, border-color $transition, box-shadow $transition; }
.btn-primary { background:$color-accent; color:#fff; box-shadow:0 2px 6px -1px rgba(0,0,0,.5); }
.btn-primary:hover:not(:disabled) { background:color.adjust($color-accent, $lightness: 5%); }
.btn-primary:disabled { opacity:.6; cursor:progress; }
.btn-secondary { background:$color-surface; color:$color-text; border-color:$color-border; }
.btn-secondary:hover:not(:disabled) { background:$color-surface-alt; }
.btn-secondary:disabled { opacity:.4; cursor:not-allowed; }

.intro-actions { display:flex; flex-direction:column; align-items:flex-start; gap:.5rem; }
.error-msg { color:$color-danger; font-size:.7rem; }

/* Mission answer form */
.mission-answer { margin-top:.9rem; padding:.9rem .9rem .95rem; border:1px solid $color-border; background:$color-bg-alt; border-radius:$radius-sm; display:flex; flex-direction:column; gap:.65rem; }
.mission-answer .question { font-size:.8rem; font-weight:600; letter-spacing:.4px; }
.answer-row { display:flex; gap:.6rem; }
.answer-input { flex:1; background:$color-surface; border:1px solid $color-border; border-radius:$radius-sm; padding:.55rem .7rem; color:$color-text; font:inherit; font-size:.8rem; }
.answer-input:focus { outline:2px solid $color-accent; outline-offset:2px; }
.feedback { min-height:1rem; font-size:.65rem; }
.feedback .ok { color:$color-success; }
.feedback .wrong { color:$color-danger; }

/* Bookmark button header */
.bookmark-btn { position:absolute; top:.2rem; right:.2rem; background:rgba(0,0,0,.25); border:1px solid $color-border; border-radius:8px; padding:.3rem .5rem .25rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background $transition, border-color $transition; }
.bookmark-btn:hover:not(:disabled) { background:$color-surface; border-color:$color-accent; }
.bookmark-btn:disabled { opacity:.5; cursor:progress; }
.bookmark-btn .material-symbols-outlined { font-size:22px; line-height:1; color:$color-text-dim; transition:color $transition; }
.bookmark-btn.active .material-symbols-outlined { color:$color-accent; }
.bookmark-btn .material-symbols-outlined.fill { font-variation-settings: 'FILL' 1; }
</style>
