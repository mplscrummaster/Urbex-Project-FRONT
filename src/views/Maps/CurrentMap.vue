<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useScenariosStore } from '@/stores/scenarios'
import { ScenariosAPI } from '@/services/api'
import ScenarioCard from '@/components/ScenarioCard.vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { createBaseMap, withLayerGroup } from '@/composables/useLeafletMap'

// Elements & map instance refs
const mapEl = ref(null)
let map
const userMarker = ref(null)
const missionLayer = ref(null)
const { coords, error: geoError, locating, start: startGeo, once: onceGeo, stop: stopGeo } = useGeolocation({ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 })

const scenariosStore = useScenariosStore()
const route = useRoute()
const full = ref(null)
let userLocatedOnce = false
let mapFittedToMissions = false
const router = useRouter()
let suppressCloseOnMove = false
// basemap picker removed

// Sélection explicite via query ?scenario=ID sinon heuristique: started (le plus récent) puis premier not_started
const persistedScenarioId = ref(null)
const selectedScenarioId = computed(() => {
  const raw = route.query?.scenario
  const id = Number(raw)
  if (Number.isFinite(id)) return id
  return Number.isFinite(persistedScenarioId.value) ? persistedScenarioId.value : null
})
const currentScenario = computed(() => {
  const items = scenariosStore.items || []
  // if explicit selection matches an item, use it
  if (selectedScenarioId.value) {
    const picked = items.find((s) => s.id === selectedScenarioId.value)
    if (picked) return picked
  }
  // fallback: most recently started
  const started = items
    .filter((s) => s.status === 'started')
    .sort((a, b) => (Date.parse(b.startedAt || 0) || 0) - (Date.parse(a.startedAt || 0) || 0))
  if (started.length) return started[0]
  // else: first not_started
  return items.find((s) => s.status === 'not_started') || null
})

const loadFullIfNeeded = async () => {
  if (!currentScenario.value) return
  full.value = await scenariosStore.fetchFull(currentScenario.value.id, true)
  await loadProgressState()
  plotMissions()
}

const initMap = () => {
  if (map) return
  const { map: m } = createBaseMap(mapEl.value, {
    zoomControl: false,
    minZoom: 3,
    maxZoom: 20,
    preferCanvas: true,
    interactions: { scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, boxZoom: true }
  })
  map = m
  missionLayer.value = withLayerGroup(map)
  // Close any open popups when user drags or zooms the map (avoid closing on autopan)
  map.on('dragstart', () => {
    if (suppressCloseOnMove) return
    try { map.closePopup() } catch { /* noop */ }
  })
  map.on('zoomstart', () => {
    if (suppressCloseOnMove) return
    try { map.closePopup() } catch { /* noop */ }
  })
}

const plotMissions = () => {
  if (!map || !missionLayer.value) return
  missionLayer.value.clearLayers()
  if (!full.value?.missions?.length) return
  const missions = full.value.missions.slice().sort((a,b)=>a.position-b.position)
  const bounds = []
  for (const m of missions) {
    if (m.latitude == null || m.longitude == null) continue
    const marker = L.marker([m.latitude, m.longitude], { title: m.title, icon: createMissionIcon(m) })
    const canGo = !m.locked
    const safeTitle = (m.title || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    const popupHtml = `
      <div class="mission-popup">
        <div class="mission-popup__title">${m.position ? 'Mission ' + m.position + ' – ' : ''}${safeTitle}</div>
        <button class="mission-popup__btn${canGo ? '' : ' disabled'}" data-id="${m.id}" ${canGo ? '' : 'disabled title="Mission bloquée"'}>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>`
  marker.bindPopup(popupHtml, { autoPan: true, autoPanPaddingTopLeft: [20, 80], autoPanPaddingBottomRight: [20, 100], closeButton: false, className: 'mission-popup-wrapper', offset: [0, 6] })
    marker.on('popupopen', (e) => {
      // Autopan may move the map when opening the popup; don't close it during this movement
      suppressCloseOnMove = true
      const clear = () => { suppressCloseOnMove = false }
      // Use once listeners to release after the first settling
      map.once('moveend', clear)
      map.once('zoomend', clear)
      // Fallback safety in case no move events fire
      setTimeout(() => { suppressCloseOnMove = false }, 800)
      const el = e?.popup?.getElement?.()
      if (!el) return
      const btn = el.querySelector('.mission-popup__btn')
      if (btn && !btn.disabled) {
        btn.addEventListener('click', () => {
          if (!currentScenario.value) return
          router.push({ name: 'scenario-detail', params: { id: currentScenario.value.id }, query: { from: 'current', mission: m.id } })
        }, { once: true })
      }
    })
    missionLayer.value.addLayer(marker)
    bounds.push([m.latitude, m.longitude])
  }
  // Nouvel algorithme: on NE recentre PAS sur les missions tant que la géoloc utilisateur est en cours.
  // On ne fit que si la géolocalisation a échoué (userLocatedOnce = false et locating = false)
  if (bounds.length && !mapFittedToMissions && !userLocatedOnce && !locating.value) {
    const latLngBounds = L.latLngBounds(bounds)
    map.fitBounds(latLngBounds.pad(0.2))
    mapFittedToMissions = true
  }
}

const missionCompleted = (m) => !!m?.completed

const createMissionIcon = (m) => {
  const completed = missionCompleted(m)
  const locked = !!m?.locked
  const statusClass = completed ? 'completed' : locked ? 'locked' : 'pending'
  const cls = [ 'mission-marker', statusClass ].join(' ')
  const icon = completed ? 'check' : 'explore'
  const html = `<div class="${cls}" aria-label="Mission">
    <div class="mission-marker__inner">
      <span class="mission-marker__icon material-symbols-outlined">${icon}</span>
    </div>
  </div>`
  return L.divIcon({
    html,
    className: 'mission-marker-wrapper', // keep wrapper minimal (Leaflet requirement)
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -24]
  })
}

// Enrich missions with locked/completed from progress endpoint
const loadProgressState = async () => {
  if (!currentScenario.value) return
  try {
    const prog = await ScenariosAPI.getProgress(currentScenario.value.id)
    const byId = new Map()
    for (const pm of prog.missions || []) {
      const mid = pm.id != null ? pm.id : pm._id_mission
      if (mid != null) byId.set(Number(mid), { locked: !!pm.locked, completed: !!pm.completed, prerequisites: pm.prerequisites || [] })
    }
    if (Array.isArray(full.value?.missions)) {
      full.value.missions = full.value.missions.map((m) => {
        const st = byId.get(Number(m.id)) || {}
        return { ...m, locked: !!st.locked, completed: !!st.completed, prerequisites: st.prerequisites || [] }
      })
    }
  } catch {
    // silently ignore; we still render missions without state
  }
}

const createUserIcon = () => {
  const html = `<div class="user-marker" aria-label="Position utilisateur"></div>`
  return L.divIcon({
    html,
    className: 'user-marker-wrapper',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  })
}

const updateUserMarker = (latitude, longitude, initial = false) => {
  if (!map) return
  if (initial) {
    map.setView([latitude, longitude], 15)
  }
  if (userMarker.value) {
    userMarker.value.setLatLng([latitude, longitude])
  } else {
    userMarker.value = L.marker([latitude, longitude], {
      icon: createUserIcon(),
      keyboard: false,
      interactive: false,
      riseOnHover: true,
      zIndexOffset: 1000,
      title: 'Vous êtes ici'
    }).addTo(map)
  }
  userLocatedOnce = true
}

const locateUser = () => {
  onceGeo().then(({ latitude, longitude }) => {
    updateUserMarker(latitude, longitude, true)
    startGeo()
  }).catch(() => {
    // If we already have a last known coordinate, use it for recenter, otherwise fallback
    const lat = coords.value?.latitude
    const lon = coords.value?.longitude
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      map.setView([lat, lon], 15)
    } else {
      map.setView([50.64028, 4.66671], 8)
    }
    plotMissions()
  })
}

const recenterNow = () => {
  const lat = coords.value?.latitude
  const lon = coords.value?.longitude
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    map.setView([lat, lon], 15)
  } else {
    locateUser()
  }
}

onMounted(async () => {
  // Charger la liste scenarios si vide
  if (!scenariosStore.items.length) {
    await scenariosStore.fetchMine(true)
    scenariosStore.enrichProgress()
  }
  // Charger l'éventuel choix persistant si pas de paramètre d'URL
  try {
    const v = Number(localStorage.getItem('currentScenarioId'))
    if (Number.isFinite(v)) persistedScenarioId.value = v
  } catch { /* ignore storage errors */ }
  initMap()
  locateUser()
  await loadFullIfNeeded()
  // Live update marker when coords change
  watch(coords, (c) => {
    if (c?.latitude != null && c?.longitude != null) {
      updateUserMarker(c.latitude, c.longitude)
    }
  })
  // If a specific scenario is requested but missing locally, refresh and load
  watch(selectedScenarioId, async (id) => {
    if (id && !scenariosStore.items.some((s) => s.id === id)) {
      await scenariosStore.fetchMine(true)
      await loadFullIfNeeded()
    }
  }, { immediate: true })
  // Recenter when query param 'recenter' changes (e.g., user re-clicks tab)
  watch(() => route.query.recenter, (v) => {
    if (v) recenterNow()
  })
})

onUnmounted(() => {
  stopGeo()
})

// Sur changement de scénario courant -> recharger missions
watch(currentScenario, async (n, o) => {
  if (n && (!o || n.id !== o.id)) {
    // reset fit flag so we can refit if needed on new scenario
    mapFittedToMissions = false
    await loadFullIfNeeded()
  }
})


</script>

<template>
  <div class="current-map-page">
    <div class="map-wrapper">
      <div ref="mapEl" class="leaflet-map"></div>
      
      <div class="geo-status" v-if="locating">Localisation…</div>
      <div class="geo-status error" v-else-if="geoError">{{ geoError }}</div>
      <div class="no-scenario" v-if="!currentScenario">Aucun scénario en cours ou bookmarké.</div>
      <button class="locate-btn" :class="{ searching: locating, disabled: locating }" @click="locateUser" type="button" :disabled="locating" aria-label="Me localiser de nouveau">
        <span class="material-symbols-outlined">my_location</span>
      </button>
    </div>
    <div class="scenario-overlay" v-if="currentScenario">
      <div class="scenario-overlay__inner">
        <ScenarioCard :scenario="currentScenario" :compact="true" :showAuthor="true" :clickable="true" @select="s => $router.push({ name: 'scenario-detail', params: { id: s.id }, query: { from: 'current' } })" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as *;
.current-map-page { position:relative; width:100%; height:100vh; overflow:hidden; }
.map-wrapper { position:fixed; inset:0; z-index:1; }
.leaflet-map { position:absolute; inset:0; }
.geo-status { position:absolute; top:10px; right:10px; background:rgba(0,0,0,.55); color:#fff; padding:.4rem .7rem; border-radius:8px; font-size:.75rem; z-index:40; backdrop-filter:blur(6px); }
.geo-status.error { background:rgba(180,40,40,.75); }
.no-scenario { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,.6); padding:1rem 1.3rem; border-radius:14px; color:#fff; font-size:.9rem; z-index:30; pointer-events:none; }

/* basemap picker removed */

.locate-btn { position:absolute; bottom:96px; right:14px; z-index:60; background:rgba(15,23,42,.82); border:1px solid rgba(255,255,255,.18); color:#e2e8f0; width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(6px); box-shadow:0 4px 14px -3px rgba(0,0,0,.6); transition:background .3s,border-color .3s,transform .25s; }
.locate-btn:hover { background:rgba(30,41,59,.88); }
.locate-btn:active { transform:translateY(1px); }
.locate-btn .material-symbols-outlined { font-size:26px; line-height:1; }
.locate-btn.searching { animation:pulseLoc 1.2s ease-in-out infinite; }
@keyframes pulseLoc { 0%,100% { box-shadow:0 0 0 0 rgba(96,165,250,.55); } 50% { box-shadow:0 0 0 8px rgba(96,165,250,0); } }

.scenario-overlay { position:fixed; left:0; top:0; right:0; z-index:50; pointer-events:none; }
.scenario-overlay__inner { padding:22px 14px 12px; max-width:640px; margin:0 auto; pointer-events:auto; }
.scenario-overlay :deep(.scenario-card) { backdrop-filter:blur(6px); background:rgba(15,23,42,.78); border-color:rgba(255,255,255,.12); }
.scenario-overlay :deep(.scenario-card:hover) { background:rgba(30,41,59,.82); }


/* Mission custom markers (moved out of scoped via separate global style block below) */

/* Leaflet tooltip tweak */
:global(.leaflet-tooltip) { background:rgba(15,23,42,.9); color:#f1f5f9; border:1px solid rgba(255,255,255,.15); padding:.35rem .55rem; font-size:.65rem; font-weight:500; border-radius:6px; backdrop-filter:blur(4px); }
:global(.leaflet-tooltip-top:before) { border-top-color:rgba(15,23,42,.9); }

/* Ajuster la carte derrière le header global (si navbar fixe) */
@media (min-width: 760px) {
  .scenario-overlay__inner { padding:28px 28px 16px; }
}
</style>

<!-- Global styles (non-scoped) so Leaflet injected HTML (divIcon) picks them up -->
<style lang="scss">
.mission-marker-wrapper { width:30px; height:30px; }
.user-marker-wrapper { z-index: 1000 !important; }
.user-marker { position:relative; width:18px; height:18px; border-radius:50%; background:#38bdf8; box-shadow:0 0 0 3px rgba(56,189,248,.25), 0 0 10px rgba(56,189,248,.6); }
.user-marker::after { content:''; position:absolute; inset:3px; border-radius:50%; background:#0ea5e9; }
.mission-marker { position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.mission-marker__inner { position:relative; width:24px; height:24px; border-radius:50%; background:rgba(30,41,59,.85); backdrop-filter:blur(2px); border:1px solid rgba(148,163,184,.35); display:flex; align-items:center; justify-content:center; transition:background .3s,border-color .3s,transform .3s, opacity .3s; }
.mission-marker.pending .mission-marker__inner { border-color:rgba(96,165,250,.55); }
.mission-marker.locked { opacity:.55; }
.mission-marker.locked .mission-marker__inner { border-color:rgba(148,163,184,.25); }
.mission-marker.completed .mission-marker__inner { border-color:rgba(52,211,153,.7); box-shadow:0 0 0 2px rgba(34,197,94,.25); }
.mission-marker__icon { font-size:15px; line-height:1; color:#e2e8f0; font-variation-settings:'wght' 500; opacity:.9; transition:opacity .3s, transform .3s; }
.mission-marker.completed .mission-marker__icon { color:#d1fae5; }
.mission-marker:hover .mission-marker__inner { border-color:#60a5fa; background:rgba(30,41,59,.92); }
.mission-marker.completed:hover .mission-marker__inner { border-color:#34d399; }
.mission-marker:hover .mission-marker__icon { opacity:1; }
/* removed pulse animation */

/* Custom mission popup styles */
.mission-popup-wrapper .leaflet-popup-content-wrapper { background:rgba(15,23,42,.92); color:#e2e8f0; border:1px solid rgba(255,255,255,.15); border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,.5); }
.mission-popup-wrapper .leaflet-popup-tip { background:rgba(15,23,42,.92); border:none; }
.mission-popup { display:flex; align-items:center; gap:10px; }
.mission-popup__title { font-weight:600; font-size:.85rem; letter-spacing:.2px; }
.mission-popup__btn { margin-left:auto; display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; border:1px solid rgba(255,255,255,.15); cursor:pointer; transition:filter .2s, transform .1s; }
.mission-popup__btn .material-symbols-outlined { font-size:20px; }
.mission-popup__btn:hover { filter:brightness(1.1); }
.mission-popup__btn:active { transform:translateY(1px); }
.mission-popup__btn.disabled, .mission-popup__btn[disabled] { background:rgba(71,85,105,.5); color:#94a3b8; cursor:not-allowed; border-color:rgba(148,163,184,.35); }
</style>
