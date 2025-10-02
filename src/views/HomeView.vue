<script setup>
import GlitchClock from '@/components/GlitchClock.vue';
</script>

<template>
  <div class="background"></div>

  <div class="home-container">
    <GlitchClock />
    <h1 class="slogan">Join us today</h1>
  </div>
</template>

<style lang="scss" scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/img/homepage.png'); // у Vue public -> /img/
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  z-index: -1;
}

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80dvh;
  text-align: center;
  position: relative;
}

.slogan {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}
</style>
