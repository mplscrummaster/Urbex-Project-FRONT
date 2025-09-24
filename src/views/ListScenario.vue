<script setup>
const scenarios = [
  { id: 1, title: "Les ombres de la ville", author: "Justifit", done: 4, total: 4 },
  { id: 2, title: "Les passages interdits", author: "Aramiss", done: 6, total: 6 },
  { id: 3, title: "Les ruines oubliées", author: "Sally Go", done: 1, total: 4 },
  { id: 4, title: "Le réseau invisible", author: "Justifit", done: 0, total: 4 },
  { id: 5, title: "Sous la poussière du temps", author: "Sealmon", done: 0, total: 7 },
];
</script>

<template>
  <div class="container">
    <!-- Фільтри -->
    <div class="filters">
      <button class="filter active">terminés</button>
      <button class="filter">commencés</button>
      <button class="filter">pas encore</button>
    </div>

    <!-- Сценарії -->
    <div v-for="(scenario, key) in scenarios" :key="key" :id="scenario.id" class="card">
      <!-- Назва -->
      <h3 class="title">{{ scenario.title }}</h3>
      <!-- Автор -->
      <p class="author">Scénario par {{ scenario.author }}</p>

      <!-- Прогрес -->
      <div class="progress">
        <div class="progress-bar" :style="{ width: (scenario.done / scenario.total * 100) + '%' }"></div>
      </div>
      <p class="steps">{{ scenario.done }}/{{ scenario.total }}</p>
    </div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #121212;
  color: #fff;
}

.container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
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
