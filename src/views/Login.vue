<template>
  <div class="login-page">
    <StarBackground />

    <!-- 装饰星点 -->
    <span class="art-star" v-for="item in starList" :key="item.id" :style="item.style"></span>

    <!-- 超大不规则七彩星云团 -->
    <div class="center-nebula">
      <!-- 透明输入框 -->
      <input
        v-model="pwd"
        type="password"
        placeholder="请输入密码"
        class="transparent-input"
        @keyup.enter="go"
      />
      <!-- 恢复星星按钮：透明背景 + 白色边框 -->
      <div class="star-btn" @click="go"></div>
    </div>
    <input
        v-model="pwd"
        type="password"
        placeholder="请输入密码"
        class="transparent-input"
        @keyup.enter="go"
      />
      <!-- 恢复星星按钮：透明背景 + 白色边框 -->
      <div class="star-btn" @click="go"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StarBackground from '../components/StarBackground.vue'

const router = useRouter()
const pwd = ref('')
const PASSWORD = '1108'

const go = () => {
  if (pwd.value === PASSWORD) {
    router.push('/audio')
  }
}

const starList = ref([])
const starNum = 22

onMounted(() => {
  let arr = []
  for (let i = 0; i < starNum; i++) {
    const top = Math.random() * 100
    const left = Math.random() * 100
    const size = Math.random() * 2.8 + 1
    const delay = Math.random() * 7
    const dur = Math.random() * 4.5 + 2
    arr.push({
      id: i,
      style: {
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${dur}s`
      }
    })
  }
  starList.value = arr
})
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 装饰闪烁星星 */
.art-star {
  position: absolute;
  background: #e0ecff;
  border-radius: 50%;
  animation: randomTwinkle ease-in-out infinite alternate;
  z-index: 1;
}
@keyframes randomTwinkle {
  0% { opacity: 0.15; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.2; transform: scale(0.7); }
}

/* ====================== */
/* 超大 · 绿色主调 · 不规则星云 */
/* ====================== */
.center-nebula {
  position: fixed;
  z-index: 2;
  width: 66vw;
  height: 38vh;
  background: 
    radial-gradient(ellipse at 18% 28%, rgba(80, 220, 130, 0.32), transparent 58%),
    radial-gradient(ellipse at 82% 35%, rgba(170, 120, 255, 0.3), transparent 55%),
    radial-gradient(ellipse at 35% 78%, rgba(255, 160, 220, 0.26), transparent 60%),
    radial-gradient(ellipse at 68% 18%, rgba(255, 230, 140, 0.24), transparent 52%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%);
  filter: blur(36px) brightness(1.3);
  border-radius: 42% 58% 48% 52% / 48% 42% 58% 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 42px;
  animation: nebulaFloat 24s ease-in-out infinite alternate;
}

/* 星云流动呼吸动画 */
@keyframes nebulaFloat {
  0%  { transform: scale(1)   translate(0, 0) rotate(0deg); }
  50% { transform: scale(1.12) translate(8px, -6px) rotate(1.5deg); }
  100%{ transform: scale(1)   translate(0, 0) rotate(0deg); }
}

/* 完全透明输入框 + 醒目提示语 */
.transparent-input {
  width: 320px;
  height: 68px;
  background: transparent !important;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 1);
  font-size: 20px;
  text-align: center;
  letter-spacing: 1.2px;
  z-index: 3;
  position: relative;
}
.transparent-input::placeholder {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

/* ====================== */
/* 星星按钮：透明背景 + 白色边框 */
/* ====================== */
.star-btn {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.795);
  border: 2px solid rgba(255, 255, 255, 0.85);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  cursor: pointer;
  transition: all 0.4s ease;
  z-index: 3;
  flex-shrink: 0;
}
.star-btn:hover {
  transform: scale(1.15);
  border-color: #fff;
}

/* 响应式 */
@media (max-width: 768px) {
  .center-nebula {
    width: 80vw;
    height: 32vh;
    gap: 30px;
  }
  .transparent-input {
    width: 220px;
    font-size: 17px;
  }
  .star-btn {
    width: 52px;
    height: 52px;
  }
}
</style>