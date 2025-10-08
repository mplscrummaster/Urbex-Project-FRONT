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
</script>

<template>
  <div class="background"></div>
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
      <input class="register_form__input" :type="showPassword ? 'text' : 'password'" v-model="password"
        placeholder="Mot de passe" required />
      <button type="button" class="register_form__toggle_eye" @click.prevent="togglePassword"
        aria-label="Afficher ou masquer le mot de passe">
        <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
      </button>
    </div>
    <button type="submit" class="register_form__submit">S'inscrire</button>
  </form>
</template>

<style lang="scss" scoped>
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/img/homepage.png'); // your base image
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    filter: brightness(0.65) contrast(1) saturate(0.7);
    z-index: -2;
  }

  .register_form {
    background-color: #3a362f47;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 50px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'Courier New', monospace;
    color: #ddd;
    box-shadow: 0 12px 50px rgba(0, 0, 0, 0.85);
    position: relative;
    max-width: 500px;
    width: 100%;
  }

  /* Input groups */
  .register_form__group {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    &--password {
      .register_form__input {
        flex: 1;
        padding-right: 3rem;
      }
    }
  }

  /* Inputs */
  .register_form__input {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #555;
    font-size: 1rem;
    background-color: rgba(43, 43, 43, 0.8);
    color: #ddd;
    width: 100%;
    transition: border 0.3s, background 0.3s;

    &:focus {
      outline: none;
      border-color: #999;
      background-color: rgba(51, 51, 51, 0.9);
    }

    &::placeholder {
      color: #aaa;
    }
  }

  /* Password toggle button */
  .register_form__toggle_eye {
    position: absolute;
    right: 12px;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;

    &:hover {
      color: #fff;
    }
  }

  /* Submit button with cracked/glass style */
  .register_form__submit {
    position: relative;
    background: linear-gradient(135deg, #4b4237, #2c2a26);
    color: #f5f5f5;
    border: 1px solid #6b6558;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    padding: 14px;
    overflow: hidden;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5), 0 2px 5px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
  }

  .register_form__submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/img/crack-texture.png');
    background-size: cover;
    opacity: 0.2;
    pointer-events: none;
  }

  .register_form__submit:hover {
    background: linear-gradient(135deg, #5c5546, #3a362f);
    transform: translateY(-2px);
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6), 0 3px 7px rgba(0, 0, 0, 0.5);
  }

  /* Optional: social login buttons */
  .social-login {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
  }

  .social-login button {
    position: relative;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4b4237, #2c2a26);
    color: #f5f5f5;
    border: 1px solid #6b6558;
    font-size: 1rem;
    cursor: pointer;
    overflow: hidden;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5), 0 2px 5px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
  }

  .social-login button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/img/crack-texture.png');
    background-size: cover;
    opacity: 0.2;
    pointer-events: none;
  }

  .social-login button:hover {
    background: linear-gradient(135deg, #5c5546, #3a362f);
    transform: translateY(-2px);
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6), 0 3px 7px rgba(0, 0, 0, 0.5);
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .register_form {
      padding: 40px 25px;
    }

    .social-login button {
      width: 60px;
      height: 60px;
      font-size: 0.9rem;
    }
  }
</style>
