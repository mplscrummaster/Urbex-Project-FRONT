// Simple API helper (Step 1: auth only)
// Future: centralize error handling, auth refresh, scenario endpoints...

// Previous remote deployment base URL kept for reference:
// const BASE_URL = 'http://91.134.99.3:3000/api'
// Local development API base URL:
const BASE_URL = 'http://91.134.99.3:3000/api'

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = localStorage.getItem('auth_token')
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    // ignore JSON parse error (e.g. empty body)
  }
  if (!res.ok) {
    const error = (data && (data.error || data.message)) || res.statusText
    throw new Error(error)
  }
  return data
}

export const AuthAPI = {
  login(mail, password) {
    return apiFetch('/login', {
      method: 'POST',
      body: { mail_user: mail, password_user: password },
    })
  },
  register(username, mail, password) {
    return apiFetch('/register', {
      method: 'POST',
      body: {
        username_user: username,
        mail_user: mail,
        password_user: password,
      },
    })
  },
  me() {
    return apiFetch('/me', { auth: true })
  },
}

export const ScenariosAPI = {
  listAll() {
    return apiFetch('/scenarios')
  },
  getMine() {
    // Returns bookmarked or started scenarios for current user
    return apiFetch('/me/scenarios', { auth: true })
  },
  getProgress(id) {
    return apiFetch(`/scenarios/${id}/progress`, { auth: true })
  },
  getFull(id) {
    return apiFetch(`/scenarios/${id}/full`, { auth: true })
  },
  start(id) {
    return apiFetch(`/scenarios/${id}/start`, { method: 'POST', auth: true })
  },
  complete(id) {
    return apiFetch(`/scenarios/${id}/complete`, { method: 'POST', auth: true })
  },
  bookmark(id) {
    return apiFetch(`/scenarios/${id}/bookmark`, { method: 'POST', auth: true })
  },
  unbookmark(id) {
    return apiFetch(`/scenarios/${id}/bookmark`, { method: 'DELETE', auth: true })
  },
  // Lightweight scenario->commune pin data (optionally only published)
  listPins({ published } = {}) {
    const qs = new URLSearchParams()
    if (published) qs.set('published', '1')
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch(`/scenarios/communes${query}`)
  },
  listScenarioCommunes(options = {}) {
    return this.listPins(options)
  },
}

export const MissionsAPI = {
  complete(id) {
    return apiFetch(`/missions/${id}/complete`, { method: 'POST', auth: true })
  },
}

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
  // Legacy batch (kept if needed): shapes(ids) {}
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

export { BASE_URL }
