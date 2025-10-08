import { apiFetch } from './http'

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
      body: { username_user: username, mail_user: mail, password_user: password },
    })
  },
  me() {
    return apiFetch('/me', { auth: true })
  },
  player() {
    return apiFetch('/me/player', { auth: true })
  },
  updatePlayer(data) {
    return apiFetch('/me/player', { method: 'PUT', auth: true, body: data })
  },
  players() {
    return apiFetch('/players', { auth: true })
  },
}
