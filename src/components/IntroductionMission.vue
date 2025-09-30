<script setup>
import { ref } from 'vue'
const showInfo = ref(false)
</script>

<template>
  <div class="introductionCard">
    <h2 class="introductionCard__title">Introduction</h2>
    <img
      class="arrow"
      :class="{ rotated: showInfo }"
      src="/icons/arrow_drop_down_circle.svg"
      alt="arrow drop down circle"
      @click="showInfo = !showInfo"
    />

    <Transition name="fade">
      <div class="introductionCard__info" v-show="showInfo">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis quisquam aliquam neque
          natus velit rem nulla dolor modi esse, possimus, eos exercitationem sit placeat
          perspiciatis, molestiae dolorum at amet earum?
        </p>
        <button>Commence d'avanture</button>
      </div>
    </Transition>
  </div>
</template>
<style lang="scss" scoped>
.introductionCard {
  background: #bdbdbd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(177, 176, 176, 0.4);
  display: grid;
  grid-template-columns: 1fr auto;
}
</style>
