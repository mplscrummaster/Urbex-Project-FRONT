import L from 'leaflet'

// Basemap catalog (no API keys required)
const basemaps = {
  'carto-voyager': {
    title: 'CARTO Voyager',
    create: (maxZoom) =>
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        subdomains: 'abcd',
        maxZoom,
        detectRetina: true,
      }),
  },
  'carto-positron': {
    title: 'CARTO Positron',
    create: (maxZoom) =>
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        subdomains: 'abcd',
        maxZoom,
        detectRetina: true,
      }),
  },
  'carto-darkmatter': {
    title: 'CARTO Dark Matter',
    create: (maxZoom) =>
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        subdomains: 'abcd',
        maxZoom,
        detectRetina: true,
      }),
    labels: (maxZoom) =>
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '',
          subdomains: 'abcd',
          maxZoom,
          detectRetina: true,
        },
      ),
  },
  'esri-light-gray': {
    title: 'Esri Light Gray',
    create: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.png',
        {
          attribution:
            'Tiles © Esri — Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors',
          maxZoom,
          maxNativeZoom: 16,
        },
      ),
    labels: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}.png',
        {
          attribution: '',
          maxZoom,
          maxNativeZoom: 16,
        },
      ),
  },
  'esri-dark-gray': {
    title: 'Esri Dark Gray',
    create: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}.png',
        {
          attribution:
            'Tiles © Esri — Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors',
          maxZoom,
          maxNativeZoom: 16,
        },
      ),
    labels: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}.png',
        {
          attribution: '',
          maxZoom,
          maxNativeZoom: 16,
        },
      ),
  },
  'esri-imagery': {
    title: 'Esri World Imagery',
    create: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Imagery © Esri & contributors | © OpenStreetMap contributors',
          maxZoom,
          maxNativeZoom: 18,
        },
      ),
    labels: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom,
          maxNativeZoom: 18,
        },
      ),
  },
  'esri-streets': {
    title: 'Esri Streets',
    create: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles © Esri — Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors',
          maxZoom,
          maxNativeZoom: 18,
        },
      ),
  },
  'esri-topographic': {
    title: 'Esri Topographic',
    create: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles © Esri — Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors',
          maxZoom,
          maxNativeZoom: 18,
        },
      ),
  },
  'esri-natgeo': {
    title: 'Esri National Geographic',
    create: (maxZoom) =>
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri, National Geographic, and contributors',
          maxZoom,
          maxNativeZoom: 16,
        },
      ),
  },
  opentopomap: {
    title: 'OpenTopoMap',
    create: (maxZoom) =>
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution:
          'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
        subdomains: 'abc',
        maxZoom: Math.min(maxZoom, 17),
      }),
  },
  'osm-hot': {
    title: 'OSM Humanitarian',
    create: (maxZoom) =>
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors, Humanitarian style by HOT',
        subdomains: 'abc',
        maxZoom: Math.min(maxZoom, 19),
      }),
  },
  'osm-standard': {
    title: 'OSM Standard',
    create: (maxZoom) =>
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: Math.min(maxZoom, 19),
      }),
  },
}

// Optionals: enable if API keys are provided via Vite env
// Add a .env.local with VITE_MAPBOX_TOKEN, VITE_MAPTILER_KEY, or VITE_STADIA_KEY to unlock these styles.
let env
try {
  env = import.meta?.env || {}
} catch {
  env = {}
}
const MB = env?.VITE_MAPBOX_TOKEN
if (MB) {
  basemaps['mapbox-dark'] = {
    title: 'Mapbox Dark',
    create: (maxZoom) =>
      L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/512/{z}/{x}/{y}?access_token=${MB}`,
        {
          attribution: '© Mapbox © OpenStreetMap',
          maxZoom,
          tileSize: 512,
          zoomOffset: -1,
        },
      ),
  }
  basemaps['mapbox-navigation-night'] = {
    title: 'Mapbox Navigation Night',
    create: (maxZoom) =>
      L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/512/{z}/{x}/{y}?access_token=${MB}`,
        {
          attribution: '© Mapbox © OpenStreetMap',
          maxZoom,
          tileSize: 512,
          zoomOffset: -1,
        },
      ),
  }
  basemaps['mapbox-satellite-streets'] = {
    title: 'Mapbox Satellite Streets',
    create: (maxZoom) =>
      L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}?access_token=${MB}`,
        {
          attribution: '© Mapbox © OpenStreetMap © Maxar',
          maxZoom,
          tileSize: 512,
          zoomOffset: -1,
        },
      ),
  }
}
const MT = env?.VITE_MAPTILER_KEY
if (MT) {
  basemaps['maptiler-dark'] = {
    title: 'MapTiler Dark',
    create: (maxZoom) =>
      L.tileLayer(`https://api.maptiler.com/maps/dark-v2/{z}/{x}/{y}{r}.png?key=${MT}`, {
        attribution: '© MapTiler © OpenStreetMap',
        maxZoom,
        detectRetina: true,
      }),
  }
  basemaps['maptiler-outdoor'] = {
    title: 'MapTiler Outdoor',
    create: (maxZoom) =>
      L.tileLayer(`https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}{r}.png?key=${MT}`, {
        attribution: '© MapTiler © OpenStreetMap',
        maxZoom,
        detectRetina: true,
      }),
  }
}
const ST = env?.VITE_STADIA_KEY
if (ST) {
  basemaps['stadia-alidade-dark'] = {
    title: 'Stadia Alidade Dark',
    create: (maxZoom) =>
      L.tileLayer(
        `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${ST}`,
        {
          attribution: '© Stadia Maps © OpenMapTiles © OpenStreetMap',
          maxZoom,
          detectRetina: true,
        },
      ),
  }
}

const defaultStyleKey = 'carto-darkmatter'
const storageKey = 'map:basemap-style'

const getStoredStyle = () => {
  try {
    const v = localStorage.getItem(storageKey)
    return v && basemaps[v] ? v : defaultStyleKey
  } catch {
    return defaultStyleKey
  }
}
const setStoredStyle = (key) => {
  try {
    localStorage.setItem(storageKey, key)
  } catch {
    /* ignore */
  }
}

export const createBaseMap = (
  el,
  {
    center = [50.6402809, 4.6667145],
    zoom = 8,
    zoomControl = false,
    minZoom = 3,
    maxZoom = 20,
    preferCanvas = true,
    interactions = { scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, boxZoom: true },
    styleKey = getStoredStyle(),
    // Back-compat: support esriLabels, but prefer withLabels
    withLabels: _withLabels,
    esriLabels,
  } = {},
) => {
  const map = L.map(el, { zoomControl, minZoom, maxZoom, preferCanvas, ...interactions })

  let baseLayer = null
  let labelsLayer = null
  const fallbackOSM = basemaps['osm-standard'].create(maxZoom)
  const wantLabels =
    typeof _withLabels === 'boolean'
      ? _withLabels
      : typeof esriLabels === 'boolean'
        ? esriLabels
        : true

  const applyStyle = (key) => {
    const def = basemaps[key] || basemaps[defaultStyleKey]
    // remove previous
    if (baseLayer) {
      try {
        map.removeLayer(baseLayer)
      } catch {
        /* noop */
      }
      baseLayer = null
    }
    if (labelsLayer) {
      try {
        map.removeLayer(labelsLayer)
      } catch {
        /* noop */
      }
      labelsLayer = null
    }
    // add new
    baseLayer = def.create(maxZoom)
    baseLayer.addTo(map)
    baseLayer.on('tileerror', () => {
      if (!map.hasLayer(fallbackOSM)) fallbackOSM.addTo(map)
    })
    // Label overlay if available and requested
    if (def.labels && wantLabels) {
      labelsLayer = def.labels(maxZoom)
      labelsLayer.addTo(map)
    }
    setStoredStyle(key)
    currentKey = key
  }

  let currentKey = styleKey && basemaps[styleKey] ? styleKey : defaultStyleKey
  applyStyle(currentKey)
  map.setView(center, zoom)

  return {
    map,
    base: baseLayer, // backward compatibility
    fallback: fallbackOSM,
    getBaseStyle: () => currentKey,
    setBaseStyle: (key) => applyStyle(key),
    availableBaseStyles: Object.entries(basemaps).map(([key, def]) => ({ key, title: def.title })),
  }
}

export const withLayerGroup = (map) => L.layerGroup().addTo(map)
