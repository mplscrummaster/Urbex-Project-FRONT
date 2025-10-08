<script setup>
import TabBar from './components/TabBar.vue'

// store usage moved into TabBar
</script>

<template>
  <main>
    <div class="content">
      <RouterView v-slot="{ Component, route }">
        <template v-if="route.meta && route.meta.keepAlive">
          <KeepAlive>
            <component :is="Component" :key="route.name" />
          </KeepAlive>
        </template>
        <template v-else>
          <component :is="Component" :key="route.fullPath" />
        </template>
      </RouterView>
    </div>
    <div class="bottom">
      <TabBar />
      <!-- Fixed bottom user bar for logged-in users -->
    </div>
  </main>
</template>
