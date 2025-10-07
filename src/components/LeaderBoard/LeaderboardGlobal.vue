<script setup>
// Placeholder leaderboard view – replace with real data later
const items = Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, name: `Joueur ${i + 1}`, xp: 1000 - i * 37 }))
</script>

<template>
  <div class="leaderboard-list">
    <div v-for="u in items" :key="u.rank" class="row" :class="{
      first: u.rank === 1,
      second: u.rank === 2,
      third: u.rank === 3,
    }">
      <div class="rank">#{{ u.rank }}</div>
      <div class="avatar" aria-hidden="true" />
      <div class="name">{{ u.name }}</div>
      <div class="xp">{{ u.xp }} xp</div>
    </div>
  </div>
  
</template>

<style scoped lang="scss">
@use '@/styles/abstracts' as *;
.leaderboard-list { display:flex; flex-direction:column; gap:10px; padding:8px 0 80px; }
.row { display:flex; align-items:center; gap:12px; background:$color-surface; border:1px solid $color-border; border-radius:14px; padding:10px 12px; box-shadow:0 3px 10px -4px rgba(0,0,0,.55); }
.row.first { border-color:#f59e0b; }
.row.second { border-color:#94a3b8; }
.row.third { border-color:#a16207; }
.rank { width:34px; text-align:center; font-weight:700; color:$color-text; }
.avatar { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#0ea5e9,#38bdf8); opacity:.75; box-shadow:inset 0 0 0 2px rgba(255,255,255,.18); }
.name { flex:1; color:$color-text; font-weight:600; }
.xp { color:$color-text-dim; font-size:.9rem; font-weight:600; }
</style>
