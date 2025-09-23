import { defineStore } from 'pinia'

export const useUsersStore = defineStore('storeUsers', {
  state: () => ({
    users: [],
    currentUser: null,
  }),
  actions: {
    async loginUser(email, password) {
      console.log(email + ' ' + password)

      const data = {
        mail_user: email,
        password_user: password,
      }

      try {
        const response = await fetch('http://localhost:80/api/login', {
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
      const data = {
        username_user: username,
        firstname_user: firstname,
        name_user: lastname,
        password_user: password,
        mail_user: email,
      }
      console.log(data)
      try {
        const response = await fetch('http://localhost:80/api/login', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (response.ok) {
          alert('Inscrirtion réussie !')
          console.log(result) // Traiter la réponse API ici
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
