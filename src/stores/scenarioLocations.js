import { defineStore } from 'pinia'
import { ScenariosAPI } from '@/services/api'

export const useScenarioLocationsStore = defineStore('scenarioLocations', {
  state: () => ({
    items: [], // [{ id,title, communes:[{id,lat,lon,name_fr,...}] }]
    loading: false,
    error: null,
    loadedAt: null,
  }),
  actions: {
    async fetchAll(force = false) {
      if (this.loading) return
      if (!force && this.items.length && Date.now() - this.loadedAt < 60000) return
      this.loading = true
      this.error = null
      try {
        const data = await ScenariosAPI.listWithCommunes()
        this.items = data
        this.loadedAt = Date.now()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
  },
})
