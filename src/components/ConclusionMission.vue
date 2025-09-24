<script setup>
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
<style scoped>
.card {
  background: #bdbdbd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(177, 176, 176, 0.4);
  display: grid;
  grid-template-columns: 1fr auto;
}

.arrow {
  display: flex;
  align-self: center;
  width: 2rem;
  cursor: pointer;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>