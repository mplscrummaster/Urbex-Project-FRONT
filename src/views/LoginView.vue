<script setup>
  import { useUsersStore } from '@/stores/users'
  import { ref } from 'vue'

  const storeUsers = useUsersStore()

  const email = ref('player05@example.com')
  const password = ref('password123')
  const showPassword = ref(false)

  const togglePassword = () => { showPassword.value = !showPassword.value }

  const loginUser = async () => {
    if (!email.value || !password.value) { alert('Veuillez remplir tous les champs !'); return }
    await storeUsers.loginUser(email.value, password.value)
  }
</script>

<template>
  <form class="login_form" id="loginForm" @submit.prevent="loginUser">
    <div class="login_form__group">
      <input class="login_form__input" type="email" v-model="email" placeholder="Adresse e-mail" required />
    </div>
    <div class="login_form__group login_form__group--password">
      <input class="login_form__input" :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Mot de passe" required />
      <button type="button" class="login_form__toggle_eye" @click.prevent="togglePassword"
        aria-label="Afficher ou masquer le mot de passe">
        <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
      </button>
    </div>
    <button type="submit" class="login_form__submit">Se connecter</button>
    <div class="login_form__forgot_pass">Mot de passe oublié ?</div>
    <div class="social_login">
      <button class="social_login__button">Google</button>
      <button class="social_login__button">Facebook</button>
      <button class="social_login__button">Twitter</button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  .login_form {
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
        .login_form__input {
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
      width: 100%;
      background-color: #f5f5f5;
      color: #333;
      transition:
        border 0.2s,
        background 0.2s;

      &:focus {
        outline: none;
        border-color: #888;
        background-color: #eaeaea;
      }
    }

    &__toggle_eye {
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
      margin: 0;

      &:hover svg {
        stroke: #6f0202;
      }
    }

    &__submit {
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

      &:hover {
        background-color: #555;
        transform: translateY(-2px);
      }
    }

    &__forgot_pass {
      margin-top: 12px;
      text-align: center;
      color: #666;
      cursor: pointer;
      font-size: 0.9rem;
      transition: color 0.2s;

      &:hover {
        color: #333;
      }
    }

    .social_login {
      bottom: 20px;
      width: 100%;
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 2rem;

      &__button {
        background-color: #e0e0e0;
        color: #333;
        border-radius: 50%;
        width: 100px;
        height: 100px;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        transition:
          background 0.3s,
          transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background-color: #ccc;
          transform: translateY(-2px);
        }
      }
    }
  }
</style>
