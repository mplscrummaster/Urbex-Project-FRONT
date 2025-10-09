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

<style lang="scss">
  @use '@/styles/abstracts' as *;

  body {
    margin: 0;
  }

  main {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  /* per-view spacing: handled inside each view to avoid global margins */

  .navbar {
    background: $color-surface;
    color: $color-text;
    padding-block: 12px;
    font-size: 18px;
    display: flex;
    gap: 1rem;
    justify-content: space-around;
  }

  .navbar a {
    all: unset;
    color: inherit;
    cursor: pointer;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: $radius-md;
    background-color: $color-surface-alt;

    &:hover {
      transition: $transition;
      color: $color-accent;
      box-shadow: 0 0 0 1px $color-accent;
    }
  }

  .hidden {
    display: none;
  }
</style>
