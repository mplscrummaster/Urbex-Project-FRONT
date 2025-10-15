<script setup>
/*
  Carte de jeu (Leaflet)
  --------------------------------------------------
  Buts
  - Afficher les missions du scénario courant et la position de l'utilisateur
  - Conserver l'état de la carte via KeepAlive (retour instantané, pas de "sauts")
  - Empêcher la fermeture involontaire des popups lors d'un mouvement volontaire

  Choix techniques
  - Instances Leaflet non réactives (map, layers, markers) stockées en variables simples
  - Géolocalisation: premier fix recentre la carte, puis suivi en tâche de fond
  - fitBounds des missions exécuté une seule fois si pas encore localisé
*/
// Carte de jeu : missions et position utilisateur
import { onMounted, onUnmounted, onActivated, onDeactivated, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useScenariosStore } from '@/stores/scenarios'
import { ScenariosAPI } from '@/services/api'
import ScenarioCard from '@/components/ScenarioCard.vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { createBaseMap, withLayerGroup } from '@/composables/useLeafletMap'
import { useTutorial } from '@/composables/useTutorial'

// Constantes (centralisation des valeurs "magiques")
// USER_ZOOM: zoom utilisé pour recadrer sur l'utilisateur
// DEFAULT_CENTER/DEFAULT_ZOOM: vue de repli si géoloc indisponible
// MISSIONS_BOUNDS_PAD: marge appliquée au fitBounds des missions
const USER_ZOOM = 15
const DEFAULT_ZOOM = 8
const DEFAULT_CENTER = [50.64028, 4.66671]
const MISSIONS_BOUNDS_PAD = 0.2
const { autoTutorial } = useTutorial()
// Options de style des popups centralisées
// className applique les styles BEM définis dans src/styles/components/_markers.scss
const POPUP_OPTS = {
  autoPan: true,
  autoPanPaddingTopLeft: [20, 80],
  autoPanPaddingBottomRight: [20, 100],
  closeButton: false,
  className: 'mission-popup-wrapper',
  offset: [0, 6],
}

// Éléments & références de la carte
const mapEl = ref(null)
let map
const userMarker = ref(null)
const missionLayer = ref(null)
const {
  coords,
  error: geoError,
  locating,
  start: startGeo,
  once: onceGeo,
  stop: stopGeo,
} = useGeolocation({ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 })

const scenariosStore = useScenariosStore()
const route = useRoute()
const full = ref(null)
let userLocatedOnce = false
let mapFittedToMissions = false
const router = useRouter()
let suppressCloseOnMove = false

const persistedScenarioId = ref(null)
// ID de scénario choisi: priorité à ?scenario= sinon valeur persistée (localStorage)
const selectedScenarioId = computed(() => {
  const raw = route.query?.scenario
  const id = Number(raw)
  if (Number.isFinite(id)) return id
  return Number.isFinite(persistedScenarioId.value) ? persistedScenarioId.value : null
})
// Scénario courant: sélectionné > dernier "started" > premier "not_started"
const currentScenario = computed(() => {
  const items = scenariosStore.items || []
  if (selectedScenarioId.value) {
    const picked = items.find((s) => s.id === selectedScenarioId.value)
    if (picked) return picked
  }
  const started = items
    .filter((s) => s.status === 'started')
    .sort((a, b) => (Date.parse(b.startedAt || 0) || 0) - (Date.parse(a.startedAt || 0) || 0))
  if (started.length) return started[0]
  return items.find((s) => s.status === 'not_started') || null
})

// Charge les données complètes du scénario si besoin, applique la progression, puis trace
const loadFullIfNeeded = async () => {
  if (!currentScenario.value) return
  full.value = await scenariosStore.fetchFull(currentScenario.value.id, true)
  await loadProgressState()
  plotMissions()
}

// Initialise la carte et le calque des missions (une seule fois)
// Ferme les popups au démarrage d'un drag/zoom (sauf juste après ouverture volontaire)
const initMap = () => {
  if (map) return
  const { map: m } = createBaseMap(mapEl.value, {
    zoomControl: false,
    minZoom: 3,
    maxZoom: 20,
    preferCanvas: true,
    interactions: { scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, boxZoom: true },
  })
  map = m
  missionLayer.value = withLayerGroup(map)
  window.gameMap = map
  // Ferme les popups au début d'un déplacement/zoom (sauf si on vient d'ouvrir une popup)
  map.on('dragstart', () => {
    if (!suppressCloseOnMove) {
      map.closePopup()
    }
  })
  map.on('zoomstart', () => {
    if (!suppressCloseOnMove) {
      map.closePopup()
    }
  })
}

// Construit le HTML de la popup d'une mission (titre + bouton)
// Note: échappement du titre (sécurité) et classes BEM .mission-popup*
const buildMissionPopup = (m, canGo) => {
  const safeTitle = (m.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `
      <div class="mission-popup">
        <div class="mission-popup__title">${m.position ? 'Mission ' + m.position + ' – ' : ''}${safeTitle}</div>
        <button class="mission-popup__btn${canGo ? '' : ' disabled'}" data-id="${m.id}" ${canGo ? '' : 'disabled title="Mission bloquée"'}>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>`
}

// Trace tous les marqueurs de missions pour le scénario courant
const plotMissions = () => {
  if (!map || !missionLayer.value) return
  missionLayer.value.clearLayers()
  if (!full.value?.missions?.length) return
  const missions = full.value.missions.slice().sort((a, b) => a.position - b.position)
  const bounds = []
  for (const m of missions) {
    if (m.latitude == null || m.longitude == null) continue
    const marker = L.marker([m.latitude, m.longitude], {
      title: m.title,
      icon: createMissionIcon(m),
    })
    const canGo = !m.locked
    const popupHtml = buildMissionPopup(m, canGo)
    marker.bindPopup(popupHtml, POPUP_OPTS)
    marker.on('popupopen', (e) => {
      // Évite que la popup se ferme si l'utilisateur bouge/zoome juste après l'ouverture
      suppressCloseOnMove = true
      const clear = () => {
        suppressCloseOnMove = false
      }
      map.once('moveend', clear)
      map.once('zoomend', clear)
      setTimeout(() => {
        suppressCloseOnMove = false
      }, 800)
      const el = e?.popup?.getElement?.()
      if (!el) return
      const btn = el.querySelector('.mission-popup__btn')
      if (btn && !btn.disabled) {
        btn.addEventListener(
          'click',
          () => {
            if (!currentScenario.value) return
            router.push({
              name: 'scenario-detail',
              params: { id: currentScenario.value.id },
              query: { from: 'current', mission: m.id },
            })
          },
          { once: true },
        )
      }
    })
    missionLayer.value.addLayer(marker)
    bounds.push([m.latitude, m.longitude])
  }
  if (bounds.length && !mapFittedToMissions && !userLocatedOnce && !locating.value) {
    const latLngBounds = L.latLngBounds(bounds)
    map.fitBounds(latLngBounds.pad(MISSIONS_BOUNDS_PAD))
    mapFittedToMissions = true
  }
}

// Détermine si une mission est complétée
const missionCompleted = (m) => !!m?.completed
const createMissionIcon = (m) => {
  const completed = missionCompleted(m)
  const locked = !!m?.locked
  const statusClass = completed ? 'completed' : locked ? 'locked' : 'pending'
  const cls = ['mission-marker', statusClass].join(' ')
  const icon = completed ? 'check' : 'explore'
  const html = `<div class="${cls}" aria-label="Mission">
    <div class="mission-marker__inner">
      <span class="mission-marker__icon material-symbols-outlined">${icon}</span>
    </div>
  </div>`
  return L.divIcon({
    html,
    className: 'mission-marker-wrapper',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -24],
  })
}

// Charge l'état d'avancement des missions (verrouillées/terminées) et l'applique aux données locales
// Charge l'état d'avancement (locked/completed) via l'API et l'applique aux missions
const loadProgressState = async () => {
  if (!currentScenario.value) return
  try {
    const prog = await ScenariosAPI.getProgress(currentScenario.value.id)
    const byId = new Map()
    for (const pm of prog.missions || []) {
      const mid = pm.id != null ? pm.id : pm._id_mission
      if (mid != null)
        byId.set(Number(mid), {
          locked: !!pm.locked,
          completed: !!pm.completed,
          prerequisites: pm.prerequisites || [],
        })
    }
    if (Array.isArray(full.value?.missions)) {
      full.value.missions = full.value.missions.map((m) => {
        const st = byId.get(Number(m.id)) || {}
        return {
          ...m,
          locked: !!st.locked,
          completed: !!st.completed,
          prerequisites: st.prerequisites || [],
        }
      })
    }
  } catch {
    /* ignorer */
  }
}

// Icône de la position utilisateur (petit point bleu)
const createUserIcon = () => {
  const html = `<div class="user-marker" aria-label="Position utilisateur"></div>`
  return L.divIcon({
    html,
    className: 'user-marker-wrapper',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

// Met à jour le marqueur utilisateur et centre la carte au premier fix
const updateUserMarker = (latitude, longitude, initial = false) => {
  if (!map) return
  if (initial) map.setView([latitude, longitude], USER_ZOOM)
  if (userMarker.value) userMarker.value.setLatLng([latitude, longitude])
  else
    userMarker.value = L.marker([latitude, longitude], {
      icon: createUserIcon(),
      keyboard: false,
      interactive: false,
      riseOnHover: true,
      zIndexOffset: 1000,
      title: 'Vous êtes ici',
    }).addTo(map)
  userLocatedOnce = true
}

// Localisation utilisateur: onceGeo (premier fix + recentrage) puis startGeo (suivi)
// Fallback: dernière coord connue ou vue par défaut
const locateUser = () => {
  // Première localisation : centre la carte puis démarre le suivi
  onceGeo()
    .then(({ latitude, longitude }) => {
      updateUserMarker(latitude, longitude, true)
      startGeo()
    })
    .catch(() => {
      const lat = coords.value?.latitude
      const lon = coords.value?.longitude
      if (Number.isFinite(lat) && Number.isFinite(lon)) map.setView([lat, lon], USER_ZOOM)
      else map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      plotMissions()
    })
}

// Recentrage manuel via bouton
const recenterNow = () => {
  const lat = coords.value?.latitude
  const lon = coords.value?.longitude
  if (Number.isFinite(lat) && Number.isFinite(lon)) map.setView([lat, lon], USER_ZOOM)
  else locateUser()
}

// Montage: prépare les scénarios, restaure l'ID courant, init carte + géoloc, puis trace les missions
onMounted(async () => {
  if (!scenariosStore.items.length) {
    await scenariosStore.fetchMine(true)
    scenariosStore.enrichProgress()
  }
  // Récupère un éventuel scénario courant persisté en localStorage
  try {
    const v = Number(localStorage.getItem('currentScenarioId'))
    if (Number.isFinite(v)) persistedScenarioId.value = v
  } catch {
    /* ignorer erreurs de stockage */
  }
  initMap()
  locateUser()
  autoTutorial('game_map')
  await loadFullIfNeeded()
  // Watchers regroupés
  watch(coords, (c) => {
    if (c?.latitude != null && c?.longitude != null) updateUserMarker(c.latitude, c.longitude)
  })
  watch(
    selectedScenarioId,
    async (id) => {
      // Si l'ID n'est pas présent en mémoire, recharge le store puis les missions détaillées
      if (id && !scenariosStore.items.some((s) => s.id === id)) {
        await scenariosStore.fetchMine(true)
        await loadFullIfNeeded()
      }
    },
    { immediate: true },
  )
  watch(
    () => route.query.recenter,
    (v) => {
      // Support du recadrage via ?recenter=1 dans l'URL
      if (v) recenterNow()
    },
  )
  watch(currentScenario, async (n, o) => {
    if (n && (!o || n.id !== o.id)) {
      // Nouveau scénario sélectionné: autorise un nouveau fitBounds des missions
      mapFittedToMissions = false
      await loadFullIfNeeded()
    }
  })
})

onUnmounted(() => {
  // Arrête la géolocalisation et détruit la carte pour éviter toute fuite mémoire
  stopGeo()
  if (map) {
    try {
      map.remove()
    } catch {
      /* noop */
    }
  }
})

// KeepAlive : réactive l'affichage de la carte au retour sur la vue
onActivated(() => {
  map?.invalidateSize?.()
})

// KeepAlive : lorsque la vue est désactivée, on coupe la géolocalisation (économie batterie)
onDeactivated(() => {
  stopGeo()
})

// Navigation vers la fiche scénario depuis la carte (overlay)
const goToScenario = (s) => {
  if (!s?.id) return
  router.push({ name: 'scenario-detail', params: { id: s.id }, query: { from: 'current' } })
}
</script>

<template>
  <div class="p-game-map">
    <div class="p-game-map__wrap">
      <div ref="mapEl" class="p-game-map__map"></div>
      <div class="p-game-map__geo" v-if="locating">Localisation…</div>
      <div class="p-game-map__geo p-game-map__geo--error" v-else-if="geoError">{{ geoError }}</div>
      <div class="p-game-map__nosce" v-if="!currentScenario">
        Aucun scénario en cours ou bookmarké.
      </div>
      <button class="p-game-map__locate" :class="{ 'p-game-map__locate--searching': locating, disabled: locating }"
        @click="locateUser" type="button" :disabled="locating" aria-label="Me localiser de nouveau">
        <span class="material-symbols-outlined">my_location</span>
      </button>
    </div>
    <div class="p-game-map__overlay" v-if="currentScenario">
      <ScenarioCard :scenario="currentScenario" :compact="true" :showAuthor="true" :clickable="true"
        @select="goToScenario" />
    </div>
  </div>
</template>
