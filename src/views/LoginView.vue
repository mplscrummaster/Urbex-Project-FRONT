<script setup>
  import { useUsersStore } from '@/stores/users'
  import { ref } from 'vue'

  const storeUsers = useUsersStore()

  const email = ref('')
  const password = ref('')
  const showPassword = ref(false)

  const togglePassword = () => { showPassword.value = !showPassword.value }

  const loginUser = async () => {
    if (!email.value || !password.value) { alert('Veuillez remplir tous les champs !'); return }
    await storeUsers.loginUser(email.value, password.value)
  }

  const goToRegister = () => {
    storeUsers.SwitchPage('register')
  }
</script>

<template>
  <div class="background"></div>
  <div class="login_form_wrapper">

    <form class="login_form" id="loginForm" @submit.prevent="loginUser">
      <h2 class="login_form__greeting">Bon retour, explorateur !</h2>
      <div class="login_form__group">
        <input class="login_form__input" type="email" v-model="email" placeholder="Adresse e-mail" required />
      </div>
      <div class="login_form__group login_form__group--password">
        <input class="login_form__input" :type="showPassword ? 'text' : 'password'" v-model="password"
          placeholder="Mot de passe" required />
        <button type="button" class="login_form__toggle_eye" @click.prevent="togglePassword"
          aria-label="Afficher ou masquer le mot de passe">
          <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
        </button>
      </div>
      <button type="submit" class="login_form__submit">Se connecter</button>
      <div class="login_form__forgot_pass">Mot de passe oublié ?</div>
      <a class="login_form__switch_page" @click.prevent="goToRegister">Vous n'avez pas de compte ?</a>
      <div class="social_login hidden">
        <div class="social_login__button">Google</div>
        <div class="social_login__button">Facebook</div>
        <div class="social_login__button">Twitter</div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss"></style>
