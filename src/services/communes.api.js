import { apiFetch } from './http'

export const CommunesAPI = {
  list(params = {}) {
    const qs = new URLSearchParams()
    if (params.q) qs.set('q', params.q)
    if (params.postal) qs.set('postal', params.postal)
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch(`/communes${query}`)
  },
  get(id) {
    return apiFetch(`/communes/${id}`)
  },
  shape(id) {
    return apiFetch(`/communes/${id}/shape`)
  },
  shapesAll() {
    return apiFetch('/communes/shapes/all')
  },
  shapesFeatureCollection() {
    return apiFetch('/communes/shapes.geojson')
  },
  byScenario(id) {
    return apiFetch(`/scenarios/${id}/communes`)
  },
}
