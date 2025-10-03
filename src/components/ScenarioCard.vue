<template>
  <div
    class="scenario-card"
    :class="[statusClass, { compact, clickable }]"
    @click="handleSelect"
  >
    <div class="left" v-if="!compact">
      <div class="thumb"><div class="thumb-icon" /></div>
    </div>
    <div class="body">
      <div class="top-row">
        <h4 class="title" :title="scenario.title">{{ scenario.title }}</h4>
        <button
          class="bookmark-btn"
          :class="{ active: scenario.bookmarked }"
          @click.stop="toggleBookmark"
          :title="scenario.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          aria-label="Bookmark"
        >
          <span class="material-symbols-outlined" :class="{ fill: scenario.bookmarked }">{{ scenario.bookmarked ? 'bookmark' : 'bookmark_add' }}</span>
        </button>
      </div>
      <p class="author" v-if="showAuthor">Scénario par {{ scenario.author || '—' }}</p>
      <div v-if="hasProgress" class="progress-wrapper">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
        <div class="progress-meta" v-if="scenario.hasPreciseProgress">
          {{ scenario.completedMissions }}/{{ scenario.totalMissions }} ({{ progressPercent }}%)
        </div>
        <div class="progress-meta" v-else>
          {{ progressPercent }}%
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useScenariosStore } from '@/stores/scenarios'
const props = defineProps({
  scenario: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  showAuthor: { type: Boolean, default: true },
  clickable: { type: Boolean, default: true },
})
const emit = defineEmits(['select'])
const store = useScenariosStore()

const progressPercent = computed(() => {
  const r = props.scenario.progressRatio
  if (r == null) return 0
  return Math.round(r * 100)
})
const hasProgress = computed(() => props.scenario.progressRatio != null)
const statusClass = computed(() => {
  const s = props.scenario.status
  if (s === 'completed') return 'is-completed'
  if (s === 'started') return 'is-started'
  return 'is-not-started'
})

async function toggleBookmark() {
  try {
    await store.toggleBookmark(props.scenario.id, {
      confirmCallback: async () => window.confirm('Confirmer la suppression du favori et de la progression ?'),
    })
  } catch {
    // silent
  }
}

function handleSelect() {
  if (!props.clickable) return
  emit('select', props.scenario)
}
</script>
<style scoped lang="scss">
@use '@/styles/theme.scss' as *;
.scenario-card {
  position:relative; display:flex; gap:14px; background:$color-surface; border:1px solid $color-border; border-radius:14px; padding:14px 16px 12px; cursor:pointer; transition:background .25s, border-color .25s, transform .25s; box-shadow:0 3px 8px -3px rgba(0,0,0,.55);
  &:hover { background:$color-surface-alt; border-color:$color-accent; transform:translateY(-2px); }
  &.compact { padding:10px 12px; gap:10px; }
  &.is-completed { box-shadow:0 0 0 1px rgba($color-success,.45), 0 3px 8px -3px rgba(0,0,0,.5); }
  &.is-started:not(.is-completed) { box-shadow:0 0 0 1px rgba(255,200,60,.45); }
  &.is-not-started { box-shadow:0 0 0 1px rgba(148,163,184,0.12); }
}
.left { flex-shrink:0; }
.thumb { width:60px; height:60px; border-radius:10px; background:#273340; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.thumb-icon { width:34px; height:34px; background:radial-gradient(circle at 35% 35%,#38bdf8,#0ea5e9); opacity:.55; border-radius:50%; }
.scenario-card.compact .thumb { width:46px; height:46px; }

.body { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
.top-row { display:flex; align-items:flex-start; gap:10px; }
.title { flex:1; margin:0; font-size:15px; font-weight:600; color:$color-text; letter-spacing:.3px; line-height:1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.scenario-card.compact .title { font-size:14px; }
.author { margin:0; font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:500; color:$color-text-dim; }

.bookmark-btn { background:rgba(0,0,0,.25); border:1px solid $color-border; border-radius:8px; padding:.3rem .5rem .25rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .25s, border-color .25s; }
.bookmark-btn:hover { background:$color-surface-alt; border-color:$color-accent; }
.bookmark-btn .material-symbols-outlined { font-size:20px; line-height:1; color:$color-text-dim; transition:color .25s; }
.bookmark-btn.active .material-symbols-outlined { color:$color-accent; }
.bookmark-btn .material-symbols-outlined.fill { font-variation-settings:'FILL' 1; }

.progress-wrapper { display:flex; align-items:center; gap:10px; margin-top:2px; }
.progress-bar { position:relative; flex:1; height:8px; background:#273340; border-radius:4px; overflow:hidden; }
.progress-fill { position:absolute; inset:0; background:linear-gradient(90deg,#0ea5e9,#38bdf8); width:0; transition:width .35s ease; }
.progress-meta { font-size:11px; font-weight:600; color:$color-text-dim; letter-spacing:.5px; }
.scenario-card.is-not-started .progress-fill { background:#475569; }

/* Compact variant adjustments */
.scenario-card.compact .progress-wrapper { gap:6px; }
.scenario-card.compact .progress-bar { height:6px; }
.scenario-card.compact .progress-meta { font-size:10px; }
</style>
