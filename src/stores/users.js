import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

const Api_Link = 'http://91.134.99.3:3000'

export const useUsersStore = defineStore('storeUsers', {
  state: () => ({
    users: [],
    currentIdUser: null,
    router: useRouter(),
    tokenUser: null,
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
          // alert('Connexion réussie !')
          console.log(result) // Traiter la réponse API ici
          this.currentIdUser = result.id
          this.tokenUser = result.token
          localStorage.setItem('tokenUser', this.tokenUser)
          //  console.log(this.currentIdUser)
          this.router.replace('/scenario')

          // Par exemple, rediriger vers une autre page
          // window.location.href = "/dashboard.html";
        } else {
          alert(result || 'Erreur lors de la connexion')
        }
      } catch (error) {
        console.error('Erreur:', error)
        // alert('Impossible de contacter le serveur.')
      }
    },
    async registrUser(username, nickname, bio, email, password) {
      const dataUser = {
        username_user: username,
        password_user: password,
        mail_user: email,
      }
      const dataPlayer = {
        nickname: nickname,
        bio: bio,
      }
      console.log(dataUser)
      const requestDataUserValidation = this.requestDataUser(dataUser)
      const requestDataPlayerValidation = this.requestDataPlayer(dataPlayer)

      if (requestDataUserValidation && requestDataPlayerValidation) this.router.replace('/scenario')
      else console.log('Enregistrement impossible')
    },
    async requestDataUser(dataUser) {
      try {
        const response = await fetch(`${Api_Link}/api/register`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataUser),
        })

        const result = await response.json()

        if (response.ok) {
          // alert('Inscription réussie !')
          console.log(result)
          this.currentIdUser = result.id
          this.tokenUser = result.token
          localStorage.setItem('tokenUser', this.tokenUser)
          //  console.log(this.currentIdUser)
          return true
        } else {
          alert(result || `Erreur lors de l'inscription`)
          return false
        }
      } catch (error) {
        console.error('Erreur:', error)
        return false
        // alert('Impossible de contacter le serveur')
      }
    },
    async requestDataPlayer(dataPlayer) {
      try {
        const response = await fetch(`${Api_Link}/api/me/player`, {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataPlayer),
        })

        const result = await response.json()

        if (response.ok) {
          // alert('Inscription réussie !')
          console.log(result)
          //  console.log(this.currentIdUser)
          return true
        } else {
          alert(result || `Erreur lors de l'inscription`)
          return false
        }
      } catch (error) {
        console.error('Erreur:', error)
        return false
        // alert('Impossible de contacter le serveur')
      }
    },
  },
})
