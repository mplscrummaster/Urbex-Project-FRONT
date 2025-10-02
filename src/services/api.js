// Simple API helper (Step 1: auth only)
// Future: centralize error handling, auth refresh, scenario endpoints...

const BASE_URL = 'http://91.134.99.3:3000/api' // Adjust if environment changes

function getAuthToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('tokenUser') || null
}

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getAuthToken()
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
}

export const MissionsAPI = {
  complete(id) {
    return apiFetch(`/missions/${id}/complete`, { method: 'POST', auth: true })
  },
}

export { BASE_URL }
