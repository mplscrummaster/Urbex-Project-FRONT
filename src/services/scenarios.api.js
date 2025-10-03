import { apiFetch } from './http'

export const ScenariosAPI = {
  listAll() { return apiFetch('/scenarios') },
  getMine() { return apiFetch('/me/scenarios', { auth: true }) },
  getProgress(id) { return apiFetch(`/scenarios/${id}/progress`, { auth: true }) },
  getFull(id) { return apiFetch(`/scenarios/${id}/full`, { auth: true }) },
  start(id) { return apiFetch(`/scenarios/${id}/start`, { method: 'POST', auth: true }) },
  complete(id) { return apiFetch(`/scenarios/${id}/complete`, { method: 'POST', auth: true }) },
  bookmark(id) { return apiFetch(`/scenarios/${id}/bookmark`, { method: 'POST', auth: true }) },
  unbookmark(id) { return apiFetch(`/scenarios/${id}/bookmark`, { method: 'DELETE', auth: true }) },
  listPins({ published } = {}) {
    const qs = new URLSearchParams()
    if (published) qs.set('published', '1')
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch(`/scenarios/communes${query}`)
  },
  listScenarioCommunes(options = {}) { return this.listPins(options) },
}

export const MissionsAPI = {
  complete(id) { return apiFetch(`/missions/${id}/complete`, { method: 'POST', auth: true }) },
}
