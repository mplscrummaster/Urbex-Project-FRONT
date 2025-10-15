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
  friends() {
    return apiFetch('/me/friends', { auth: true })
  },
  players() {
    return apiFetch('/players', { auth: true })
  },
  findFriend(nickname) {
    return apiFetch(`/friends/${nickname}`, { auth: true })
  },
  addFriend(ids) {
    return apiFetch(`/friends/add`, { method: 'POST', auth: true, body: ids })
  },
  deleteFriend(ids) {
    return apiFetch(`/friends/delete`, { method: 'DELETE', auth: true, body: ids })
  },
  getStartTutorial(_id_user) {
    return apiFetch(`/me/tutorial/${_id_user}`, { auth: true })
  },
  setStartTutorial(datas) {
    return apiFetch(`/me/tutorial`, { method: 'PUT', auth: true, body: datas })
  },
}
