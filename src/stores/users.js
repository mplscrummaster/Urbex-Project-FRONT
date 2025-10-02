import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

const Api_Link = 'http://91.134.99.3:3000'

export const useUsersStore = defineStore('storeUsers', {
  state: () => ({
    users: [],
    currentIdUser: null,
    router: useRouter(),
    tokenUser: localStorage.getItem('tokenUser'),
  }),

  actions: {
    async loginUser(email, password) {
      // console.log(email + ' ' + password)

      const data = {
        mail_user: email,
        password_user: password,
      }

      try {
        const response = await fetch(`${Api_Link}/api/login`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (response.ok) {
          // console.log('Connexion réussie !')
          console.log(result) // Traiter la réponse API ici
          this.currentIdUser = result.id
          this.tokenUser = result.token
          localStorage.setItem('tokenUser', this.tokenUser)
          //  console.log(this.currentIdUser)
          this.router.replace('/scenario')

          // Par exemple, rediriger vers une autre page
          // window.location.href = "/dashboard.html";
        } else {
          console.log(result || 'Erreur lors de la connexion')
        }
      } catch (error) {
        console.error('Erreur:', error)
        // console.log('Impossible de contacter le serveur.')
      }
    },
    async registerUser({ username, nickname, bio, email, password }) {
      const dataUser = {
        username_user: username,
        password_user: password,
        mail_user: email,
      }
      const dataPlayer = {
        nickname: nickname,
        bio: bio,
      }
      console.log('dataUser', dataUser)
      const requestDataUserValidation = await this.requestDataUser(dataUser)
      const requestDataPlayerValidation = await this.requestDataPlayer(dataPlayer)

      if (requestDataUserValidation && requestDataPlayerValidation) this.router.replace('/scenario')
      else {
        console.log('Enregistrement impossible')
        alert('Veuillez réessayer')
      }
    },
    async requestDataUser(dataUser) {
      try {
        const responseUser = await fetch(`${Api_Link}/api/register`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataUser),
        })

        const result = await responseUser.json()

        if (responseUser.ok) {
          // console.log('Inscription réussie !')
          console.log(result)
          this.currentIdUser = result.id
          this.tokenUser = result.token
          localStorage.setItem('tokenUser', this.tokenUser)
          //  console.log(this.currentIdUser)
          return true
        } else {
          console.log(result || `Erreur lors de l'inscription`)
          return false
        }
      } catch (error) {
        console.error('Erreur:', error)
        return false
        // console.log('Impossible de contacter le serveur')
      }
    },
    async requestDataPlayer(dataPlayer) {
      try {
        const responsePlayer = await fetch(`${Api_Link}/api/me/player`, {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.tokenUser,
          },
          body: JSON.stringify(dataPlayer),
        })

        const result = await responsePlayer.json()

        if (responsePlayer.ok) {
          // console.log('Inscription réussie !')
          console.log(result)
          //  console.log(this.currentIdUser)
          return true
        } else {
          console.log(result || `Erreur lors de l'inscription`)
          return false
        }
      } catch (error) {
        console.error('Erreur:', error)
        return false
        // console.log('Impossible de contacter le serveur')
      }
    },
    async getMeInfo() {
      try {
        const responsePlayer = await fetch(`${Api_Link}/api/me/player`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.tokenUser,
          },
        })

        const result = await responsePlayer.json()

        if (responsePlayer.ok) {
          // console.log('Inscription réussie !')
          console.log(result)
          //  console.log(this.currentIdUser)
          return result
        } else {
          console.log(result || `Erreur lors de l'inscription`)
          return null
        }
      } catch (error) {
        console.error('Erreur:', error)
        return null
        // console.log('Impossible de contacter le serveur')
      }
    },
    async setMeInfo(username, bio, url_img_avatar) {
      try {
        const dataMe = {
          nickname: username,
          bio: bio,
          url_img_avatar: url_img_avatar,
        }
        const responsePlayer = await fetch(`${Api_Link}/api/me/player`, {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.tokenUser,
          },
          body: JSON.stringify(dataMe),
        })

        const result = await responsePlayer.json()

        if (responsePlayer.ok) {
          // console.log('Inscription réussie !')
          console.log(result)
          //  console.log(this.currentIdUser)
          return result
        } else {
          console.log(result || `Erreur lors de l'inscription`)
          return null
        }
      } catch (error) {
        console.error('Erreur:', error)
        return null
        // console.log('Impossible de contacter le serveur')
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
    },
    logout() {
      this.tokenUser = null
      this.currentIdUser = null
      localStorage.removeItem('tokenUser')
      try {
        this.router.replace('/login')
      } catch (e) {
        console.warn('Router replace failed during logout:', e?.message)
      }
    },
  },
})
