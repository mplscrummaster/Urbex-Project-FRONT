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
  <div class="card">
    <h2 class="position">{{ props.value }}</h2>

  </div>

</template>