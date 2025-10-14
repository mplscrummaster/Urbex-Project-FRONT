<script setup>
import GlitchClock from '@/components/GlitchClock.vue';
import { useUsersStore } from '@/stores/users'
import { computed, onMounted } from 'vue'
const users = useUsersStore()
const isAuthenticated = computed(() => !!users.tokenUser)

let deferredPrompt = null;

onMounted(() => {
  const installBtn = document.querySelector('.install');
  installBtn.classList.add('hidden');

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
  });

  // When the button is clicked, show the install prompt
  installBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    installBtn.classList.add('hidden');

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log('User choice:', choiceResult);
    deferredPrompt = null;
  });

  // When app is installed
  window.addEventListener('appinstalled', () => {
    installBtn.classList.add('hidden');
  });
});
</script>

<template>
  <div class="home-view with-tabbar-padding">
    <div class="backgroundHome"></div>
    <div class="home-container">
      <GlitchClock />
      <h1 class="slogan">Rejoignez l’aventure</h1>
      <div class="ctas" v-if="!isAuthenticated">
        <RouterLink class="btn primary" to="/login">Se connecter</RouterLink>
        <RouterLink class="btn outline" to="/register">S'inscrire</RouterLink>
      </div>
      <button class="btn install" @click="installApp">Install me</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/img/homepage.png'); // у Vue public -> /img/
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  z-index: -1;
}

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  text-align: center;
  gap: 16px;
  position: relative;
}

.slogan {
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 0 0 10px rgba(255, 255, 255, .6);
  margin: 8px 0 0;
}

.ctas {
  display: flex;
  gap: 14px;
  margin-top: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .6rem 1rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: .5px;
  transition: all .25s ease;
}

.btn.primary {
  position: relative;
  background: linear-gradient(135deg, #4b4237, #2c2a26);
  color: #f5f5f5;
  border: 1px solid #6b6558;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5), 0 2px 5px rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 700;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn.primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/img/crack-texture.png'); // create or find a subtle cracked texture
  background-size: cover;
  opacity: 0.2; // subtle cracks
  pointer-events: none;
}

.btn.primary:hover {
  background: linear-gradient(135deg, #5c5546, #3a362f);
  transform: translateY(-2px);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6), 0 3px 7px rgba(0, 0, 0, 0.5);
}

.btn.outline {
  position: relative;
  border: 2px solid #7d7466;
  color: #f5f5f5;
  background: rgba(50, 45, 40, 0.3); // semi-dark background for contrast
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 2;
  backdrop-filter: blur(8px);
}

.btn.outline::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/img/crack-texture.png'); // your crack texture
  background-size: cover;
  opacity: 0.2; // make it more visible
  mix-blend-mode: multiply; // blend with background
  pointer-events: none;
  z-index: 1; // behind the text automatically
}

.btn.outline:hover {
  background: rgba(125, 116, 102, 0.2);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}
</style>
