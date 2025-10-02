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

<style lang="scss" scoped>
  .register_form {
    background-color: #ffffff;
    padding: 40px;
    margin-block-start: 5rem;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &__group {
      margin-bottom: 0;
      display: flex;
      align-items: center;
      width: 100%;

      &--password {
        .register_form__input {
          flex: 1;
          padding-right: 2.5rem;
        }
      }
    }

    &__input {
      padding: 14px;
      border-radius: 12px;
      border: 1px solid #ccc;
      font-size: 1rem;
      background-color: #f5f5f5;
      color: #333;
      width: 100%;
      transition:
        border 0.2s,
        background 0.2s;

      &:focus {
        outline: none;
        border-color: #888;
        background-color: #eaeaea;
      }
    }

    &__toggle-eye {
      position: absolute;
      right: 50px;
      width: 24px;
      height: 24px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;

      &:hover svg {
        stroke: #333;
      }
    }
  }

  .register_form__submit {
    padding: 14px;
    background-color: #666;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    transition:
      background 0.3s,
      transform 0.2s;
  }

  .register_form__submit:hover {
    background-color: #555;
    transform: translateY(-2px);
  }

  .forgot-pass {
    margin-top: 12px;
    text-align: center;
    color: #666;
    cursor: pointer;
    font-size: 0.9rem;
    transition: color 0.2s;
  }

  .forgot-pass:hover {
    color: #333;
  }

  .social-login {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .social-login button {
    background-color: #e0e0e0;
    color: #333;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    transition:
      background 0.3s,
      transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .social-login button:hover {
    background-color: #ccc;
    transform: translateY(-2px);
  }
</style>
