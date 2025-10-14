// Shared HTTP helper for API modules
// export const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:3000/api'
export const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'https://michonmaximilien.dev/urbex-api/api'.replace(/\/$/, '')

const getAuthToken = () => localStorage.getItem('tokenUser') || null

export const apiFetch = async (
  path,
  { method = 'GET', body, auth = false, headers: extraHeaders = {}, raw = false } = {},
) => {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders }
  if (auth) {
    const token = getAuthToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  // no debug logs in production
  // console.log('`${BASE_URL}${path}`', `${BASE_URL}${path}`)
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (raw) return response
  let json = null
  try {
    json = await response.json()
  } catch {
    /* non JSON */
  }
  if (!response.ok) {
    const message = json?.error || json?.message || response.statusText || 'Request failed'
    const err = new Error(message)
    err.status = response.status
    err.payload = json
    if (response.status === 401 && typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('api:unauthorized'))
      } catch {
        /* noop */
      }
    }
    throw err
  }
  return json
}
