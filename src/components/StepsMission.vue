<script setup>
import { ref } from 'vue'
const showInfo = ref(false)
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>
<template>
  <div class="missionCard">
    <h2 class="missionCard__title">Mission {{ props.name }}</h2>
    <img class="missionCard__arrow" :class="{ rotated: showInfo }" src="/icons/arrow_drop_down_circle.svg"
      alt="arrow drop down circle" @click="showInfo = !showInfo" />

    <Transition name="fade">
      <div class="missionCard__info" v-show="showInfo">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis quisquam aliquam neque
          natus velit rem nulla dolor modi esse, possimus, eos exercitationem sit placeat
          perspiciatis, molestiae dolorum at amet earum?
        </p>
        <img class="missionCard__picture"
          src="https://img.lovepik.com/png/20231129/the-square-of-the-center-for-measurement-vector-centered-isolated_724517_wh860.png"
          alt="photo" />
        <form action="submit">
          <label for="">Question?</label>
          <input type="text" />
          <button>Valider</button>
        </form>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.missionCard {
  background: #bdbdbd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(177, 176, 176, 0.4);
  display: grid;
  grid-template-columns: 1fr auto;

  &__arrow {
    width: 100%;
    display: flex;
    align-self: center;
    width: 2rem;
    cursor: pointer;
    transition: transform 0.3s;
  }

  &__picture {
    width: 100%;
  }
}
</style>
