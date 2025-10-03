<script setup>
// Inlined ExploreMap for clarity: GlobalMap is a full view with map + drawer
import { onMounted, onUnmounted, ref, reactive, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet/dist/leaflet.css'
import { useCommunesStore } from '@/stores/communes'
import { CommunesAPI, ScenariosAPI } from '@/services/api'
import BottomDrawer from '@/components/BottomDrawer.vue'
import ScenarioCard from '@/components/ScenarioCard.vue'
import { useRouter, useRoute } from 'vue-router'
import { useScenariosStore } from '@/stores/scenarios'
import { createBaseMap, withLayerGroup } from '@/composables/useLeafletMap'

const mapEl = ref(null)
let map
let communesLayer = null
let scenarioMarkersLayer = null // cluster group
const communesStore = useCommunesStore()
const scenariosStore = useScenariosStore()
const drawerOpen = ref(false)
const drawerScenarios = ref([])
const router = useRouter()
const route = useRoute()
// Filter: show only published scenarios by default
const publishedOnly = ref(true)

// State for selected polygon
const ui = reactive({ selectedId: null })

function baseStyle() { return { color: '#64748b', weight: 1, opacity: 0.65, fillOpacity: 0.07, fillColor: '#1e293b' } }
function hoverStyle() { return { color: '#93c5fd', weight: 2, opacity: 1, fillOpacity: 0.18, fillColor: '#334155' } }
function selectedStyle() { return { color: '#fbbf24', weight: 3, opacity: 1, fillOpacity: 0.28, fillColor: '#f59e0b' } }

const polygonLayers = new Map() // id -> layer
const communeMarkers = new Map() // id -> marker (clustered)
const loading = ref(true)
const errorMsg = ref('')
const progress = ref(0)
const total = ref(0)

function applyCurrentStyle(id) {
  const layer = polygonLayers.get(id)
  if (!layer) return
  const style = id === ui.selectedId ? selectedStyle() : baseStyle()
  layer.setStyle(style)
}

function attachFeature(layer, id) {
  layer.on('mouseover', () => { if (id !== ui.selectedId) layer.setStyle(hoverStyle()) })
  layer.on('mouseout', () => { if (id !== ui.selectedId) layer.setStyle(baseStyle()) })
  layer.on('click', () => {
    // Just select and open drawer now (no Leaflet popup)
    selectCommune(id)
  })
}

function selectCommune(id) {
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
  if (c?.lat && c?.lon) {
    map.panTo([c.lat, c.lon], { animate: true })
  }
  prepareDrawerForCommune(id)
}

function prepareDrawerForCommune(id) {
  ScenariosAPI.listScenarioCommunes({ published: publishedOnly.value }).then(rows => {
    const list = rows.filter(r => r.commune_id === id).map(r => ({
      id: r.scenario_id,
      title: r.title,
      published: !!r.is_published,
      status: 'not_started',
      bookmarked: false,
      progressRatio: 0,
      author: r.author || '—'
    }))
    drawerScenarios.value = list
    drawerOpen.value = true
    if (!scenariosStore.items.length) scenariosStore.fetchMine().catch(()=>{})
  }).catch(()=>{})
}

async function loadScenarioMarkers() {
  // Cleanup previous layer and index
  scenarioMarkersLayer.clearLayers()
  communeMarkers.clear()
  try {
    const links = await ScenariosAPI.listScenarioCommunes({ published: publishedOnly.value })
    const byScenario = new Map()
    const byCommune = new Map()
    for (const row of links) {
      if (!byScenario.has(row.scenario_id)) {
        byScenario.set(row.scenario_id, { id: row.scenario_id, title: row.title, published: !!row.is_published, communes: [] })
      }
      const sc = byScenario.get(row.scenario_id)
      const communeName = row.commune_name_fr || row.commune_name_nl || row.commune_name_de
      const communeEntry = { id: row.commune_id, name: communeName, lat: row.lat, lon: row.lon }
      sc.communes.push(communeEntry)

      if (!byCommune.has(row.commune_id)) {
        byCommune.set(row.commune_id, { id: row.commune_id, name: communeName, lat: row.lat, lon: row.lon, scenarios: [] })
      }
      const cEntry = byCommune.get(row.commune_id)
      cEntry.scenarios.push({ id: sc.id, title: sc.title, published: sc.published, author: row.author })
    }

    for (const commune of byCommune.values()) {
      if (commune.lat == null || commune.lon == null) continue
      const scenarioCount = commune.scenarios.length
      const displayCount = scenarioCount > 99 ? '99+' : String(scenarioCount)
      const digits = displayCount.length
      const size = digits === 1 ? 16 : (digits === 2 ? 20 : 22)
      const fontSize = digits === 1 ? 10 : (digits === 2 ? 11 : 12)
      const hasPublished = commune.scenarios.some(s => s.published)
      const classMod = hasPublished ? 'published' : 'draft'
      const iconHtml = `<div class="scenario-dot ${classMod}" style="width:${size}px;height:${size}px;font-size:${fontSize}px;line-height:${size}px;">${displayCount}</div>`
      const icon = L.divIcon({ className: 'scenario-dot-wrapper', html: iconHtml, iconSize: [size, size], iconAnchor: [size/2, size/2] })
      try {
        const marker = L.marker([commune.lat, commune.lon], { icon })
          .on('click', () => selectCommune(commune.id))
        scenarioMarkersLayer.addLayer(marker)
        communeMarkers.set(commune.id, marker)
      } catch { /* ignore marker errors */ }
    }
  } catch (e2) {
    console.warn('[scenarios] load failed', e2)
  }
}

async function init() {
  const { map: m } = createBaseMap(mapEl.value, {
    center: [50.6402809, 4.6667145],
    zoom: 8,
    zoomControl: false,
    minZoom: 6,
    maxZoom: 19,
    preferCanvas: true,
    interactions: { scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, boxZoom: true }
  })
  map = m

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
        iconAnchor: [size/2, size/2]
      })
    }
  })
  scenarioMarkersLayer.on('clusterclick', e => {
    const bounds = e.layer.getBounds()
    const zoomBefore = map.getZoom()
    map.fitBounds(bounds, { padding: [40,40] })
    const zoomAfter = map.getZoom()
    if (zoomAfter === zoomBefore) {
      e.layer.spiderfy?.()
    }
  })
  map.addLayer(scenarioMarkersLayer)

  ;(async () => {
    try {
      await communesStore.fetchAll()
      const fc = await CommunesAPI.shapesFeatureCollection()
      const feats = fc?.features || []
      total.value = feats.length
      const tempGroup = L.featureGroup()
      const chunkSize = 60
      let i = 0
      async function step() {
        const end = Math.min(i + chunkSize, feats.length)
        for (; i < end; i++) {
          const f = feats[i]
          const id = f?.properties?.id
          if (!id) continue
          try {
            const layer = L.geoJSON(f, { style: () => baseStyle() })
            layer.eachLayer(l => attachFeature(l, id))
            tempGroup.addLayer(layer)
            polygonLayers.set(id, layer)
          } catch { /* ignore */ }
          progress.value = i + 1
        }
        if (i < feats.length) {
          requestAnimationFrame(step)
        } else {
          tempGroup.addTo(communesLayer)
          loading.value = false
          ;(async () => {
            await loadScenarioMarkers()
            const q = route.query
            if (q.lat && q.lon && q.zoom) {
              const la = Number(q.lat); const lo = Number(q.lon); const z = Number(q.zoom)
              if (Number.isFinite(la) && Number.isFinite(lo) && Number.isFinite(z)) {
                map.setView([la, lo], z, { animate: false })
              }
            }
            if (q.commune) {
              const cid = Number(q.commune)
              if (Number.isFinite(cid)) setTimeout(()=>selectCommune(cid), 70)
            }
          })()
        }
      }
      if (feats.length) {
        requestAnimationFrame(step)
      } else {
        loading.value = false
      }
    } catch (e) {
      errorMsg.value = e.message || 'Erreur chargement géométries'
      console.error('[communes] featurecollection error', e)
    } finally {
      loading.value = false
    }
  })()
}

onMounted(() => { init() })
// Refresh markers when filter toggles
watch(publishedOnly, () => { loadScenarioMarkers() })
onUnmounted(() => { if (map) map.remove() })
</script>

<template>
  <div class="explore-layout">
    <div ref="mapEl" class="explore-map" />
    <div class="map-controls">
      <label class="toggle">
        <input type="checkbox" v-model="publishedOnly" />
        <span>Scénarios publiés uniquement</span>
      </label>
    </div>
    <div class="shape-progress" v-if="loading">
      <div class="label">Chargement des communes</div>
      <div class="bar-wrapper"><div class="bar" :style="{ width: total ? ((progress/total)*100)+'%' : '0%' }"></div></div>
      <div class="pct">{{ progress }} / {{ total }}</div>
    </div>
    <div class="shape-error" v-if="errorMsg">{{ errorMsg }}</div>
    <BottomDrawer v-model="drawerOpen" initialSize="peek" @close="drawerOpen=false">
      <template v-if="drawerScenarios.length === 0">
        <div class="empty">Aucun scénario dans cette commune</div>
      </template>
      <template v-else>
        <ScenarioCard v-for="s in drawerScenarios" :key="s.id" :scenario="s" @select="(sc)=>{
          const center = map.getCenter();
          router.push({ name: 'scenario-detail', params: { id: sc.id }, query: { from: 'map', commune: ui.selectedId || undefined, zoom: map.getZoom(), lat: center.lat.toFixed(5), lon: center.lng.toFixed(5) } })
        }" />
      </template>
    </BottomDrawer>
  </div>
 </template>

<style scoped lang="scss">
@use '@/styles/theme.scss' as *;
.explore-layout { position:relative; width:100%; height:100dvh; overflow:hidden; }
.explore-map { position:absolute; inset:0; z-index:1; }

.map-controls { position:absolute; top:12px; left:12px; z-index:5; background:rgba(15,23,42,.82); color:#e2e8f0; border:1px solid rgba(255,255,255,.12); padding:8px 10px; border-radius:10px; backdrop-filter:blur(6px); box-shadow:0 4px 12px rgba(0,0,0,0.35); }
.map-controls .toggle { display:flex; align-items:center; gap:8px; font-size:.85rem; }
.map-controls input { accent-color:#60a5fa; }

.shape-progress { position:absolute; top:12px; left:50%; transform:translateX(-50%); min-width:260px; background:rgba(15,23,42,0.82); color:#f1f5f9; padding:10px 14px; font-size:12px; border-radius:8px; backdrop-filter: blur(4px); box-shadow:0 4px 12px rgba(0,0,0,0.35); display:flex; flex-direction:column; gap:6px; }
.shape-progress .label { font-weight:600; letter-spacing:.5px; text-align:center; }
.shape-progress .bar-wrapper { height:8px; background:#334155; border-radius:4px; overflow:hidden; }
.shape-progress .bar { height:100%; background:linear-gradient(90deg,#0ea5e9,#38bdf8); transition:width .12s ease-out; }
.shape-progress .pct { font-family:monospace; text-align:center; font-size:11px; opacity:.85; }
.shape-error { position:absolute; top:8px; left:50%; transform:translateX(-50%); background:#7f1d1d; color:#fee2e2; padding:6px 12px; font-size:12px; border-radius:4px; box-shadow:0 2px 6px rgba(0,0,0,0.35); }

.empty { text-align:center; padding:32px 0; color:#64748b; font-size:14px; }

.explore-map :deep(.leaflet-control-attribution) {
  background: rgba(15,23,42,0.55);
  color: #94a3b8;
  font-size: 10px;
  a { color: #cbd5e1; }
}

.scenario-popup { font-size:12px; line-height:1.35; }
.scenario-popup ul { margin:4px 0 0; padding:0 0 0 16px; max-width:200px; }
.scenario-popup li { margin:0 0 2px; padding:0; }
.scenario-popup li.published { color:#10b981; }
.scenario-popup li.draft { color:#94a3b8; }
</style>
<style lang="scss">
/* Global (non-scoped) styles: Leaflet injecte des div sans attribut de scope */
.scenario-dot-wrapper { pointer-events:auto; }
.scenario-dot { position:relative; display:flex; align-items:center; justify-content:center; font-weight:600; color:#fff; border-radius:50%; box-shadow:0 1px 4px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.25); font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; transition:filter .15s ease, transform .15s ease; }
.scenario-dot.published { background:linear-gradient(135deg,#16a34a,#22c55e); }
.scenario-dot.draft { background:linear-gradient(135deg,#475569,#64748b); }
.scenario-dot::after { content:''; position:absolute; inset:0; border-radius:50%; box-shadow:0 0 0 2px rgba(255,255,255,0.15); }
.scenario-dot:hover { filter:brightness(1.15) saturate(1.05); }
.scenario-dot:active { transform:scale(.9); }
.scenario-cluster-agg-wrapper { pointer-events:auto; }
.scenario-cluster-agg { position:relative; font-weight:600; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; background:linear-gradient(135deg,#334155,#475569); color:#f1f5f9; text-align:center; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.15); font-size:13px; letter-spacing:.5px; transition:filter .15s ease, transform .15s ease; }
.scenario-cluster-agg::after { content:''; position:absolute; inset:0; border-radius:50%; box-shadow:0 0 0 3px rgba(255,255,255,0.08), 0 0 12px -2px rgba(59,130,246,0.45); }
.scenario-cluster-agg:hover { filter:brightness(1.18) saturate(1.05); }
.scenario-cluster-agg:active { transform:scale(.9); }
</style>
