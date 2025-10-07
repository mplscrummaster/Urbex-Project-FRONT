<script setup>
/*
  Carte repliable (CollapsibleCard)
  --------------------------------------------------
  Objectifs
  - Afficher un bloc d'informations repliable avec titre et contenu
  - Permettre l'ouverture/fermeture via bouton
  - Gérer les états : ouvert, verrouillé, complété, variante
  - Accessibilité : aria-label, bouton toggle

  Principes
  - Props : titre, état ouvert, verrouillé, complété, variante
  - Événement : toggle (demande d'ouverture/fermeture)
*/
// Définition des props du composant
defineProps({
  title: { type: String, required: true }, // Titre du bloc
  open: { type: Boolean, default: false }, // État ouvert/fermé
  disabled: { type: Boolean, default: false }, // Désactive le toggle
  variant: { type: String, default: '' }, // Variante visuelle
  completed: { type: Boolean, default: false }, // Bloc complété
  locked: { type: Boolean, default: false }, // Bloc verrouillé
})
// Événement émis lors du toggle
const emit = defineEmits(['toggle'])
</script>

<template>
  <div
    class="c-collapsible-card"
    :class="{
      [`c-collapsible-card--${variant}`]: !!variant,
      'c-collapsible-card--completed': completed,
      'c-collapsible-card--locked': locked,
    }"
  >
    <slot name="indicator" />
    <div class="c-collapsible-card__header">
      <h2 class="c-collapsible-card__title">{{ title }}</h2>
      <button
        type="button"
        class="c-collapsible-card__toggle material-symbols-outlined"
        :class="{
          'c-collapsible-card__toggle--rotated': open,
          'c-collapsible-card__toggle--disabled': disabled,
        }"
        @click="emit('toggle')"
        aria-label="Basculer"
      >
        expand_more
      </button>
    </div>
    <div class="c-collapsible-card__body" v-show="open">
      <slot />
    </div>
  </div>
</template>
