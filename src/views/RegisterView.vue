<script setup>
  import { useUsersStore } from '@/stores/users'
  import { ref } from 'vue'

  const storeUsers = useUsersStore()

  const username = ref('')
  const nickname = ref('')
  const bio = ref('')
  const email = ref('')
  const password = ref('')

  const togglePassword = () => {
    const passwordInput = document.getElementById('password')
    const eyeIcon = document.getElementById('eyeIcon')
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text'
      eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `
    } else {
      passwordInput.type = 'password'
      eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <line x1="12" y1="12" x2="12" y2="12"></line>
    `
    }
  }

  // Écoute de la soumission du formulaire
  const registerUser = async () => {
    // Vérification simple
    if (!email.value || !password.value || !username.value || !nickname.value || !bio.value) {
      alert('Veuillez remplir tous les champs !')
      return
    }

    // Préparation des données à envoyer
    storeUsers.registerUser({
      username: username.value,
      nickname: nickname.value,
      bio: bio.value,
      email: email.value,
      password: password.value,
    })
    username.value = ''
    nickname.value = ''
    bio.value = ''
    email.value = ''
    password.value = ''
  }
</script>

<template>
  <form class="register_form" id="registerForm" @submit.prevent="registerUser">
    <div class="register_form__group">
      <input class="register_form__input" type="text" v-model="username" placeholder="Ecrire votre username" required />
    </div>
    <div class="register_form__group">
      <input class="register_form__input" type="text" v-model="nickname" placeholder="Ecrire votre nickname" required />
    </div>
    <div class="register_form__group">
      <input class="register_form__input" type="text" v-model="bio" placeholder="bio" required />
    </div>
    <div class="register_form__group">
      <input class="register_form__input" type="email" v-model="email" placeholder="Adresse e-mail" required />
    </div>
    <div class="register_form__group register_form__group--password">
      <input class="register_form__input" type="password" v-model="password" placeholder="Mot de passe" required />
      <button type="button" class="register_form__toggle_eye" @click.prevent="togglePassword"
        aria-label="Afficher ou masquer le mot de passe">
        <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <line x1="12" y1="12" x2="12" y2="12"></line>
        </svg>
      </button>
    </div>
    <button type="submit" class="register_form__submit">S'inscrire</button>
  </form>
</template>

