<script setup>
import NavbarLeaderBoard from '@/components/NavbarLeaderBoard.vue'

</script>

<template>

  <NavbarLeaderBoard />
  <div class="listUsers">
    <RouterView />
  </div>
</template>
<style lang="scss" scoped>
.listUsers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  align-items: center;
}
</style>