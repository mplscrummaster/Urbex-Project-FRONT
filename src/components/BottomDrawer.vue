<template>
  <div v-if="open" class="c-bottom-drawer" role="dialog" aria-modal="true" aria-label="Tiroir d'informations"
    @keydown.esc="closeDrawer" tabindex="-1" ref="root" :style="{ transform: `translateY(${translateY}px)` }">
    <div class="c-bottom-drawer__handle-area" @mousedown.prevent="startDrag" @touchstart.prevent="startDrag"
      @click="cycleSize">
      <div class="c-bottom-drawer__handle" />
      <button class="c-bottom-drawer__close" @click.stop="closeDrawer" @touchstart.stop.prevent="closeDrawer"
        aria-label="Fermer">
        ×
      </button>
    </div>
    <div class="c-bottom-drawer__content" ref="contentEl">
      <slot />
    </div>
  </div>
</template>
<script setup>
// ...existing code...
// Focus automatique sur le tiroir à l'ouverture pour navigation clavier
// (doit être placé après la déclaration de 'open')
/*
  Tiroir coulissant en bas de l'écran (BottomDrawer)
  --------------------------------------------------
  Objectifs
  - Afficher un panneau coulissant pour contenu contextuel (cartes, infos, actions)
  - Permettre le redimensionnement (peek, mid, full) par drag ou clic
  - Gérer l'ouverture/fermeture, focus, accessibilité
  - Empêcher le scroll du fond quand le tiroir est ouvert
  - Harmonisation structure, commentaires et accessibilité avec les autres vues

  Principes
  - Props : modelValue (ouvert/fermé), initialSize (taille par défaut)
  - Événements : update:modelValue, close, size
  - Drag & cycle pour changer la taille
  - Focus et navigation clavier (esc pour fermer)
  - BEM pour la structure CSS
*/
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
// Import des hooks Vue
const props = defineProps({
  // Props : état d'ouverture et taille initiale
  modelValue: { type: Boolean, default: false },
  initialSize: { type: String, default: 'peek' },
})
const open = ref(props.modelValue) // Déclaré avant tout usage
const emit = defineEmits(['update:modelValue', 'close', 'size'])
// Événements émis : fermeture, changement de taille, update du modèle
const sizes = ['peek', 'mid', 'full']
// Tailles disponibles du tiroir
const sizeIndex = ref(
  // Index de la taille courante
  sizes.indexOf(props.initialSize) !== -1 ? sizes.indexOf(props.initialSize) : 0,
)
const root = ref(null)
// Référence à la racine du tiroir
const contentEl = ref(null)
// Référence au contenu scrollable

// --- Added for smooth drag animation ---
const translateY = ref(0) // décalage vertical courant
let startY = 0
let currentTranslate = 0

watch(
  // Synchronisation ouverture/fermeture avec la prop modelValue
  () => props.modelValue,
  (v) => {
    open.value = v
    if (v) openDrawerAnimation()
  },
)
watch(open, (v) => emit('update:modelValue', v))
// Mise à jour du modèle quand l'état local change
const cycleSize = () => {
  // Change la taille du tiroir par clic sur la poignée
  sizeIndex.value = (sizeIndex.value + 1) % sizes.length
  emit('size', sizes[sizeIndex.value])
  snapToSize([sizeIndex.value])
}
const startDrag = (ev) => {
  // Drag pour redimensionner le tiroir (haut/bas)
  startY = ev.touches ? ev.touches[0].clientY : ev.clientY
  currentTranslate = translateY.value
  const move = (e2) => {
    const y = e2.touches ? e2.touches[0].clientY : e2.clientY
    const delta = y - startY
    const maxY = window.innerHeight * 0.84
    translateY.value = Math.max(0, Math.min(maxY, currentTranslate + delta))
  }
  const up = () => {
    if (root.value) root.value.style.transition = 'transform 0.3s ease-out'
    snapToClosestHeight()
    window.removeEventListener('mousemove', move)
    window.removeEventListener('touchmove', move)
    window.removeEventListener('mouseup', up)
    window.removeEventListener('touchend', up)
  }
  window.addEventListener('mousemove', move)
  // Ajout des listeners pour le drag
  window.addEventListener('touchmove', move)
  window.addEventListener('mouseup', up)
  window.addEventListener('touchend', up)
  // Nettoyage des listeners à la fin du drag
}
// Prevent background (map) scroll when drawer is open, but allow scroll inside the drawer itself
// Empêche le scroll du fond quand le tiroir est ouvert, sauf à l'intérieur du tiroir
// const onBackgroundScroll = (e) => {
//   Gestion du scroll : si le tiroir est ouvert, empêche le scroll du fond
//   if (!open.value) return
//   if (root.value && root.value.contains(e.target)) return // allow scrolling inside drawer
//   e.preventDefault()
// }
function snapToClosestHeight() {
  // Trouve la taille la plus proche selon la position actuelle
  const heights = {
    peek: window.innerHeight * 0.6,
    mid: window.innerHeight * 0.3,
    full: 0,
  }

  const distances = Object.entries(heights).map(([key, val]) => ({
    key,
    dist: Math.abs(translateY.value - val),
  }))

  const closest = distances.reduce((a, b) => (a.dist < b.dist ? a : b)).key
  sizeIndex.value = sizes.indexOf(closest)
  emit('size', closest)
  snapToSize(closest)
}

function snapToSize(size) {
  // Anime vers la taille choisie
  const heights = {
    peek: window.innerHeight * 0.6,
    mid: window.innerHeight * 0.3,
    full: 0,
  }
  translateY.value = heights[size]
}

function openDrawerAnimation() {
  // Animation fluide à l'ouverture
  if (!root.value) return
  root.value.style.transition = 'transform 0.3s ease-out'
  translateY.value = window.innerHeight * 0.6
  requestAnimationFrame(() => {
    translateY.value = window.innerHeight * 0.3
  })
}

// Prevent background (map) scroll when drawer is open, but allow scroll inside the drawer itself
// Empêche le scroll du fond quand le tiroir est ouvert, sauf à l'intérieur du tiroir
const onBackgroundScroll = (e) => {
  // Gestion du scroll : si le tiroir est ouvert, empêche le scroll du fond
  if (!open.value) return
  if (root.value && root.value.contains(e.target)) return // allow scrolling inside drawer
  e.preventDefault()
}
onMounted(() => {
  // Ajout du listener wheel au montage
  document.addEventListener('wheel', onBackgroundScroll, { passive: false })
})
onUnmounted(() => {
  // Suppression du listener wheel au démontage
  document.removeEventListener('wheel', onBackgroundScroll)
})

const closeDrawer = () => {
  // Ferme le tiroir, met à jour le modèle et émet l'événement close
  open.value = false
  emit('update:modelValue', false)
  emit('close')
}
</script>
<style scoped></style>
