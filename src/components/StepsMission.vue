<script setup>
import { ref } from 'vue'
import '../assets/mission-card.css'
const showInfo = ref(false)
const props = defineProps({
  name: {
    type: String,
    required: true
  }
});

</script>
<template>
  <div class="card">
    <h2 class="titleCard">Mission {{ props.name }}</h2>
    <img class="arrow" :class="{ rotated: showInfo }" src="/icons/arrow_drop_down_circle.svg"
      alt="arrow drop down circle" @click="showInfo = !showInfo">

    <Transition name="fade">
      <div class="info" v-show="showInfo">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis quisquam aliquam neque natus velit rem nulla
          dolor
          modi esse, possimus, eos exercitationem sit placeat perspiciatis, molestiae dolorum at amet earum?
        </p>
        <img
          src="https://img.lovepik.com/png/20231129/the-square-of-the-center-for-measurement-vector-centered-isolated_724517_wh860.png"
          alt="photo">
        <form action="submit">
          <label for="">Question?</label>
          <input type="text">
          <button> Valider</button>
        </form>

      </div>
    </Transition>
  </div>
</template>


<style scoped>
.info {
  img {
    width: 100%;
  }
}
</style>
