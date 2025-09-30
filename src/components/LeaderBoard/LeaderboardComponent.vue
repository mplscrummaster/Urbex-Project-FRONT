<script setup>

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="userCard" :class="{
    'first-place': props.value === 1,
    'second-place': props.value === 2,
    'third-place': props.value === 3
  }">
    <h2>{{ props.value }}</h2>
    <img class="userImg" src="/public/img/profile-placeholder.png" alt="person icon" />
    <div class="userInfos">
      <div class="userName">Name User</div>
      <div class="userExperience"> 100px </div>
    </div>
  </div>

</template>

<style lang="scss">
.userCard {
  background-color: gray;
  border-radius: 1rem;
  width: 80%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 1rem;
  box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.155);

  &.first-place {
    background-color: gold;
  }

  &.second-place {
    background-color: silver;
  }

  &.third-place {
    background-color: #cd7f32;
  }

  .userImg {

    width: 5rem;
    height: 5rem;
    display: flex;
    justify-self: center;
    align-self: center;
  }

  .userInfos {
    display: flex;
    width: 100%;
    font-size: x-large;
    justify-content: space-between;
  }

}
</style>