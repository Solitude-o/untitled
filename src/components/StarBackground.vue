<template>
  <div class="stars-container">
    <div class="star" v-for="(i) in 90" :key="i" :style="starStyle()"></div>
    <div class="meteor" v-for="(m) in 12" :key="m" :style="meteorStyle()"></div>
  </div>
</template>

<script setup>
const random = (min, max) => Math.random() * (max - min) + min

const starStyle = () => ({
  left: random(0, 100) + '%',
  top: random(0, 100) + '%',
  width: random(1, 3) + 'px',
  height: random(1, 3) + 'px',
  opacity: random(0.4, 1),
  animationDelay: random(0, 3) + 's'
})

const meteorStyle = () => {
  const bright = random(65, 85)
  const speed = random(2.2, 4.2)
  return {
    left: random(0, 100) + '%',
    top: random(0, 100) + '%',
    animationDelay: random(0, 6) + 's',
    animationDuration: speed + 's',
    '--light': bright + '%'
  }
}
</script>

<style scoped>
.stars-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: #0b1813;
  overflow: hidden;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 3s infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.meteor {
  position: absolute;
  width: 10vw;
  min-width: 100px;
  max-width: 140px;
  height: 2px;
  background: linear-gradient(90deg, hsl(130, 70%, var(--light)), transparent);
  transform: rotate(-30deg);
  animation: meteor-fly linear infinite;
  opacity: 0;
}

@keyframes meteor-fly {
  0% {
    transform: translate(0, 0) rotate(-30deg);
    opacity: 1;
  }
  100% {
    transform: translate(-100vw, 80vh) rotate(-30deg);
    opacity: 0;
  }
}
</style>