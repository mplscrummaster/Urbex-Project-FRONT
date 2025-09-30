<script setup>
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'

const activeFilter = ref('all')
const router = useRouter()

const scenarios = [
  { id: 1, title: 'Les ombres de la ville', author: 'Justifit', done: 4, total: 4 },
  { id: 2, title: 'Les passages interdits', author: 'Aramiss', done: 6, total: 6 },
  { id: 3, title: 'Les ruines oubliées', author: 'Sally Go', done: 1, total: 4 },
  { id: 4, title: 'Le réseau invisible', author: 'Justifit', done: 0, total: 4 },
  { id: 5, title: 'Sous la poussière du temps', author: 'Sealmon', done: 0, total: 7 },
]

const changeFilter = (e) => {
  const filterName = e.target.innerText
  console.log(`Filter changed to: ${filterName}`)
  const filters = document.querySelectorAll('.container__filter')
  filters.forEach((filter) => filter.classList.remove('active'))
  e.target.classList.add('active')
  activeFilter.value = filterName
}

const filteredScenarios = computed(() => {
  if (activeFilter.value === 'all') {
    return scenarios
  }
  if (activeFilter.value === 'terminés') {
    return scenarios.filter((s) => s.done === s.total)
  }
  if (activeFilter.value === 'commencés') {
    return scenarios.filter((s) => s.done > 0 && s.done < s.total)
  }
  if (activeFilter.value === 'pas encore') {
    return scenarios.filter((s) => s.done === 0)
  }
  return scenarios
})

const scenarioMarked = (e) => {
  console.log(`Scenario marked: ${e.target}`)
  e.target.classList.toggle('marked')
}

const scenarioClicked = (e) => {
  // const scenarioCard = e.currentTarget;
  // const scenarioId = scenarioCard.id;
  //  console.log(`Scenario clicked: ${scenarioId}`);
  router.push(`/scenarioinfo`)
}
</script>

<template>
  <div class="container">
    <!-- Фільтри -->
    <div class="container__filters" @click.prevent="changeFilter($event)">
      <button class="container__filter">all</button>
      <button class="container__filter">terminés</button>
      <button class="container__filter">commencés</button>
      <button class="container__filter">pas encore</button>
    </div>

    <!-- Сценарії -->
    <div
      v-for="scenario in filteredScenarios"
      :key="scenario.id"
      :id="scenario.id"
      :class="
        scenario.done === scenario.total
          ? 'card completed'
          : scenario.done > 0
            ? 'card in-progress'
            : 'card not-started'
      "
    >
      <h3 class="card__title" @click="scenarioClicked($event)">{{ scenario.title }}</h3>
      <img
        class="card__bookmark"
        src="/icons/bookmark.svg"
        alt=""
        @click="scenarioMarked($event)"
      />

      <p class="card__author">Scénario par {{ scenario.author }}</p>

      <div class="card__progress">
        <div
          class="card__progress-bar"
          :style="{ width: (scenario.done / scenario.total) * 100 + '%' }"
        ></div>
      </div>
      <p class="card__steps">{{ scenario.done }}/{{ scenario.total }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #2a2a2a;
  padding-block: 1rem 5rem;

  &__filters {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__filter {
    background: #1e1e1e;
    border: none;
    border-radius: 16px;
    padding: 6px 14px;
    font-size: 14px;
    color: #aaa;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #2a2a2a;
    }

    &.active {
      background: #3b82f6;
      color: #fff;
    }
  }
}
.card {
  background: #bdbdbd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(177, 176, 176, 0.4);

  &__bookmark {
    float: right;
    cursor: pointer;
  }

  &__marked {
    filter: invert(39%) sepia(98%) saturate(749%) hue-rotate(203deg) brightness(91%) contrast(86%);
    color: yellow;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    color: #fff;
    text-decoration: underline;
  }

  &__author {
    margin: 4px 0;
    font-size: 13px;
    color: #aaa;
  }

  &__progress {
    margin-top: 6px;
    background: #333;
    height: 6px;
    border-radius: 4px;
    overflow: hidden;
    grid-column-start: 0;
    grid-row-start: 3;
  }

  &__progress-bar {
    background: #3b82f6;
    /* синій */
    height: 100%;
    transition: width 0.3s ease;
  }

  &__steps {
    margin-top: 4px;
    font-size: 12px;
    color: #ccc;
  }

  &.completed {
    background-color: rgba(105, 105, 105, 0.637);
  }

  &.in-progress {
    border: 2px solid #5d8ddb;
  }
}

.hidden {
  display: none;
}
</style>
