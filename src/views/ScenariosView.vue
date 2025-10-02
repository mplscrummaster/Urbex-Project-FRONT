<script setup>
import { onMounted } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'
import ScenarioCard from '@/components/ScenarioCard.vue'
const store = useScenariosStore()
onMounted(() => { store.refreshAll().catch(()=>{}) })
</script>
<template>
  <main class="scenarios-view">
    <h2 class="heading">Mes scénarios</h2>
    <div class="list" v-if="store.items.length">
      <ScenarioCard v-for="s in store.items" :key="s.id" :scenario="s" />
    </div>
    <div class="empty" v-else>Aucun scénario pour le moment.</div>
  </main>
</template>
<style scoped lang="scss">
.scenarios-view { padding:80px 20px 40px; max-width:640px; margin:0 auto; display:flex; flex-direction:column; gap:24px; }
.heading { margin:0; font-size:24px; font-weight:600; color:#f1f5f9; }
.list { display:flex; flex-direction:column; gap:14px; }
.empty { text-align:center; padding:60px 0; color:#64748b; }
</style>
