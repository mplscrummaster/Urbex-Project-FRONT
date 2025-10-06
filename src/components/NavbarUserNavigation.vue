<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
const route = useRoute()
const users = useUsersStore()
// Optionally hide on auth pages only (reactive)
const hidden = computed(() => ['login','register'].includes(route.name))
</script>

<template>
  <div class="navbar user-bar" v-show="users.tokenUser && !hidden">
  <RouterLink active-class="active" :to="{ name: 'scenarios-list' }" aria-label="Scénarios">
      <span class="material-symbols-outlined">format_list_bulleted</span>
    </RouterLink>
  <RouterLink active-class="active" :to="{ name: 'map-global' }" aria-label="Carte globale">
      <span class="material-symbols-outlined">map</span>
    </RouterLink>
  <RouterLink active-class="active" :to="{ name: 'map-current' }" aria-label="Carte actuelle / position">
      <span class="material-symbols-outlined">my_location</span>
    </RouterLink>
    <RouterLink active-class="active" to="/leaderboard" aria-label="Classement">
      <span class="material-symbols-outlined">emoji_events</span>
    </RouterLink>
    <RouterLink active-class="active" to="/user-profile" aria-label="Profil utilisateur">
      <span class="material-symbols-outlined">person</span>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.user-bar { width:100%; position:fixed; bottom:0; left:0; right:0; display:flex; justify-content:space-around; align-items:center; gap:.25rem; padding:.55rem clamp(0.4rem,2vw,1.2rem) calc(.55rem + env(safe-area-inset-bottom)); background:rgba(20,22,26,.85); backdrop-filter:blur(10px); border-top:1px solid rgba(255,255,255,.08); z-index:500; box-shadow:0 -4px 12px -3px rgba(0,0,0,.55); height: var(--user-bar-h); }
.user-bar a { flex:1; text-align:center; color:#c4ced8; padding:.4rem .4rem; border-radius:12px; position:relative; display:flex; justify-content:center; align-items:center; line-height:1; transition:background .25s,color .25s; }
 .user-bar a .material-symbols-outlined { font-size:26px; display:block; line-height:1; }
.user-bar a.active { background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; box-shadow:0 2px 6px -1px rgba(0,0,0,.6); }
.user-bar a.active .material-symbols-outlined { font-variation-settings: 'FILL' 1; }
.user-bar a:not(.active):hover { background:rgba(255,255,255,.07); color:#fff; }
.user-bar a:active { transform:translateY(1px); }
.user-bar a::after { content:""; position:absolute; bottom:4px; left:50%; width:0; height:2px; background:#60a5fa; border-radius:2px; transition:width .3s, left .3s; }
.user-bar a.active::after { width:38%; left:31%; }
.user-bar a:not(.active):hover::after { width:30%; left:35%; }
@media (min-width:680px){ .user-bar { padding:.6rem 1.8rem calc(.7rem + env(safe-area-inset-bottom)); } .user-bar a { font-size:.72rem; } }
@media (min-width:960px){ .user-bar { max-width:960px; margin:0 auto; left:0; right:0; } }

/* remove legacy debug active style */
</style>
