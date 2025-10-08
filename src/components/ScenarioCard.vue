<script setup>
  /*
    Carte scénario (ScenarioCard)
    --------------------------------------------------
    Objectifs
    - Afficher les infos principales d'un scénario (titre, auteur, progression, favori)
    - Permettre la navigation vers le détail au clic
    - Gérer le bookmarking (ajout/retrait des favoris)
    - Afficher la progression (barre et pourcentage)
    - Accessibilité : aria-label, boutons
  
    Principes
    - Props : scénario, affichage auteur, navigation auto
    - Événements : select (sélection de la carte)
  */
  import { computed, getCurrentInstance } from 'vue'
  import { useRouter } from 'vue-router'
  import { useScenariosStore } from '@/stores/scenarios'
  // Définition des props du composant
  const props = defineProps({
    scenario: { type: Object, required: true }, // Données du scénario
    showAuthor: { type: Boolean, default: true }, // Afficher l'auteur
    autoNavigate: { type: Boolean, default: true }, // Navigation auto au clic
  })
  // Événement émis lors de la sélection
  const emit = defineEmits(['select'])
  const router = useRouter()
  const store = useScenariosStore()

  // Calcul du pourcentage de progression
  const progressPercent = computed(() => {
    const r = props.scenario.progressRatio
    if (r == null) return 0
    return Math.round(r * 100)
  })
  // Indique si la progression est disponible
  const hasProgress = computed(() => props.scenario.progressRatio != null)
  // Classe CSS selon le statut du scénario
  const statusClass = computed(() => {
    const s = props.scenario.status
    if (s === 'completed') return 'c-scenario-card--completed'
    if (s === 'started') return 'c-scenario-card--started'
    return 'c-scenario-card--not-started'
  })

  // Ajout ou retrait du favori
  const toggleBookmark = async () => {
    try {
      const ok = await store.toggleBookmark(props.scenario.id, {
        confirmCallback: async () =>
          window.confirm('Confirmer la suppression du favori et de la progression ?'),
        fromState: !!props.scenario.bookmarked,
      })
      if (ok) {
        // L'état UI est mis à jour via le store (pas de mutation directe des props)
      }
    } catch {
      // silencieux
    }
  }

  // Sélection de la carte (clic) : émet l'événement et navigue si besoin
  const handleSelect = () => {
    const hasListener = !!getCurrentInstance()?.vnode?.props?.onSelect
    emit('select', props.scenario)
    if (props.autoNavigate && !hasListener && props.scenario?.id != null) {
      // Navigation vers le détail du scénario
      router.push({ name: 'scenario-detail', params: { id: props.scenario.id } }).catch(() => { })
    }
  }
</script>

<template>
  <div class="c-scenario-card" :class="[statusClass]" @click="handleSelect">
    <div class="c-scenario-card__media">
      <div class="c-scenario-card__thumb">
        <span class="material-symbols-outlined c-scenario-card__thumb-icon" aria-hidden="true">menu_book</span>
      </div>
    </div>
    <div class="c-scenario-card__body">
      <div class="c-scenario-card__header">
        <div class="c-scenario-card__text">
          <h4 class="c-scenario-card__title" :title="scenario.title">{{ scenario.title }}</h4>
          <p class="c-scenario-card__author" v-if="showAuthor">
            Scénario par {{ scenario.author || '—' }}
          </p>
        </div>
        <button class="c-scenario-card__bookmark" :class="{ 'c-scenario-card__bookmark--active': scenario.bookmarked }"
          @click.stop="toggleBookmark" :title="scenario.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          aria-label="Bookmark">
          <span class="material-symbols-outlined c-scenario-card__bookmark-icon"
            :class="{ 'c-scenario-card__bookmark-icon--fill': scenario.bookmarked }">{{ scenario.bookmarked ? 'bookmark'
              : 'bookmark' }}</span>
        </button>
      </div>
      <div v-if="hasProgress" class="c-scenario-card__progress">
        <div class="c-scenario-card__progress-bar">
          <div class="c-scenario-card__progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
        <div class="c-scenario-card__progress-meta" v-if="scenario.hasPreciseProgress">
          {{ scenario.completedMissions }}/{{ scenario.totalMissions }} ({{ progressPercent }}%)
        </div>
        <div class="c-scenario-card__progress-meta" v-else>{{ progressPercent }}%</div>
      </div>
    </div>
  </div>
</template>
