<script setup>
  import GlitchClock from '@/components/GlitchClock.vue';
  import { useUsersStore } from '@/stores/users'
  import { computed, onMounted, ref } from 'vue'
  const users = useUsersStore()
  const isAuthenticated = computed(() => !!users.tokenUser)

  let deferredPrompt = null
  const showInstall = ref(false)

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('User choice:', outcome)

    deferredPrompt = null
    showInstall.value = false
  }

  onMounted(() => {
    // Detect PWA install availability
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      showInstall.value = true
    })

    // Hide button after successful installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ App installed!')
      showInstall.value = false
    })
  })
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
      <div class="spacer" />
      <button v-if="showInstall" class="btn install" @click.prevent="installApp">Install me</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .backgroundHome {
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

  .btn.install {
    position: relative;
    background: linear-gradient(135deg, #2d3b30, #191f1b, #444e47);
    color: #f5f5f5;
    border: 2px solid #586d5a;
    border-radius: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    padding: 0.7rem 1.4rem;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.35s ease;
    backdrop-filter: blur(6px);
    z-index: 2;
    width: 80%;
    height: 200px;
    min-width: fit-content;
    min-height: fit-content;
    font-size: 2rem;
    margin-block-start: 100px;
    background-size: 1000% 1000%;
    animation: gradient-move 6s ease-in-out infinite;
    will-change: background-position;

    // Subtle cracked texture overlay
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('/img/crack-texture.png');
      background-size: cover;
      opacity: 0.25;
      mix-blend-mode: overlay;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    // Glowing effect for attention
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 180%;
      height: 300%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
      transform: translate(-50%, -50%) rotate(25deg);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.5s ease;
    }
  }

  @keyframes gradient-move {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }
</style>
