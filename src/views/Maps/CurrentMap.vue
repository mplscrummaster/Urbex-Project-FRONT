<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioCard from '@/components/ScenarioCard.vue'

// Elements & map instance refs
const mapEl = ref(null)
let map
const userMarker = ref(null)
const missionLayer = ref(null)
const locating = ref(true)
const geoError = ref('')
const hasLocation = ref(false)
let watchId = null

const scenariosStore = useScenariosStore()
const full = ref(null)
let userLocatedOnce = false
let mapFittedToMissions = false

// Choix du "scénario courant": priorité scénario started, sinon le premier not_started bookmarké
const currentScenario = computed(() => {
  const items = scenariosStore.items
  const started = items.find(s => s.status === 'started')
  if (started) return started
  return items.find(s => s.status === 'not_started') || null
})

async function loadFullIfNeeded() {
  if (!currentScenario.value) return
  full.value = await scenariosStore.fetchFull(currentScenario.value.id, true)
  plotMissions()
}

function initMap() {
  if (map) return
  map = L.map(mapEl.value, { zoomControl: false, preferCanvas: true, scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, boxZoom: true })
  const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 20
  })
  tiles.addTo(map)
  missionLayer.value = L.layerGroup().addTo(map)
}

function plotMissions() {
  if (!map || !missionLayer.value) return
  missionLayer.value.clearLayers()
  if (!full.value?.missions?.length) return
  const missions = full.value.missions.slice().sort((a,b)=>a.position-b.position)
  const completedIds = full.value?.progress?.completedMissionIds || []
  const firstIncomplete = missions.find(m => !completedIds.includes(m.id))
  const bounds = []
  for (const m of missions) {
    if (m.latitude == null || m.longitude == null) continue
    const marker = L.marker([m.latitude, m.longitude], { title: m.title, icon: createMissionIcon(m, firstIncomplete && m.id === firstIncomplete.id) })
    marker.bindTooltip(`${m.position ? 'Mission ' + m.position + ' – ' : ''}${m.title}`, { direction: 'top', offset: [0,-34] })
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

function missionCompleted(m) {
  const completed = full.value?.progress?.completedMissionIds || []
  return completed.includes(m.id)
}

function createMissionIcon(m, pulse = false) {
  const completed = missionCompleted(m)
  const cls = [ 'mission-marker', completed ? 'completed' : 'pending', pulse ? 'pulse' : '' ].filter(Boolean).join(' ')
  const icon = completed ? 'check' : 'explore'
  const html = `<div class="${cls}" aria-label="Mission">
    <div class="mission-marker__inner">
      <span class="mission-marker__icon material-symbols-outlined">${icon}</span>
    </div>
  </div>`
  return L.divIcon({
    html,
    className: 'mission-marker-wrapper', // keep wrapper minimal (Leaflet requirement)
    iconSize: [38, 44],
    iconAnchor: [19, 42],
    popupAnchor: [0, -40]
  })
}

function updateUserMarker(latitude, longitude, initial = false) {
  if (!map) return
  if (initial) {
    map.setView([latitude, longitude], 14)
  }
  if (userMarker.value) {
    userMarker.value.setLatLng([latitude, longitude])
  } else {
    userMarker.value = L.circleMarker([latitude, longitude], {
      radius: 8,
      color: '#38bdf8',
      weight: 2,
      fillColor: '#0ea5e9',
      fillOpacity: 0.85
    }).addTo(map).bindPopup('Vous êtes ici')
  }
  hasLocation.value = true
  userLocatedOnce = true
}

function startWatching() {
  if (!navigator.geolocation) return
  // Clear any previous watch
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      locating.value = false
      geoError.value = ''
      updateUserMarker(pos.coords.latitude, pos.coords.longitude)
    },
    (err) => {
      locating.value = false
      if (err.code === 1) { // permission denied
        geoError.value = 'Permission localisation refusée'
      } else {
        geoError.value = err.message || 'Échec localisation continue'
      }
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  )
}

function locateUser() {
  locating.value = true
  geoError.value = ''
  if (!navigator.geolocation) {
    geoError.value = 'Géolocalisation non supportée.'
    locating.value = false
    map.setView([50.64028, 4.66671], 8)
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false
      geoError.value = ''
      updateUserMarker(pos.coords.latitude, pos.coords.longitude, true)
      startWatching()
    },
    (err) => {
      locating.value = false
      geoError.value = err.message || 'Échec géolocalisation'
      map.setView([50.64028, 4.66671], 8)
      // Comme la géoloc a échoué, on peut maintenant centrer sur les missions si présent
      plotMissions()
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

onMounted(async () => {
  // Charger la liste scenarios si vide
  if (!scenariosStore.items.length) {
    await scenariosStore.fetchMine(true)
    scenariosStore.enrichProgress()
  }
  initMap()
  locateUser()
  await loadFullIfNeeded()
})

onUnmounted(() => {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
})

// Sur changement de scénario courant -> recharger missions
watch(currentScenario, async (n, o) => {
  if (n && (!o || n.id !== o.id)) {
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
        <ScenarioCard :scenario="currentScenario" :compact="true" :showAuthor="true" :clickable="true" @select="s => $router.push({ path: '/scenario/' + s.id, query: { from: 'current' } })" />
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

.locate-btn { position:absolute; bottom:96px; right:14px; z-index:60; background:rgba(15,23,42,.82); border:1px solid rgba(255,255,255,.18); color:#e2e8f0; width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(6px); box-shadow:0 4px 14px -3px rgba(0,0,0,.6); transition:background .3s,border-color .3s,transform .25s; }
.locate-btn:hover { background:rgba(30,41,59,.88); }
.locate-btn:active { transform:translateY(1px); }
.locate-btn .material-symbols-outlined { font-size:26px; line-height:1; }
.locate-btn.searching { animation:pulseLoc 1.2s ease-in-out infinite; }
@keyframes pulseLoc { 0%,100% { box-shadow:0 0 0 0 rgba(96,165,250,.55); } 50% { box-shadow:0 0 0 8px rgba(96,165,250,0); } }

.scenario-overlay { position:fixed; left:0; top:0; right:0; z-index:50; pointer-events:none; }
.scenario-overlay__inner { padding:70px 14px 12px; max-width:640px; margin:0 auto; pointer-events:auto; }
.scenario-overlay :deep(.scenario-card) { backdrop-filter:blur(6px); background:rgba(15,23,42,.78); border-color:rgba(255,255,255,.12); }
.scenario-overlay :deep(.scenario-card:hover) { background:rgba(30,41,59,.82); }

/* Mission custom markers (moved out of scoped via separate global style block below) */

/* Leaflet tooltip tweak */
:global(.leaflet-tooltip) { background:rgba(15,23,42,.9); color:#f1f5f9; border:1px solid rgba(255,255,255,.15); padding:.35rem .55rem; font-size:.65rem; font-weight:500; border-radius:6px; backdrop-filter:blur(4px); }
:global(.leaflet-tooltip-top:before) { border-top-color:rgba(15,23,42,.9); }

/* Ajuster la carte derrière le header global (si navbar fixe) */
@media (min-width: 760px) {
  .scenario-overlay__inner { padding:78px 28px 16px; }
}
</style>

<!-- Global styles (non-scoped) so Leaflet injected HTML (divIcon) picks them up -->
<style lang="scss">
.mission-marker { position:relative; width:30px; height:40px; display:flex; align-items:flex-start; justify-content:center; }
.mission-marker:before { content:''; position:absolute; bottom:4px; left:50%; transform:translateX(-50%); width:0; height:0; border:8px solid transparent; border-top-color:rgba(30,41,59,.85); }
.mission-marker__inner { position:relative; margin-top:3px; width:26px; height:26px; border-radius:50%; background:rgba(30,41,59,.85); backdrop-filter:blur(2px); border:1px solid rgba(148,163,184,.35); display:flex; align-items:center; justify-content:center; transition:background .3s,border-color .3s,transform .3s; }
.mission-marker.pending .mission-marker__inner { border-color:rgba(96,165,250,.55); }
.mission-marker.completed .mission-marker__inner { border-color:rgba(52,211,153,.55); }
.mission-marker__icon { font-size:15px; line-height:1; color:#e2e8f0; font-variation-settings:'wght' 500; opacity:.9; transition:opacity .3s, transform .3s; }
.mission-marker.completed .mission-marker__icon { color:#d1fae5; }
.mission-marker.pulse .mission-marker__inner { animation:markerPulse 2.4s ease-in-out infinite; }
.mission-marker:hover .mission-marker__inner { border-color:#60a5fa; background:rgba(30,41,59,.92); }
.mission-marker.completed:hover .mission-marker__inner { border-color:#34d399; }
.mission-marker:hover .mission-marker__icon { opacity:1; transform:scale(1.05); }
@keyframes markerPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.14); } }
</style>
