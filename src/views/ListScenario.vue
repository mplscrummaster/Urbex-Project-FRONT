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
