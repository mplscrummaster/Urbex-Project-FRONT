<script setup>
/*
  Carte Explore (Leaflet)
  --------------------------------------------------
  Buts
  - Afficher rapidement communes (polygones) + scénarios (marqueurs)
  - Éviter les "sauts" visuels et conserver l'état via KeepAlive
  - Ne recadrer que si nécessaire (vue explicite ou 1er fix utilisateur)

  Choix techniques
  - Données lourdes préchargées/cachées en store (Pinia)
  - Construction synchrone des polygones pour un rendu immédiat
  - Pas de fitBounds automatique; priorité à la vue explicite (URL), sinon recadrage utilisateur unique
  - Au retour (KeepAlive): invalidateSize + refreshClusters, sans reconstruire
*/
// Carte Explore : Leaflet + polygones des communes + marqueurs de scénarios
import { onMounted, onUnmounted, onActivated, ref, reactive, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet/dist/leaflet.css'
import { useCommunesStore } from '@/stores/communes'
import { CommunesAPI } from '@/services/api'
import BottomDrawer from '@/components/BottomDrawer.vue'
import ScenarioCard from '@/components/ScenarioCard.vue'
import { useRouter, useRoute } from 'vue-router'
import { useScenariosStore } from '@/stores/scenarios'
import { createBaseMap, withLayerGroup } from '@/composables/useLeafletMap'
import { useGeolocation } from '@/composables/useGeolocation'
import { useTutorial } from '@/composables/useTutorial'



// Constantes (centralisation des valeurs "magiques")
// DEFAULT_CENTER/DEFAULT_ZOOM: vue par défaut
// USER_REFOCUS_ZOOM: zoom pour recadrer sur l'utilisateur
// CLUSTER_CLICK_PADDING: padding pour le fitBounds des clusters
const DEFAULT_CENTER = [50.64028, 4.66671]
const DEFAULT_ZOOM = 8
const USER_REFOCUS_ZOOM = 11
const CLUSTER_CLICK_PADDING = [40, 40]

// Élément racine pour initialiser Leaflet
const mapEl = ref(null)
let map
let communesLayer = null
let scenarioMarkersLayer = null
let mountedOnce = false
const communesStore = useCommunesStore()
const scenariosStore = useScenariosStore()
const drawerOpen = ref(false)
const drawerScenarios = ref([])
const router = useRouter()
const route = useRoute()
const { autoTutorial } = useTutorial()

// Note: les instances Leaflet (map, layers) ne sont pas réactives et c'est voulu.
// On les stocke dans des variables simples pour éviter tout surcoût de réactivité inutile.

// État UI: commune sélectionnée (pour le style + contenu du tiroir)
const ui = reactive({ selectedId: null })

// Styles des polygones (discret par défaut, plus visible en sélection)
const baseStyle = () => ({
  color: 'green',
  weight: 1,
  opacity: 0.25,
  fillOpacity: 0.1,
  fillColor: 'gray',
  stroke: true,
  fill: true,
})
const selectedStyle = () => ({
  color: '#f59e0b',
  weight: 2,
  opacity: 0.5,
  fillOpacity: 0.1,
  fillColor: '#fbbf24',
})

// Références des calques de polygones (pour réappliquer les styles facilement)
const polygonLayers = new Map() // id -> layer
const loading = ref(true)
const errorMsg = ref('')
const progress = ref(0)
const total = ref(0)

// État de l'UI de recherche (champ + état de chargement/erreur)
const searchTerm = ref('')
const searchState = reactive({ loading: false, error: '' })

/**
 * Recherche d'une commune par nom ou code postal.
 * - Utilise l'API CommunesAPI et gère quelques bascules nom <-> code postal.
 * - Centre la carte sur le résultat avec un zoom minimum.
 */
const onSearchSubmit = async () => {
  const term = (searchTerm.value || '').trim()
  if (!term) return
  searchState.loading = true
  searchState.error = ''
  try {
    const raw = term.replace(/\s+/g, '')
    const isPostal = /^\d{4,5}$/.test(raw)
    let results = []
    try {
      results = await CommunesAPI.list(isPostal ? { postal: raw } : { q: term })
    } catch {
      /* ignorer */
    }
    if ((!results || results.length === 0) && isPostal) {
      try {
        results = await CommunesAPI.list({ q: term })
      } catch {
        /* ignorer */
      }
    } else if ((!results || results.length === 0) && !isPostal && /^\d{4,5}$/.test(raw)) {
      try {
        results = await CommunesAPI.list({ postal: raw })
      } catch {
        /* ignorer */
      }
    }
    if (results && results.length) {
      const r = results[0]
      let { lat, lon } = r
      if ((lat == null || lon == null) && r.id) {
        try {
          const full = await CommunesAPI.get(r.id)
          lat = full.lat
          lon = full.lon
        } catch {
          /* ignorer */
        }
      }
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const targetZoom = Math.max(map.getZoom() || 8, 11)
        map.setView([lat, lon], targetZoom, { animate: true })
      } else {
        searchState.error = 'Coordonnées introuvables pour cette commune'
      }
    } else {
      searchState.error = 'Aucune commune trouvée'
    }
  } catch (e) {
    searchState.error = e?.message || 'Erreur de recherche'
  } finally {
    searchState.loading = false
  }
}

/**
 * Applique le style courant (base ou selected) au polygone d'une commune donnée.
 * Gère les groupes GeoJSON et leurs sous-couches.
 */
const applyCurrentStyle = (id) => {
  const layer = polygonLayers.get(id)
  if (!layer) return
  const style = id === ui.selectedId ? selectedStyle() : baseStyle()
  if (typeof layer.setStyle === 'function') layer.setStyle(style)
  if (typeof layer.eachLayer === 'function') {
    layer.eachLayer((l) => {
      if (typeof l.setStyle === 'function') l.setStyle(style)
    })
  }
}

/**
 * Sélectionne/désélectionne une commune et (optionnellement) recadre la carte.
 * opts.pan = false permet d'éviter un mouvement de caméra (utile pour la sélection via URL).
 */
const selectCommune = (id, opts = { pan: true }) => {
  if (ui.selectedId === id) {
    ui.selectedId = null
    applyCurrentStyle(id)
    drawerOpen.value = false
    return
  }
  const previous = ui.selectedId
  ui.selectedId = id
  if (previous) applyCurrentStyle(previous)
  applyCurrentStyle(id)
  const c = communesStore.byId[id]
  if (opts?.pan && c?.lat && c?.lon) map.panTo([c.lat, c.lon], { animate: true })
  prepareDrawerForCommune(id)
}

/**
 * Synchronise les cartes du tiroir avec le store Pinia des scénarios (bookmark/status/progress).
 */
const syncDrawerWithStore = () => {
  if (!drawerScenarios.value?.length) return
  const byId = new Map(scenariosStore.items.map((s) => [s.id, s]))
  drawerScenarios.value = drawerScenarios.value.map((s) => {
    const mine = byId.get(s.id)
    return {
      ...s,
      bookmarked: !!mine?.bookmarked,
      status: mine?.status ?? s.status,
      progressRatio: mine?.progressRatio ?? s.progressRatio ?? 0,
      author: s.author || mine?.author || '—',
    }
  })
}

/**
 * Contrat: prepareDrawerForCommune
 * - Entrée: id (number) identifiant de la commune
 * - Sources: communesStore.getScenarioPins() -> lignes { commune_id, scenario_id, title, is_published, author, lat, lon }
 * - Effets: met à jour drawerScenarios et ouvre le tiroir; tente une synchro des états utilisateur (favoris/statut)
 */
const prepareDrawerForCommune = async (id) => {
  try {
    const rows = await communesStore.getScenarioPins()
    const list = rows
      .filter((r) => r.commune_id === id)
      .map((r) => {
        const mine = scenariosStore.items.find((s) => s.id === r.scenario_id)
        return {
          id: r.scenario_id,
          title: r.title,
          published: !!r.is_published,
          status: mine?.status || 'not_started',
          bookmarked: !!mine?.bookmarked,
          progressRatio: mine?.progressRatio ?? 0,
          author: r.author || mine?.author || '—',
        }
      })
    drawerScenarios.value = list
    drawerOpen.value = true
    if (!scenariosStore.items.length)
      scenariosStore
        .fetchMine()
        .then(() => syncDrawerWithStore())
        .catch(() => { })
  } catch {
    /* ignorer */
  }
}

/**
 * Contrat: goToScenario
 * - Entrée: sc { id: number }
 * - Effets: navigation vers la page scénario en conservant le contexte carte (lat/lon/zoom/commune)
 */
const goToScenario = (sc) => {
  if (!sc?.id || !map) return
  const center = map.getCenter()
  router.push({
    name: 'scenario-detail',
    params: { id: sc.id },
    query: {
      from: 'map',
      commune: ui.selectedId || undefined,
      zoom: map.getZoom(),
      lat: center.lat.toFixed(5),
      lon: center.lng.toFixed(5),
    },
  })
}

// Synchronise le contenu du tiroir quand l'utilisateur modifie ses scénarios (favoris/statut)
watch(
  () => scenariosStore.items,
  () => {
    if (drawerOpen.value) syncDrawerWithStore()
  },
  { deep: true },
)

/**
 * Attache une interaction minimale aux sous-couches GeoJSON (tap = sélectionner).
 */
const attachFeature = (layer, id) => {
  // Mobile-first : pas de survol; un clic/tap sélectionne et met en avant
  layer.on('click', () => {
    selectCommune(id)
    layer.bringToFront?.()
  })
}

/**
 * Initialise la carte (une seule fois grâce au KeepAlive) et bâtit les couches depuis le cache.
 * - Applique la vue explicite si présente (lat/lon/zoom)
 * - Ajoute les polygones de communes (synchrone) puis construit les markers en parallèle
 * - Si pas de vue explicite, recadre vers l'utilisateur une seule fois
 */
const init = async () => {
  mountedOnce = true
  if (!mapEl.value) return // Protection contre accès DOM null
  const { map: m } = createBaseMap(mapEl.value, {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: false,
    minZoom: 6,
    maxZoom: 19,
    preferCanvas: false,
    interactions: { scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, boxZoom: true },
  })
  map = m
  // Panes par défaut Leaflet : polygones sur overlayPane, marqueurs sur markerPane

  // Pas de recadrage auto immédiat : priorité à une vue explicite si elle est fournie (URL)

  // Applique d'emblée une vue explicite depuis l'URL (évite des "sauts" ultérieurs)
  const qInit = route.query
  if (qInit.lat && qInit.lon && qInit.zoom) {
    const la = Number(qInit.lat)
    const lo = Number(qInit.lon)
    const z = Number(qInit.zoom)
    if (Number.isFinite(la) && Number.isFinite(lo) && Number.isFinite(z))
      map.setView([la, lo], z, { animate: false })
  }

  // Lance la géolocalisation tôt : elle servira plus tard si aucune vue explicite n'a été demandée
  let userLoc = null
  let userLocPromise = null
  try {
    const { once } = useGeolocation()
    userLocPromise = once()
      .then((c) => {
        if (c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude)) {
          userLoc = [c.latitude, c.longitude]
          return userLoc
        }
        return null
      })
      .catch(() => null)
  } catch {
    /* ignore */
  }

  // Groupes vectoriels principaux (polygones communes + cluster de marqueurs scénarios)
  communesLayer = withLayerGroup(map)
  scenarioMarkersLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    removeOutsideVisibleBounds: true,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 48,
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount()
      const display = count > 999 ? '1k+' : count
      const size = count < 10 ? 28 : count < 50 ? 34 : count < 100 ? 40 : 46
      return L.divIcon({
        html: `<div class="scenario-cluster-agg" style="width:${size}px;height:${size}px;line-height:${size}px;">${display}</div>`,
        className: 'scenario-cluster-agg-wrapper',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })
    },
  })
  scenarioMarkersLayer.on('clusterclick', (e) => {
    // Au clic sur un cluster :
    // 1) on essaie de zoomer sur les limites du cluster
    // 2) si le zoom ne change pas (déjà suffisamment proche), on "spiderfy" pour séparer les points
    const bounds = e.layer.getBounds()
    const before = map.getZoom()
    map.fitBounds(bounds, { padding: CLUSTER_CLICK_PADDING })
    const after = map.getZoom()
    if (after === before) e.layer.spiderfy?.()
  })
  map.addLayer(scenarioMarkersLayer)

  try {
    // 1) Récupère les shapes depuis le cache store (préchargé au boot)
    await communesStore.fetchAll()
    // Use cached shapes from store (prefetched at app start)
    const feats = await communesStore.getShapes()
    total.value = feats.length
    // 2) Construit tous les polygones de manière synchrone pour un rendu immédiat (sans chunking)
    const tempGroup = L.featureGroup()
    for (let i = 0; i < feats.length; i++) {
      const f = feats[i]
      const id = f?.properties?.id ?? f?.id ?? i + 1
      try {
        // Attache les interactions directement à la création via onEachFeature
        const layer = L.geoJSON(f, {
          style: () => baseStyle(),
          interactive: true,
          onEachFeature: (_feature, l) => {
            if (id != null) attachFeature(l, id)
          },
        })
        tempGroup.addLayer(layer)
        if (id != null) polygonLayers.set(id, layer)
      } catch {
        /* ignorer l'erreur lors de l'ajout du polygone */
      }
      progress.value = i + 1
    }
    // 3) Ajoute tous les polygones en une fois
    tempGroup.addTo(communesLayer)
    // Pas de fitBounds: on évite tout jump de zoom
    loading.value = false
      // 4) En parallèle, construit les marqueurs à partir des "pins" en cache (opération non-bloquante)
      ; (async () => {
        scenarioMarkersLayer.clearLayers()
        try {
          const rows = await communesStore.getScenarioPins()
          const byCommune = new Map()
          for (const row of rows) {
            const communeName = row.commune_name_fr || row.commune_name_nl || row.commune_name_de
            if (!byCommune.has(row.commune_id)) {
              byCommune.set(row.commune_id, {
                id: row.commune_id,
                name: communeName,
                lat: row.lat,
                lon: row.lon,
                scenarios: [],
              })
            }
            const cEntry = byCommune.get(row.commune_id)
            cEntry.scenarios.push({
              id: row.scenario_id,
              title: row.title,
              published: !!row.is_published,
              author: row.author,
            })
          }
          for (const commune of byCommune.values()) {
            if (commune.lat == null || commune.lon == null) continue
            const scenarioCount = commune.scenarios.length
            const displayCount = scenarioCount > 99 ? '99+' : String(scenarioCount)
            const digits = displayCount.length
            const size = digits === 1 ? 16 : digits === 2 ? 20 : 22
            const fontSize = digits === 1 ? 10 : digits === 2 ? 11 : 12
            const classMod = 'published'
            const iconHtml = `<div class="scenario-dot ${classMod}" style="width:${size}px;height:${size}px;font-size:${fontSize}px;line-height:${size}px;">${displayCount}</div>`
            const icon = L.divIcon({
              className: 'scenario-dot-wrapper',
              html: iconHtml,
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            })
            try {
              const marker = L.marker([commune.lat, commune.lon], { icon }).on('click', () =>
                selectCommune(commune.id),
              )
              scenarioMarkersLayer.addLayer(marker)
            } catch {
              /* ignorer l'erreur lors de la création du marqueur */
            }
          }
        } catch {
          /* ignorer l'erreur lors de la construction des pins */
        }
        const q = route.query
        const hasExplicitView = q.lat && q.lon && q.zoom
        // Si pas de vue explicite: recadre vers l'utilisateur une seule fois (mouvement intentionnel)
        if (!hasExplicitView) {
          try {
            if (!userLoc && userLocPromise) await userLocPromise
          } catch {
            /* ignorer */
          }
          if (userLoc) map.setView(userLoc, USER_REFOCUS_ZOOM, { animate: true })
        }
        // Si une commune est précisée: sélectionne sans pan pour ne pas déplacer la carte
        if (q.commune) {
          const cid = Number(q.commune)
          if (Number.isFinite(cid)) setTimeout(() => selectCommune(cid, { pan: false }), 70)
        }
      })()
  } catch (e) {
    errorMsg.value = e?.message || 'Erreur chargement géométries'
  } finally {
    /* on conserve l'état de chargement tel quel */
  }
}

// Montage/démontage: init une seule fois, détruit la carte si le composant est réellement démonté
onMounted(() => {
  if (!mountedOnce) init()
  autoTutorial('global_map')
}
)
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  communesLayer = null
  scenarioMarkersLayer = null
})

// KeepAlive : les instances sont mises en cache entre navigations.
// À la réactivation: on recalcule la taille + on rafraîchit les clusters, c'est tout.
onActivated(() => {
  // Réveil après KeepAlive : la carte était cachée.
  // 1) Recalcule la taille du conteneur pour éviter tuiles grises ou centrage erroné
  map?.invalidateSize?.()
  // 2) Recalcule les agrégations de clusters pour correspondre au viewport actuel
  scenarioMarkersLayer?.refreshClusters?.()
})

// Recentrage "à la demande" (si une autre partie de l'app pose ?recenter=1 dans l'URL)
watch(
  () => route.query.recenter,
  async (v) => {
    if (!v) return
    try {
      const { once } = useGeolocation()
      const c = await once().catch(() => null)
      if (c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude))
        map.setView([c.latitude, c.longitude], USER_REFOCUS_ZOOM, { animate: true })
    } catch {
      /* ignorer */
    }
  },
)
</script>

<template>
  <div class="p-explore-map">
    <div ref="mapEl" class="p-explore-map__map" />
    <div class="p-explore-map__overlay">
      <div class="p-explore-map__search" v-if="!loading">
        <form class="p-explore-map__search-form" @submit.prevent="onSearchSubmit">
          <input v-model="searchTerm" type="search" inputmode="search" autocomplete="off" spellcheck="false"
            placeholder="Commune ou code postal" :disabled="searchState.loading" aria-label="Rechercher une commune"
            class="p-explore-map__search-input" />
          <button type="submit" :disabled="searchState.loading" title="Rechercher" class="p-explore-map__search-btn">
            <span v-if="!searchState.loading" class="material-symbols-outlined">search</span>
            <span v-else>…</span>
          </button>
        </form>
        <div class="p-explore-map__search-error" v-if="searchState.error">
          {{ searchState.error }}
        </div>
      </div>
    </div>
    <div class="p-explore-map__progress" v-if="loading">
      <div class="p-explore-map__progress-label">Chargement des communes</div>
      <div class="p-explore-map__progress-bar-wrapper">
        <div class="p-explore-map__progress-bar" :style="{ width: total ? (progress / total) * 100 + '%' : '0%' }">
        </div>
      </div>
      <div class="p-explore-map__progress-pct">{{ progress }} / {{ total }}</div>
    </div>
    <div class="p-explore-map__error" v-if="errorMsg">{{ errorMsg }}</div>
    <BottomDrawer v-model="drawerOpen" initialSize="peek" @close="drawerOpen = false">
      <template v-if="drawerScenarios.length === 0">
        <div class="p-explore-map__empty">Aucun scénario dans cette commune</div>
      </template>
      <template v-else>
        <ScenarioCard v-for="s in drawerScenarios" :key="s.id" :scenario="s" @select="goToScenario" />
      </template>
    </BottomDrawer>
  </div>
</template>
