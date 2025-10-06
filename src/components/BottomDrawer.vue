<template>
  <transition name="drawer-fade">
    <div v-if="open" class="drawer" :class="sizeClass" @keydown.esc="emit('close')" tabindex="-1" ref="root">
  <div class="handle-area" @mousedown.prevent="startDrag" @touchstart.prevent="startDrag" @click="cycleSize">
        <div class="handle" />
  <button class="close" @click.stop="closeDrawer" @touchstart.stop.prevent="closeDrawer" aria-label="Fermer">×</button>
      </div>
      <div class="drawer-content" ref="contentEl">
        <slot />
      </div>
    </div>
  </transition>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
const props = defineProps({ modelValue: { type: Boolean, default: false }, initialSize: { type: String, default: 'peek' } })
const emit = defineEmits(['update:modelValue','close','size'])
const sizes = ['peek','mid','full']
const sizeIndex = ref(sizes.indexOf(props.initialSize) !== -1 ? sizes.indexOf(props.initialSize) : 0)
const root = ref(null)
const contentEl = ref(null)
const open = ref(props.modelValue)
watch(() => props.modelValue, v => { open.value = v })
watch(open, v => emit('update:modelValue', v))
const cycleSize = () => {
  sizeIndex.value = (sizeIndex.value + 1) % sizes.length
  emit('size', sizes[sizeIndex.value])
}
const startDrag = (ev) => {
  const startY = (ev.touches ? ev.touches[0].clientY : ev.clientY)
  const startIdx = sizeIndex.value
  const move = (e2) => {
    const y = (e2.touches ? e2.touches[0].clientY : e2.clientY)
    const delta = y - startY
    if (Math.abs(delta) < 30) return
    if (delta < 0 && sizeIndex.value < sizes.length - 1) sizeIndex.value = startIdx + 1
    else if (delta > 0 && sizeIndex.value > 0) sizeIndex.value = startIdx - 1
  }
  const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); }
  window.addEventListener('mousemove', move)
  window.addEventListener('touchmove', move)
  window.addEventListener('mouseup', up)
  window.addEventListener('touchend', up)
}
// Prevent background (map) scroll when drawer is open, but allow scroll inside the drawer itself
const onBackgroundScroll = (e) => {
  if (!open.value) return
  if (root.value && root.value.contains(e.target)) return // allow scrolling inside drawer
  e.preventDefault()
}
onMounted(() => { document.addEventListener('wheel', onBackgroundScroll, { passive:false }) })
onUnmounted(() => { document.removeEventListener('wheel', onBackgroundScroll) })
const sizeClass = computed(() => `is-${sizes[sizeIndex.value]}`)

const closeDrawer = () => {
  open.value = false
  emit('update:modelValue', false)
  emit('close')
}
</script>
<style scoped lang="scss">
.drawer { position:fixed; left:0; right:0; bottom:var(--drawer-bottom-offset, 0px); background:#0f1a22f2; backdrop-filter:blur(10px); border-top-left-radius:22px; border-top-right-radius:22px; box-shadow:0 -4px 18px -4px rgba(0,0,0,0.55); display:flex; flex-direction:column; max-height:92dvh; z-index:4000; animation:popIn .35s cubic-bezier(.22,.99,.34,1.01); }
.handle-area { position:relative; padding:6px 20px 4px; display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
.handle { width:52px; height:5px; border-radius:3px; background:#334250; opacity:.9; }
.close { position:absolute; top:4px; right:6px; background:none; border:none; font-size:26px; color:#94a3b8; cursor:pointer; line-height:1; padding:8px 12px; border-radius:12px; touch-action:manipulation; }
.close:hover { background:#1e293b; color:#e2e8f0; }
.drawer-content { flex:1 1 auto; min-height:0; overflow-y:auto; margin: 2rem 12px 10px; display:flex; flex-direction:column; gap:8px; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; border-radius: 14px;}
.drawer-content > * { margin: 0; }
.is-peek { height:26dvh; }
.is-mid { height:56dvh; }
.is-full { height:90dvh; }
.drawer-fade-enter-active,.drawer-fade-leave-active { transition:opacity .25s ease; }
.drawer-fade-enter-from,.drawer-fade-leave-to { opacity:0; }
@keyframes popIn { from { transform:translateY(40px); opacity:0; } to { transform:translateY(0); opacity:1; } }
</style>
