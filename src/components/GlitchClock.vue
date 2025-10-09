<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const time = ref("");
const isOff = ref(true);
const isGlitch = ref(true);

let intervalId;
let animIntervalId;

onMounted(() => {
  // clock startup
  setTimeout(() => {
    isOff.value = false;

  }, 2000);

  // real-time clock update
  intervalId = setInterval(() => {
    const now = new Date();
    const hours = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
    const minutes = now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
    const seconds = now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds();
    time.value = `${hours} : ${minutes} : ${seconds}`;

  }, 1000);

  animIntervalId = setInterval(() => {
    isOff.value = true;
    setTimeout(() => {
      isOff.value = false;
    }, 2000); // тривалість анімації
  }, 4000);
});

onUnmounted(() => {
  clearInterval(intervalId);
  clearInterval(animIntervalId);
});

const toggleGlitch = () => {
  isGlitch.value = !isGlitch.value;
}
</script>

<template>
  <a href="#" class="switcher" @click.prevent="toggleGlitch"></a>

  <div class="screen" :class="{ glitch: isGlitch }">
    <div class="clock" :class="{ 'is-off': isOff }">
      <span class="time" :data-time="time">{{ time }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css?family=Lato:400,700");

$bg-color: #11111178;
$txt-color: #fff;

$color-c1: red;
$color-c2: blue;

$offset-c1: 3;
$offset-c2: 2;

$lay-c1: 2;
$lay-c2: 2;

@import url("https://fonts.googleapis.com/css?family=Lato:400,700");

$bg-color: #11111178;
$txt-color: #fff;

$color-c1: red;
$color-c2: blue;

$offset-c1: 3;
$offset-c2: 2;

$lay-c1: 2;
$lay-c2: 2;

/* RESET */
*,
*:before,
*:after {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  box-sizing: border-box;
  user-select: none;
}

html,
body {
  height: 100%;
}

body {
  font-family: "Lato", sans-serif;
  font-weight: 700;
  background: $bg-color;
  color: $txt-color;
}

/* SWITCHER BUTTON */
a.switcher {
  display: block;
  position: fixed;
  text-decoration: none;
  z-index: 9999;
  right: 20px;
  bottom: 20px;
  width: 16px;
  height: 16px;
  background: transparent;
  border: 2px solid $txt-color;
  border-radius: 50%;
  opacity: 0.15;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;

  }

  &:before {
    content: "";
    position: absolute;
    width: 2px;
    height: 5px;
    border-radius: 2px;
    background: $txt-color;
    top: 0;
    left: 5px;

  }
}

/* SCREEN */
.screen {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100dvw;
  position: relative;
  overflow: hidden;
}

/* CLOCK */
.clock {
  position: relative;
  width: fit-content; // адаптивна ширина
  max-width: 720px;
  text-align: center;
  cursor: default;

  span {
    display: block;
    font-size: clamp(48px, 15vw, 128px); // адаптивний шрифт
    line-height: 1;
    position: relative;
  }

  &.is-off {
    animation: is-off 2s linear infinite !important;
  }
}


/* GLITCH EFFECT */
.glitch {
  &:before {
    position: absolute;
    z-index: 9999;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    animation: bg-move 2s linear infinite;
    background-size: 100% 8px;

  }

  .clock {
    transform: skewX(0deg) scaleY(1);
    animation: clock-bag 4s linear infinite;

    span {

      &:before,
      &:after {
        content: attr(data-time);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: $bg-color;
        color: $txt-color;
        overflow: hidden;
        clip: rect(0, 9999px, 0, 0);

      }

      &:before {
        left: -$offset-c2;
        text-shadow: $lay-c2 0 $color-c2;
        animation: c2 1s infinite linear alternate-reverse;

      }

      &:after {
        left: $offset-c1;
        text-shadow: -$lay-c1 0 $color-c1;
        animation: c1 2s infinite linear alternate-reverse;

      }
    }
  }
}

/* ANIMATIONS */
@keyframes is-off {

  0%,
  50% {
    opacity: 1;
  }

  56%,
  57% {
    opacity: 0;
  }

  58% {
    opacity: 1;
  }

  71% {
    transform: scaleY(1) skewX(0deg);
  }

  72% {
    transform: scaleY(3) skewX(-60deg);
  }

  73% {
    transform: scaleY(1) skewX(0deg);
  }

  80% {
    opacity: 1;
  }

  81%,
  84% {
    opacity: 0;
  }

  85% {
    opacity: 1;
  }

  91% {
    transform: scaleX(1) scaleY(1) skewX(0deg);
    color: $txt-color;
  }

  92% {
    transform: scaleX(1.5) scaleY(.2) skewX(80deg);
    color: green;
  }

  93% {
    transform: scaleX(1) scaleY(1) skewX(0deg);
    color: $txt-color;
  }
}

@keyframes c1 {
  0% {
    clip: rect(12px, 9999px, 85px, 0);
  }

  20% {
    clip: rect(50px, 9999px, 70px, 0);
  }

  40% {
    clip: rect(10px, 9999px, 90px, 0);
  }

  60% {
    clip: rect(45px, 9999px, 100px, 0);
  }

  80% {
    clip: rect(20px, 9999px, 60px, 0);
  }

  100% {
    clip: rect(0px, 9999px, 80px, 0);
  }
}

@keyframes c2 {
  0% {
    clip: rect(15px, 9999px, 60px, 0);
  }

  25% {
    clip: rect(30px, 9999px, 100px, 0);
    transform: scaleX(.9);
  }

  50% {
    clip: rect(5px, 9999px, 75px, 0);
  }

  75% {
    clip: rect(40px, 9999px, 85px, 0);
  }

  100% {
    clip: rect(0px, 9999px, 100px, 0);
  }
}

@keyframes clock-bag {
  0% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(2px, -2px);
  }

  50% {
    transform: translate(-2px, 2px);
  }

  75% {
    transform: translate(3px, -1px);
  }

  100% {
    transform: translate(0, 0);
  }
}

@keyframes bg-move {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 0 -32px;
  }
}

/* RESPONSIVE MEDIA QUERIES */
@media (max-width: 480px) {
  .clock span {
    font-size: clamp(36px, 20vw, 80px);
  }

  .glitch .clock span:before,
  .glitch .clock span:after {
    text-shadow: none; // менш агресивний глітч на мобільних
  }
}
</style>
