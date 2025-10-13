<script setup>
/*
  Barre de navigation principale (TabBar)
  --------------------------------------------------
  Objectifs
  - Afficher les onglets de navigation principaux de l'application
  - Masquer la barre sur les pages d'authentification
  - Permettre le recentrage des cartes via les onglets
  - Accessibilité : aria-label, icônes
 
  Principes
  - Utilisation de RouterLink pour la navigation
  - Gestion de l'état utilisateur (affichage si connecté)
  - Gestion des événements de recentrage
*/
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'

const route = useRoute()
const router = useRouter()
const users = useUsersStore()

// Masquer la barre sur les pages login/register
const hidden = computed(() => ['login', 'register'].includes(route.name))

// Recentrer la carte de jeu si déjà sur la page
const onClickMapCurrent = (e) => {
  if (route.name === 'game-map') {
    e.preventDefault()
    router.push({ name: 'game-map', query: { recenter: Date.now() } }).catch(() => { })
  }
}

// Recentrer la carte globale si déjà sur la page
const onClickMapGlobal = (e) => {
  if (route.name === 'explore-map') {
    e.preventDefault()
    router.push({ name: 'explore-map', query: { recenter: Date.now() } }).catch(() => { })
  }
}
</script>

<template>
  <div class="c-tab-bar" v-show="users.tokenUser && !hidden">
    <!--Scénarios-->
    <RouterLink active-class="is-active" class="c-tab-bar__link scenarios" :to="{ name: 'scenarios-list' }"
      aria-label="Scénarios">
      <span class="material-symbols-outlined">format_list_bulleted</span>
    </RouterLink>
    <!--explore-map-->
    <RouterLink active-class="is-active" class="c-tab-bar__link  global-map" :to="{ name: 'explore-map' }"
      aria-label="Carte globale" @click="onClickMapGlobal">
      <span class="material-symbols-outlined">map</span>
    </RouterLink>
    <!--game-map-->
    <RouterLink active-class="is-active" class="c-tab-bar__link game-map" :to="{ name: 'game-map' }"
      aria-label="Carte actuelle / position" @click="onClickMapCurrent">
      <span class="material-symbols-outlined">my_location</span>
    </RouterLink>
    <!--leaderboard-->
    <RouterLink active-class="is-active" class="c-tab-bar__link leaderboard" to="/leaderboard" aria-label="Classement">
      <span class="material-symbols-outlined">emoji_events</span>
    </RouterLink>
    <!--user-profile-->
    <RouterLink active-class="is-active" class="c-tab-bar__link user-profile" to="/user-profile"
      aria-label="Profil utilisateur">
      <span class="material-symbols-outlined">person</span>
    </RouterLink>
  </div>
</template>

<style scoped></style>
