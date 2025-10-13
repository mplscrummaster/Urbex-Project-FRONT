<script setup>
import NavbarLeaderBoard from '@/components/NavbarLeaderBoard.vue'
import { onMounted, nextTick } from 'vue'
import { useTutorial } from '@/composables/useTutorial.js'

const { autoTutorial } = useTutorial()

onMounted(async () => {
  await nextTick()
  setTimeout(() => autoTutorial('leaderboard'), 300)
})
</script>

<template>
  <div class="leaderboard">
    <NavbarLeaderBoard class="leaderboard-bar" />
    <div class="leaderboard-list">
      <RouterView class="leaderboard-routerview" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use '@/styles/abstracts' as *;

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 2rem;
  width: 100%;
  height: 100dvh;
  position: relative;
  overflow-y: auto; // active le scroll vertical
  overflow-x: hidden;
  padding-bottom: var(--tabbar-height, 150px);
}
</style>