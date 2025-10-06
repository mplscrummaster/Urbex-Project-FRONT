<script setup>
import GlitchClock from '@/components/GlitchClock.vue';
import { useUsersStore } from '@/stores/users'
import { computed } from 'vue'
const users = useUsersStore()
const isAuthenticated = computed(() => !!users.tokenUser)
</script>

<template>
  <div class="home-view with-tabbar-padding">
    <div class="background"></div>
    <div class="home-container">
      <GlitchClock />
      <h1 class="slogan">Join us today</h1>
      <div class="ctas" v-if="!isAuthenticated">
        <RouterLink class="btn primary" to="/login">Se connecter</RouterLink>
        <RouterLink class="btn outline" to="/register">S'inscrire</RouterLink>
      </div>
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

.home-container { display:flex; flex-direction:column; align-items:center; justify-content:center; height:80dvh; text-align:center; gap:16px; position:relative; }

.slogan { font-size: 42px; font-weight: 700; color:#fff; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 10px rgba(255,255,255,.6); margin: 8px 0 0; }

.ctas { display:flex; gap:14px; margin-top: 16px; flex-wrap: wrap; justify-content: center; }
.btn { display:inline-flex; align-items:center; justify-content:center; padding:.6rem 1rem; border-radius:12px; text-decoration:none; font-weight:700; letter-spacing:.5px; transition: all .25s ease; }
.btn.primary { background: linear-gradient(90deg,#2563eb,#1d4ed8); color:#fff; }
.btn.primary:hover { filter: brightness(1.1); }
.btn.outline { border:1px solid rgba(255,255,255,.35); color:#fff; }
.btn.outline:hover { border-color:#fff; }
</style>
