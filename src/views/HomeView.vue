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

