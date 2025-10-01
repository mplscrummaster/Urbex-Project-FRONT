<script setup>
import { onMounted, onUnmounted } from 'vue'

import leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

let map = null

const getPositions = (callback) => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      callback([lat, lng])
    },
    (err) => {
      console.error('Erreur de géolocalisation :', err)
      // Position par défaut si refusé
      callback([48.8584, 2.2945])
    },
  )
}

const CreateMap = (coords) => {
  //__Creation de la map__
  map = leaflet.map('globalMap').setView(coords, 13)
  leaflet
    .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    })
    .addTo(map)
  //__Ajout de notre position__
  const selfMark = leaflet.marker(coords)

  selfMark.addTo(map)
}
//Lors de la creation
onMounted(() => {
  console.log(import.meta.env.VITE_API_URL)
  getPositions((coords) => {
    CreateMap(coords)
  })
})
//Quand la carte est démontée, alors on la détruit
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="globalMap" id="globalMap"></div>
</template>

<style lang="scss" scoped>
.globalMap {
  height: 100dvh;
  width: 100%;
  padding: 0;
  position: absolute;
  z-index: 1;
}
</style>
