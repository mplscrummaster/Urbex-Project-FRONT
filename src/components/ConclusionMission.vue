<script setup>
import '../assets/mission-card.css'
import { ref } from 'vue'
const showInfo = ref(false)
</script>
<template>
  <div class="card">
    <h2 class="titleCard">Conclusion</h2>
    <img class="arrow" :class="{ rotated: showInfo }" src="/icons/arrow_drop_down_circle.svg"
      alt="arrow drop down circle" @click="showInfo = !showInfo">

    <Transition name="fade">
      <div class="info" v-show="showInfo">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis quisquam aliquam neque natus velit rem nulla
          dolor
          modi esse, possimus, eos exercitationem sit placeat perspiciatis, molestiae dolorum at amet earum?
        </p>
        <button> Merci pour attention</button>
      </div>
    </Transition>

  </div>
</template>
