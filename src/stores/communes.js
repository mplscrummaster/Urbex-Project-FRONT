import { defineStore } from 'pinia'
import { CommunesAPI } from '@/services/api'

export const useCommunesStore = defineStore('communes', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    byId: {},
    scenarioIndex: {},
    preloadedScenarios: false,
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
  },
})
