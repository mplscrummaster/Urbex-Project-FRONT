import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useUsersStore = defineStore('storeUsers', {
  state: () => ({
    users: [],
    currentIdUser: null,
    router: useRouter(),
  }),
  actions: {
    async loginUser(email, password) {
      //A supp les 2 lignes du bas
      this.router.replace('/scenario')
      this.currentIdUser = 1

      console.log(email + ' ' + password)

      const data = {
        mail_user: email,
        password_user: password,
      }

      try {
        const response = await fetch('http://91.134.99.3:81/api/login', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (response.ok) {
          alert('Connexion réussie !')
          console.log(result) // Traiter la réponse API ici
          this.currentIdUser = result[0]._id_user
          this.router.replace('/scenario')

          // Par exemple, rediriger vers une autre page
          // window.location.href = "/dashboard.html";
        } else {
          alert(result || 'Erreur lors de la connexion')
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Impossible de contacter le serveur.')
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
        const response = await fetch('http://91.134.99.3:81/api/register', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataUser),
        })

        const result = await response.json()

        if (response.ok) {
          alert('Inscription réussie !')
          console.log(result)
          this.currentIdUser = result[0]._id_user
          // Traiter la réponse API ici
          // Par exemple, rediriger vers une autre page
          // window.location.href = "/dashboard.html";
        } else {
          alert(result || `Erreur lors de l'inscription`)
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Impossible de contacter le serveur')
      }
    },
  },
})
