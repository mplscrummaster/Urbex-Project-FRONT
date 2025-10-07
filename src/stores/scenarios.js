import { defineStore } from 'pinia'
import { ScenariosAPI } from '@/services/api'

export const useScenariosStore = defineStore('scenarios', {
  state: () => ({
    items: [], // array of scenarios with status, bookmarked, etc.
    loading: false,
    error: null,
    lastLoadedAt: null,
    progressLoading: false,
    progressErrors: {}, // id -> message
    fullCache: {}, // id -> full scenario
    fullLoading: false,
  }),
  getters: {
    completed: (s) => s.items.filter((i) => i.status === 'completed'),
    started: (s) => s.items.filter((i) => i.status === 'started'),
    notStarted: (s) => s.items.filter((i) => i.status === 'not_started'),
  },
  actions: {
    async fetchMine(force = false) {
      if (this.loading) return
      if (!force && this.items.length && Date.now() - this.lastLoadedAt < 15000) return
      this.loading = true
      this.error = null
      try {
        const data = await ScenariosAPI.getMine()
        // API returns an array: [{ id,title,status,bookmarked,started_at,completed_at }]
        // For now no author or mission counts — placeholder fields can be enriched later.
        this.items = data.map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          bookmarked: !!row.bookmarked,
          // Frontend uses camelCase naming internally
          startedAt: row.started_at || null,
          completedAt: row.completed_at || null,
          // temp progression ratio heuristic (completed => 1, started => 0.4, else 0)
          progressRatio: row.status === 'completed' ? 1 : row.status === 'started' ? 0.4 : 0,
          author: row.author || '—',
        }))
        this.lastLoadedAt = Date.now()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async enrichProgress(concurrency = 3) {
      if (this.progressLoading) return
      const targets = this.items.filter((s) => !s.hasPreciseProgress)
      if (!targets.length) return
      this.progressLoading = true
      const queue = [...targets]
      const runNext = async () => {
        const el = queue.shift()
        if (!el) return
        try {
          const data = await ScenariosAPI.getProgress(el.id)
          const missions = data.missions || []
          const completed = missions.filter((m) => m.completed).length
          const total = missions.length
          const ratio = total === 0 ? 0 : completed / total
          // update item in place
          const ref = this.items.find((i) => i.id === el.id)
          if (ref) {
            ref.progressRatio = ratio
            ref.completedMissions = completed
            ref.totalMissions = total
            ref.hasPreciseProgress = true
          }
        } catch (e) {
          this.progressErrors[el.id] = e.message
        } finally {
          await runNext()
        }
      }
      const workers = Array.from({ length: Math.min(concurrency, targets.length) }, () => runNext())
      await Promise.all(workers)
      this.progressLoading = false
    },
    async refreshAll() {
      await this.fetchMine(true)
      await this.enrichProgress()
    },
    async fetchFull(id, force = false) {
      if (!force && this.fullCache[id]) return this.fullCache[id]
      this.fullLoading = true
      try {
        const data = await ScenariosAPI.getFull(id)
        // Normaliser le champ titre (backend renvoie title_scenario)
        if (data && data.scenario) {
          if (!data.scenario.title && data.scenario.title_scenario) {
            data.scenario.title = data.scenario.title_scenario
          }
        }
        this.fullCache[id] = data
        return data
      } finally {
        this.fullLoading = false
      }
    },
    async toggleBookmark(id, opts = { confirmCallback: null, fromState: undefined }) {
      // toggle bookmark (no verbose logs)
      const item = this.items.find((i) => i.id === id)
      const full = this.fullCache[id]
      // Determine current bookmarked state in a way that's stable even if the caller performed
      // optimistic updates on fullCache. Prefer explicit fromState, then items (authoritative list).
      const isBookmarked =
        typeof opts?.fromState === 'boolean' ? opts.fromState : item?.bookmarked === true
      // If unbookmarking & scenario has progress beyond not_started -> need confirmation
      if (isBookmarked) {
        const hasProgress =
          (item && item.status !== 'not_started') ||
          (full && full.progress && full.progress.scenario.status !== 'not_started')
        if (hasProgress && opts.confirmCallback) {
          const ok = await opts.confirmCallback()
          if (!ok) return false
        }
        await ScenariosAPI.unbookmark(id)
        this.items = this.items.filter((s) => s.id !== id)
        delete this.fullCache[id]
        // unbookmark done
      } else {
        // bookmark flow
        await ScenariosAPI.bookmark(id)
        // Optimistic add to list so UI reflects immediately
        const exists = this.items.some((s) => s.id === id)
        if (!exists) {
          const cached = this.fullCache[id]
          const title = cached?.scenario?.title || cached?.scenario?.title_scenario || '—'
          const author = cached?.scenario?.author || '—'
          const status = cached?.progress?.scenario?.status || 'not_started'
          this.items.push({
            id,
            title,
            status,
            bookmarked: true,
            startedAt: cached?.progress?.scenario?.started_at || null,
            completedAt: cached?.progress?.scenario?.completed_at || null,
            progressRatio: status === 'completed' ? 1 : status === 'started' ? 0.4 : 0,
            author,
          })
          // inserted into list (optimistic)
        } else {
          // Ensure it's flagged as bookmarked
          const ref = this.items.find((s) => s.id === id)
          if (ref) ref.bookmarked = true
          // flagged existing item as bookmarked
        }
        // Refresh from server to reconcile
        await this.fetchMine(true)
        // fetchMine reconciled
      }
      return true
    },
  },
})
