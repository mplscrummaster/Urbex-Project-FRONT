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
    async registrUser(username, firstname, lastname, email, password) {
      const dataUser = {
        username_user: username,
        firstname_user: firstname,
        name_user: lastname,
        password_user: password,
        mail_user: email,
      }
      console.log(dataUser)
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
          this.router.replace('/scenario')
        } else {
          alert(result || `Erreur lors de l'inscription`)
        }
      } catch (error) {
        console.error('Erreur:', error)
        // alert('Impossible de contacter le serveur')
      }
    },
  },
})
