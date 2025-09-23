<script setup>
 import { useUsersStore } from '@/stores/users';
 const storeUsers = useUsersStore();

  const togglePassword= () => {
     const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
    } else {
      passwordInput.type = 'password';
      eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <line x1="12" y1="12" x2="12" y2="12"></line>
    `;
    }
  }

  // Écoute de la soumission du formulaire
  const registrUser = async () => {
    
    const username = document.querySelector('#username').value;
    const firstname = document.querySelector('#firstname').value;
    const lastname = document.querySelector('#lastname').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    // Vérification simple
    if (!email || !password || !username || !firstname || !lastname) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    // Préparation des données à envoyer
    storeUsers.loginUser(username, firstname, lastname, email, password);
  };
</script>

<template>
  <form class="userForm" id="userForm" @submit.prevent=registrUser>
    <input type="text" id="username" placeholder="Ecrire votre nickname" name="username" value="" required>
    <input type="text" id="firstname" placeholder="Ecrire votre prenom" name="firstname" value="" required>
    <input type="text" id="lastname" placeholder="Ecrire votre nom" name="lastname" value="" required>
    <input type="email" id="email" placeholder="Adresse e-mail" name="email" value="Max@gmail.com" required>

    <div class="password-container">
      <input type="password" name="password" id="password" placeholder="Mot de passe" value="Max" required>
      <button type="button" class="toggle-eye" @click.prevent=togglePassword
        aria-label="Afficher ou masquer le mot de passe">
        <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <line x1="12" y1="12" x2="12" y2="12"></line>
        </svg>
      </button>
    </div>

    <button type="submit" class="submit-btn">S'inscrire</button>

  </form>
</template>

<style scoped>
  body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    background-color: #f0f0f0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  form {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    width: 320px;
    gap: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  form:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  input {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #ccc;
    font-size: 1rem;
    width: 100%;
    background-color: #f5f5f5;
    color: #333;
    transition: border 0.2s, background 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #888;
    background-color: #eaeaea;
  }

  .password-container {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
  }

  .password-container input {
    flex: 1;
    padding: 14px;
    /* місце для кнопки */
    border-radius: 12px;
    border: 1px solid #ccc;
    font-size: 1rem;
    background-color: #f5f5f5;
    color: #333;
  }

  .toggle-eye {
    position: absolute;
    right: 10px;
    /* відступ від правого краю input */
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .toggle-eye:hover svg {
    transform: scale(1.1);
    stroke: #333;
  }

  button.submit-btn {
    padding: 14px;
    background-color: #666;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
  }

  button.submit-btn:hover {
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
    transition: background 0.3s, transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .social-login button:hover {
    background-color: #ccc;
    transform: translateY(-2px);
  }
</style>