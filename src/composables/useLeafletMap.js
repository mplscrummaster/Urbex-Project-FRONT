import L from 'leaflet'

export const createBaseMap = (el, {
  center = [50.6402809, 4.6667145],
  zoom = 8,
  zoomControl = false,
  minZoom = 3,
  maxZoom = 20,
  preferCanvas = true,
  interactions = { scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, boxZoom: true },
} = {}) => {
  const map = L.map(el, { zoomControl, minZoom, maxZoom, preferCanvas, ...interactions })
  const darkNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom,
  })
  const fallbackOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  })
  darkNoLabels.addTo(map)
  darkNoLabels.on('tileerror', () => { if (!map.hasLayer(fallbackOSM)) fallbackOSM.addTo(map) })
  map.setView(center, zoom)
  return { map, base: darkNoLabels, fallback: fallbackOSM }
}

export const withLayerGroup = (map) => L.layerGroup().addTo(map)
