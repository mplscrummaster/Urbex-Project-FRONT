import { defineStore } from 'pinia'
import { CommunesAPI, ScenariosAPI } from '@/services/api'

export const useCommunesStore = defineStore('communes', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    byId: {},
    scenarioIndex: {},
    preloadedScenarios: false,
    // Cached map data
    shapesFc: null, // GeoJSON FeatureCollection
    shapesLoaded: false,
    pins: [], // scenario-communes links for map markers
    pinsLoaded: false,
  }),
  actions: {
    async fetchAll(force = false) {
      if (this.loading) return
      if (!force && this.items.length) return
      this.loading = true
      this.error = null
      try {
        const data = await CommunesAPI.list()
        this.items = data.map((r) => ({
          id: r.id,
          name: r.name_fr || r.name_nl || r.name_de,
          lat: r.lat,
          lon: r.lon,
          scenario_count: null,
        }))
        this.byId = this.items.reduce((acc, c) => {
          acc[c.id] = c
          return acc
        }, {})
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async fetchOne(id) {
      if (this.byId[id]?.scenarios) return this.byId[id]
      const data = await CommunesAPI.get(id)
      const entry = this.byId[id] || { id: data.id }
      entry.name = data.name_fr || data.name_nl || data.name_de
      entry.lat = data.lat
      entry.lon = data.lon
      entry.scenarios = data.scenarios || []
      entry.scenario_count = entry.scenarios.length
      // geometry non stockée ici désormais
      this.byId[id] = entry
      this.scenarioIndex[id] = entry.scenarios.map((s) => s.id)
      return entry
    },
    async backgroundScan(batchSize = 20, delayMs = 120) {
      const ids = this.items.filter((c) => this.byId[c.id]?.scenario_count == null).map((c) => c.id)
      for (let i = 0; i < ids.length; i += batchSize) {
        const slice = ids.slice(i, i + batchSize)
        await Promise.all(slice.map((id) => this.fetchOne(id).catch(() => {})))
        await new Promise((r) => setTimeout(r, delayMs))
      }
    },
    async prefetchShapes(force = false) {
      if (this.shapesLoaded && !force) return this.shapesFc
      try {
        let fc = null
        try {
          fc = await CommunesAPI.shapesFeatureCollection()
        } catch {
          fc = null
        }
        let feats = fc?.features || []
        if (!feats.length) {
          try {
            const rows = await CommunesAPI.shapesAll()
            const built = []
            for (const r of rows || []) {
              if (!r?.geo_shape_geojson) continue
              try {
                const geom = JSON.parse(r.geo_shape_geojson)
                built.push({ type: 'Feature', geometry: geom, properties: { id: r.id } })
              } catch {
                /* ignore malformed geom */
              }
            }
            feats = built
            fc = { type: 'FeatureCollection', features: feats }
          } catch {
            // keep empty
          }
        }
        this.shapesFc = fc || { type: 'FeatureCollection', features: feats }
        this.shapesLoaded = true
        return this.shapesFc
      } catch {
        this.shapesFc = { type: 'FeatureCollection', features: [] }
        this.shapesLoaded = true
        return this.shapesFc
      }
    },
    async getShapes() {
      if (!this.shapesLoaded) await this.prefetchShapes()
      return this.shapesFc?.features || []
    },
    async prefetchScenarioPins(force = false) {
      if (this.pinsLoaded && !force) return this.pins
      try {
        const rows = await ScenariosAPI.listScenarioCommunes()
        this.pins = Array.isArray(rows) ? rows : []
        this.pinsLoaded = true
        return this.pins
      } catch {
        this.pins = []
        this.pinsLoaded = true
        return this.pins
      }
    },
    async getScenarioPins() {
      if (!this.pinsLoaded) await this.prefetchScenarioPins()
      return this.pins
    },
  },
})
