import { defineStore } from 'pinia'
import router from '@/router'
import { AuthAPI } from '@/services/api'

export const useUsersStore = defineStore('storeUsers', {
  state: () => ({
    users: [],
    currentIdUser: null,
    tokenUser: localStorage.getItem('tokenUser'),
  }),

  actions: {
    async loginUser(email, password) {
      try {
        const result = await AuthAPI.login(email, password)
        this.currentIdUser = result.id
        this.tokenUser = result.token
        localStorage.setItem('tokenUser', this.tokenUser)
        router.replace('/scenario')
      } catch (error) {
        console.error('Erreur connexion:', error?.message || error)
        alert('Connexion échouée. Vérifiez vos identifiants.')
      }
    },
    async registerUser({ username, nickname, bio, email, password }) {
      try {
        const userRes = await AuthAPI.register(username, email, password)
        this.currentIdUser = userRes.id
        this.tokenUser = userRes.token
        localStorage.setItem('tokenUser', this.tokenUser)
        // Créer/mettre à jour le profil joueur si fourni
        if (nickname || bio) {
          try { await AuthAPI.updatePlayer({ nickname, bio }) } catch (e) { console.warn('updatePlayer optional failed:', e?.message || e) }
        }
        router.replace('/scenario')
      } catch (error) {
        console.error('Erreur inscription:', error?.message || error)
        alert("Enregistrement impossible. Veuillez réessayer.")
      }
    },
    async getMeInfo() {
      try { return await AuthAPI.player() } catch (e) { console.error('getMeInfo error:', e?.message || e); return null }
    },
    async setMeInfo(username, bio, url_img_avatar) {
      try { return await AuthAPI.updatePlayer({ nickname: username, bio, url_img_avatar }) } catch (e) { console.error('setMeInfo error:', e?.message || e); return null }
    },
    // Hydrate store from existing localStorage token at app bootstrap
    async hydrate() {
      const token = localStorage.getItem('tokenUser')
      if (!token) return
      this.tokenUser = token
      // Keep both keys aligned for API helper fallback
      // localStorage.setItem('auth_token', token) // supprimé, on ne garde que tokenUser
      try {
        const me = await this.getMeInfo()
        if (me && me.id) this.currentIdUser = me.id
      } catch (e) {
        console.warn('Hydrate failed, clearing token:', e.message)
        this.tokenUser = null
        localStorage.removeItem('tokenUser')
      }
    },
    logout() {
      this.tokenUser = null
      this.currentIdUser = null
      localStorage.removeItem('tokenUser')
      try { router.replace('/login') } catch (e) { console.warn('Router replace failed during logout:', e?.message) }
    },
  },
})
