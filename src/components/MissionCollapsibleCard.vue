<script setup>
/*
  Carte mission repliable (MissionCollapsibleCard)
  --------------------------------------------------
  Objectifs
  - Afficher une mission avec son contenu, état, énigme et réponse
  - Permettre l'ouverture/fermeture, la saisie et la validation de la réponse
  - Gérer les états : verrouillée, complétée, en cours, hors zone
  - Accessibilité et feedback utilisateur

  Principes
  - Props : mission, état ouvert, verrouillé, complété, statut scénario, réponse, distance, raison verrou
  - Événements : toggle, init-answer, update-answer, submit
*/
// Définition des props du composant
const props = defineProps({
  mission: { type: Object, required: true }, // Données de la mission
  open: { type: Boolean, default: false }, // État ouvert/fermé
  locked: { type: Boolean, default: false }, // Mission verrouillée
  completed: { type: Boolean, default: false }, // Mission complétée
  scenarioStatus: { type: String, required: true }, // Statut du scénario
  answerEntry: { type: Object, default: null }, // Saisie de la réponse
  inRange: { type: Boolean, default: true }, // Utilisateur dans la zone
  distanceText: { type: String, default: '' }, // Texte de distance
  lockReason: { type: String, default: '' }, // Raison du verrou
})

// Événements émis pour la logique de réponse et de toggle
const emit = defineEmits(['toggle', 'init-answer', 'update-answer', 'submit'])

// Toggle ouverture/fermeture
const onToggle = () => emit('toggle', props.mission.id)
// Initialisation de la saisie à la focale
const onFocus = () => emit('init-answer', props.mission.id)
// Mise à jour de la réponse
const onInput = (e) => emit('update-answer', { id: props.mission.id, value: e.target.value })
// Soumission de la réponse
const onSubmit = () => emit('submit', props.mission)
</script>

<template>
  <div
    class="c-mission-card"
    :class="{
      'c-mission-card--completed': completed,
      'c-mission-card--locked': locked && !completed,
      'c-mission-card--open': open,
    }"
    :id="`mission-${mission.id}`"
  >
    <div
      v-if="completed"
      class="c-mission-card__indicator"
      aria-label="Mission complétée"
      title="Mission complétée"
    >
      <span class="material-symbols-outlined">check</span>
    </div>
    <div class="c-mission-card__header">
      <h2 class="c-mission-card__title">Mission {{ mission.position }} - {{ mission.title }}</h2>
      <button
        type="button"
        class="c-mission-card__toggle material-symbols-outlined"
        :class="{
          'c-mission-card__toggle--rotated': open,
          'c-mission-card__toggle--disabled': locked && !completed,
        }"
        @click="onToggle"
        :title="lockReason"
        aria-label="Basculer la mission"
      >
        expand_more
      </button>
    </div>
    <div class="c-mission-card__body" v-show="open">
      <div v-if="!mission.blocks.length" class="c-mission-card__muted">Pas de contenu.</div>
      <div
        v-for="b in mission.blocks"
        :key="b.id"
        class="c-mission-card__block"
        :class="b.type === 'image' ? 'c-mission-card__block--image' : ''"
      >
        <p v-if="b.type === 'text'">{{ b.content_text }}</p>
        <figure v-else-if="b.type === 'image'">
          <img :src="b.url_media" :alt="b.caption || 'image'" />
        </figure>
      </div>
      <div class="c-mission-card__divider"></div>
      <div
        v-if="scenarioStatus !== 'not_started' && !completed && !locked"
        class="c-mission-card__riddle"
      >
        <div class="c-mission-card__question" v-if="mission.riddle_text">
          <span class="material-symbols-outlined">help</span>
          {{ mission.riddle_text }}
        </div>
        <div class="c-mission-card__question" v-else>
          <span class="material-symbols-outlined">help</span>
          Entrez la réponse de cette mission
        </div>
        <div v-if="!inRange" class="c-mission-card__geo-hint">
          <span class="material-symbols-outlined">near_me_disabled</span>
          Cette mission est située à environ {{ distanceText }} d'ici. Rendez-vous sur place pour
          répondre.
        </div>
        <div class="c-mission-card__answer-row" v-else>
          <input
            :disabled="answerEntry && answerEntry.status === 'checking'"
            @focus="onFocus"
            :value="answerEntry ? answerEntry.value : ''"
            @input="onInput"
            @keyup.enter.prevent="onSubmit"
            type="text"
            class="answer-input"
            placeholder="Votre réponse"
          />
          <button
            class="c-mission-card__btn c-mission-card__btn--secondary"
            :disabled="
              (answerEntry && answerEntry.status === 'checking') ||
              !(answerEntry && answerEntry.value)
            "
            @click="onSubmit"
          >
            <span v-if="answerEntry && answerEntry.status === 'checking'">…</span>
            <span v-else>Valider</span>
          </button>
        </div>
        <div
          class="c-mission-card__feedback"
          v-if="
            answerEntry &&
            (answerEntry.status === 'ok' || answerEntry.status === 'wrong' || answerEntry.error)
          "
        >
          <span
            v-if="answerEntry.status === 'ok'"
            class="c-mission-card__feedback c-mission-card__feedback--ok"
            >Mission validée ✔</span
          >
          <span
            v-else-if="answerEntry.status === 'wrong'"
            class="c-mission-card__feedback c-mission-card__feedback--wrong"
            >Mauvaise réponse</span
          >
          <span v-else class="c-mission-card__feedback c-mission-card__feedback--wrong">
            {{ answerEntry.error }}
          </span>
        </div>
      </div>

      <div v-else-if="completed" class="c-mission-card__riddle">
        <div class="c-mission-card__question" v-if="mission.riddle_text">
          <span class="material-symbols-outlined">help</span>
          {{ mission.riddle_text }}
        </div>
        <div class="c-mission-card__question" v-else>
          <span class="material-symbols-outlined">help</span>
          Énigme
        </div>
        <div class="c-mission-card__riddle-answer">
          <span class="c-mission-card__riddle-label">Réponse :</span>
          <span class="c-mission-card__riddle-value">{{
            (mission.answer_word || '').trim() || '—'
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
