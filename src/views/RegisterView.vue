<script setup>
import { useUsersStore } from '@/stores/users'
import { ref } from 'vue'

const storeUsers = useUsersStore()

const username = ref('')
const nickname = ref('')
const bio = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
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
const goToLogin = () => {
  storeUsers.SwitchPage('login')
}

</script>

<template>
  <div class="background"></div>
  <div class="register_form_wrapper">
    <form class="register_form" id="registerForm" @submit.prevent="registerUser">
      <h2 class="register_form__greeting">Bienvenue, nouveau explorateur !</h2>
      <div class="register_form__group">
        <input class="register_form__input" type="text" v-model="username" placeholder="Ecrire votre username"
          required />
      </div>
      <div class="register_form__group">
        <input class="register_form__input" type="text" v-model="nickname" placeholder="Ecrire votre nickname"
          required />
      </div>
      <div class="register_form__group">
        <input class="register_form__input" type="text" v-model="bio" placeholder="bio" required />
      </div>
      <div class="register_form__group">
        <input class="register_form__input" type="email" v-model="email" placeholder="Adresse e-mail" required />
      </div>
      <div class="register_form__group register_form__group--password">
        <input class="register_form__input" :type="showPassword ? 'text' : 'password'" v-model="password"
          placeholder="Mot de passe" required />
        <button type="button" class="register_form__toggle_eye" @click.prevent="togglePassword"
          aria-label="Afficher ou masquer le mot de passe">
          <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
        </button>
      </div>
      <button type="submit" class="register_form__submit">S'inscrire</button>
      <a class="register_form__switch_page" @click.prevent="goToLogin">Vous avez deja un compte ?</a>
    </form>
  </div>

</template>

<style lang="scss" scoped></style>
