<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const scenarios = [
  { id: 1, title: 'Les ombres de la ville', author: 'Justifit', done: 4, total: 4 },
  { id: 2, title: 'Les passages interdits', author: 'Aramiss', done: 6, total: 6 },
  { id: 3, title: 'Les ruines oubliées', author: 'Sally Go', done: 1, total: 4 },
  { id: 4, title: 'Le réseau invisible', author: 'Justifit', done: 0, total: 4 },
  { id: 5, title: 'Sous la poussière du temps', author: 'Sealmon', done: 0, total: 7 },
]

const changeFilter = (e) => {
  console.log(`Filter changed to: ${e.target}`)
  const filters = document.querySelectorAll('.filter')
  filters.forEach((filter) => filter.classList.remove('active'))
  e.target.classList.add('active')
}

const scenarioMarked = (e) => {
  console.log(`Scenario marked: ${e.target}`)
  e.target.classList.toggle('marked')
}

const scenarioClicked = (e) => {
  // const scenarioCard = e.currentTarget;
  // const scenarioId = scenarioCard.id;
  //  console.log(`Scenario clicked: ${scenarioId}`);
  // Навігація до сторінки сценарію
  router.push(`/scenarioinfo`)
}
</script>

<template>
  <div class="container">
    <!-- Фільтри -->
    <div class="filters" @click.prevent="changeFilter($event)">
      <button class="filter">terminés</button>
      <button class="filter">commencés</button>
      <button class="filter">pas encore</button>
    </div>

    <!-- Сценарії -->
    <div
      v-for="(scenario, key) in scenarios"
      :key="key"
      :id="scenario.id"
      :class="
        scenario.done === scenario.total
          ? 'card completed'
          : scenario.done > 0
            ? 'card in-progress'
            : 'card not-started'
      "
    >
      <h3 class="title" @click="scenarioClicked($event)">{{ scenario.title }}</h3>
      <img class="bookmark" src="/icons/bookmark.svg" alt="" @click="scenarioMarked($event)" />

      <p class="author">Scénario par {{ scenario.author }}</p>

      <!-- Прогрес -->
      <div class="progress">
        <div
          class="progress-bar"
          :style="{ width: (scenario.done / scenario.total) * 100 + '%' }"
        ></div>
      </div>
      <p class="steps">{{ scenario.done }}/{{ scenario.total }}</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #2a2a2a;
  padding-block: 1rem 5rem;
}

/* Фільтри */
.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter {
  background: #1e1e1e;
  border: none;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 14px;
  color: #aaa;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter:hover {
  background: #2a2a2a;
}

.filter.active {
  background: #3b82f6;
  color: #fff;
}

/* Картки */
.card {
  background: #bdbdbd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(177, 176, 176, 0.4);
}

.card.completed {
  background-color: rgba(105, 105, 105, 0.637);
}

.card.in-progress {
  border: 2px solid #5d8ddb;
}

.bookmark {
  float: right;
  cursor: pointer;
}

.marked {
  filter: invert(39%) sepia(98%) saturate(749%) hue-rotate(203deg) brightness(91%) contrast(86%);
  color: yellow;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  color: #fff;
  text-decoration: underline;
}

.author {
  margin: 4px 0;
  font-size: 13px;
  color: #aaa;
}

.progress {
  margin-top: 6px;
  background: #333;
  height: 6px;
  border-radius: 4px;
  overflow: hidden;
  grid-column-start: 0;
  grid-row-start: 3;
}

.progress-bar {
  background: #3b82f6;
  /* синій */
  height: 100%;
  transition: width 0.3s ease;
}

.steps {
  margin-top: 4px;
  font-size: 12px;
  color: #ccc;
}
</style>
