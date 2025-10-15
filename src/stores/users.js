import { defineStore } from 'pinia'
import router from '@/router'
import { AuthAPI } from '@/services/api'

export const useUsersStore = defineStore('storeUsers', {
  state: () => ({
    users: null,
    currentIdUser: null,
    tokenUser: localStorage.getItem('tokenUser'),
    startTutorial: null,
  }),
  actions: {
    async loginUser(email, password) {
      try {
        const result = await AuthAPI.login(email, password)
        this.currentIdUser = result.id
        this.tokenUser = result.token
        localStorage.setItem('tokenUser', this.tokenUser)
        router.replace('/scenario')
        this.setStartTutorialLocalStorage()
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
          try {
            await AuthAPI.updatePlayer({ nickname, bio })
          } catch (e) {
            console.warn('updatePlayer optional failed:', e?.message || e)
          }
        }
        router.replace('/scenario')
        this.setStartTutorialLocalStorage()
      } catch (error) {
        console.error('Erreur inscription:', error?.message || error)
        alert('Enregistrement impossible. Veuillez réessayer.')
      }
    },
    async getMeInfo() {
      try {
        return await AuthAPI.player()
      } catch (e) {
        console.error('getMeInfo error:', e?.message || e)
        return null
      }
    },
    async setMeInfo(username, bio, url_img_avatar) {
      try {
        return await AuthAPI.updatePlayer({ nickname: username, bio, url_img_avatar })
      } catch (e) {
        console.error('setMeInfo error:', e?.message || e)
        return null
      }
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
      console.log('ask api for start tutorial')

      //demander a l'api pour le startTutorial
      this.setStartTutorialLocalStorage()
    },
    async setStartTutorialLocalStorage() {
      try {
        const startTutorial = await AuthAPI.getStartTutorial(this.currentIdUser)
        console.log('startTutorial', await startTutorial)
        localStorage.setItem('StartTutorial', await startTutorial.startTutorial)
      } catch (e) {
        console.warn('startTutorial error:', e.message)
        return null
      }
    },
    async setStartTutorialToApi() {
      //A MODIFIER ICI QUAND UN USER S'ENREGISTRE, IL FAUT LUI CREER UN START TUTORIAL ET LE METTRE A 1
      // OU BIEN LE FAIRE DANS L'API PLUTOT
      try {
        const startTutorial = await AuthAPI.getStartTutorial(this.currentIdUser)
        console.log('startTutorial', await startTutorial)
        localStorage.setItem('StartTutorial', await startTutorial.startTutorial)
      } catch (e) {
        console.warn('startTutorial error:', e.message)
        return null
      }
    },
    async setStartTutorialToFalseApi() {
      const datas = {
        _id_user: this.currentIdUser,
        startTutorial: 0,
      }
      try {
        const startTutorial = await AuthAPI.setStartTutorial(datas)
        console.log('startTutorial', startTutorial)
      } catch (e) {
        console.warn('startTutorial error:', e.message)
        return null
      }
    },
    logout() {
      this.tokenUser = null
      this.currentIdUser = null
      localStorage.clear()
      try {
        router.replace('/login')
      } catch (e) {
        console.warn('Router replace failed during logout:', e?.message)
      }
    },
    SwitchPage(page) {
      router.replace(`/${page}`)
    },
    getAllUsers: async () => {
      try {
        const response = await AuthAPI.players()
        return response
      } catch (error) {
        console.error('Impossible de récupérer les utilisateurs : ', error?.message || error)
        return null
      }
    },
    getAllFriends: async () => {
      try {
        const response = await AuthAPI.friends()
        return response
      } catch (error) {
        console.error('Impossible de récupérer les amis : ', error?.message || error)
        return null
      }
    },
    getFriend: async (nickname) => {
      try {
        const response = await AuthAPI.findFriend(nickname)
        // console.log(response)

        return response
      } catch (error) {
        console.error('Impossible de récupérer les amis : ', error?.message || error)
        return null
      }
    },
    addFriend: async (id1, id2) => {
      let ids = null
      if (id1 < id2) {
        ids = {
          id1,
          id2,
        }
      } else {
        ids = {
          id1: id2,
          id2: id1,
        }
      }
      console.log(ids)

      try {
        const response = await AuthAPI.addFriend(ids)
        console.log(response)

        return response
      } catch (error) {
        console.error('Impossible de récupérer les amis : ', error?.message || error)
        //Important pour le userProfile.vue dans l'ajoute d'amis
        throw error
      }
    },
    deleteFriend: async (id1, id2) => {
      let ids = null
      if (id1 < id2) {
        ids = {
          id1,
          id2,
        }
      } else {
        ids = {
          id1: id2,
          id2: id1,
        }
      }
      console.log(ids)

      try {
        const response = await AuthAPI.deleteFriend(ids)
        console.log(response)

        return response
      } catch (error) {
        console.error('Impossible de récupérer les amis : ', error?.message || error)
        //Important pour le userProfile.vue dans l'ajoute d'amis
        throw error
      }
    },
  },
})
