<template>
  <div class="audio-main">
    <StarBackground />

    <!-- 标题区域 -->
    <div class="night-header">
      <div class="night-decor">
        <div class="firefly-big" v-for="i in 2" :key="i"></div>
        <div class="firefly-small" v-for="i in 16" :key="i"></div>
        <div class="star-dot" v-for="i in 14" :key="i"></div>
        <div class="symbol" v-for="i in 4" :key="i">♪</div>
      </div>
      <div class="moon"></div>
      <div class="night-text">Good night</div>
    </div>

    <!-- 动态列表 -->
    <div class="scroll-container" ref="scroll">
      <div class="list-wrap">
        <div class="item-wrap" v-for="(post, idx) in reversedList" :key="idx">
          <div class="item-date" @click="scrollToPost(idx)">
            <div class="date-dot"></div>
            <span class="date-text">{{ post.date }}</span>
          </div>

          <div class="item-content glass">
            <div class="decor-container">
              <div class="firefly" v-for="i in 2" :key="i"></div>
              <div class="firefly-small-card" v-for="i in 8" :key="i"></div>
              <div class="symbol" v-for="i in 3" :key="i">♫</div>
              <div class="star-dot" v-for="i in 10" :key="i"></div>
            </div>

            <div class="content-wrapper">
              <div class="content-text" v-if="post.content">{{ post.content }}</div>

              <div class="content-pics" v-if="post.pictures && post.pictures.length">
                <div 
                  class="pic-thumb" 
                  v-for="(pic, pi) in post.pictures" 
                  :key="pi"
                  @click="openSinglePic(post, pi)"
                >
                  <video v-if="isLivePic(pic.url)" :src="pic.url" class="thumb-media" muted loop autoplay playsinline></video>
                  <img v-else :src="pic.url" class="thumb-media" />
                </div>
              </div>

              <!-- 音频区域：新增可拖动圆点 -->
              <div class="content-audios" v-if="post.audios && post.audios.length">
                <div class="audio-box" v-for="(au, ai) in post.audios" :key="ai">
                  <div class="audio-btn" @click="toggleAudio(au, $event)">▶</div>
                  
                  <!-- 可拖动进度条 -->
                  <div 
                    class="audio-progress" 
                    @click="handleProgressClick(au, $event)"
                    @mousedown="startDrag(au, $event)"
                  >
                    <div class="audio-progress-bar" :ref="el => setProgressRef(el, au)"></div>
                    <!-- 拖动圆点 -->
                    <div class="audio-drag-thumb" :ref="el => setThumbRef(el, au)"></div>
                  </div>

                  <div class="audio-time">
                    <span ref="el => setTimeRef(el, au)">00:00 / 00:00</span>
                  </div>
                </div>
              </div>

              <video v-if="post.video" :src="post.video" controls class="content-video"></video>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <div class="preview-mask" v-if="previewShow" @click.self="closePreview">
      <div class="preview-box">
        <div class="preview-arrow left" @click.stop="prevPic">◀</div>
        <div class="preview-arrow right" @click.stop="nextPic">▶</div>
        <img v-if="nowPic.url" :src="nowPic.url" class="preview-img" />
        <video v-else :src="nowPic.url" class="preview-img" muted loop autoplay playsinline></video>
        <div class="preview-desc" v-if="nowPic.desc">{{ nowPic.desc }}</div>
        <div class="preview-close" @click="closePreview">✕</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import StarBackground from '../components/StarBackground.vue'

const GIST_JSON_URL="https://gist.githubusercontent.com/Solitude-o/d482ae581677f0c60329ba8bf4955914/raw/b93826d724f295315840be017ee17a3acb2894c1/data.json"

const postList = ref([])

onMounted(async () => {
  try {
    const res = await fetch(GIST_JSON_URL)
    const data = await res.json()
    postList.value = data
  } catch (err) {
    console.log('加载失败，使用默认数据')
    alert("加载失败")
  }
})

const reversedList = computed(() => [...postList.value].reverse())
const previewShow = ref(false)
const nowPic = ref({})
const currentIndex = ref(0)
const currentPicIndex = ref(0)
const playingAudios = ref({})
const progressMap = ref({})
const timeTextMap = ref({})
const thumbMap = ref({}) // 拖动圆点
const isDragging = ref(false)

const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(Math.floor(s % 60)).toString().padStart(2, '0')}`
const isLivePic = (url) => url.toLowerCase().endsWith('.heic')

// 打开单张图片预览
const openSinglePic = (post, picIdx) => {
  currentIndex.value = reversedList.value.findIndex(item => item.date === post.date)
  currentPicIndex.value = picIdx
  nowPic.value = post.pictures[picIdx]
  previewShow.value = true
  document.body.style.overflow = 'hidden'
}

// 上一张
const prevPic = () => {
  const currentPost = reversedList.value[currentIndex.value]
  if (currentPicIndex.value > 0) {
    currentPicIndex.value--
    nowPic.value = currentPost.pictures[currentPicIndex.value]
  }
}

// 下一张
const nextPic = () => {
  const currentPost = reversedList.value[currentIndex.value]
  if (currentPicIndex.value < currentPost.pictures.length - 1) {
    currentPicIndex.value++
    nowPic.value = currentPost.pictures[currentPicIndex.value]
  }
}

const closePreview = () => { 
  previewShow.value = false
  document.body.style.overflow = ''
}

const scrollToPost = (idx) => {}

// 播放暂停
function toggleAudio(src, e) {
  const audio = playingAudios.value[src]
  if (audio) {
    audio.paused ? audio.play() : audio.pause()
    e.target.innerText = audio.paused ? '▶' : '⏸'
  } else {
    const au = new Audio(src)
    playingAudios.value[src] = au
    au.play()
    e.target.innerText = '⏸'
    
    au.ontimeupdate = () => {
      const p = (au.currentTime / au.duration) * 100 || 0
      const bar = progressMap.value[src]
      const thumb = thumbMap.value[src]
      if (bar) bar.style.width = `${p}%`
      if (thumb) thumb.style.left = `${p}%`
      
      const txt = timeTextMap.value[src]
      if (txt) txt.innerText = `${formatTime(au.currentTime)} / ${formatTime(au.duration)}`
    }
    
    au.onended = () => {
      e.target.innerText = '▶'
      const bar = progressMap.value[src]
      const thumb = thumbMap.value[src]
      if (bar) bar.style.width = '0%'
      if (thumb) thumb.style.left = '0%'
    }
  }
}

// 点击进度条跳转
function handleProgressClick(src, e) {
  const audio = playingAudios.value[src]
  if (!audio) return
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  audio.currentTime = percent * audio.duration
}

// 开始拖动
function startDrag(src, e) {
  isDragging.value = true
  const moveHandler = (moveEvent) => {
    if (!isDragging.value) return
    const audio = playingAudios.value[src]
    if (!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    let percent = (moveEvent.clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent))
    
    audio.currentTime = percent * audio.duration
    progressMap.value[src].style.width = percent * 100 + '%'
    thumbMap.value[src].style.left = percent * 100 + '%'
  }

  const upHandler = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
  }

  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
}

function setProgressRef(el, src) {
  if (el) progressMap.value[src] = el
}
function setTimeRef(el, src) {
  if (el) timeTextMap.value[src] = el
}
function setThumbRef(el, src) {
  if (el) thumbMap.value[src] = el
}

onMounted(() => {
  const noteArr = ['♥', '★', '♪', '♬', '✲','✦','✶','✿','⚡']
  document.querySelectorAll('.firefly-small').forEach(el => {
    const s = 3 + Math.random() * 5
    el.style.top = Math.random() * 100 + '%'
    el.style.left = Math.random() * 100 + '%'
    el.style.width = s + 'px'
    el.style.height = s + 'px'
    el.style.animationDelay = Math.random() * 4 + 's'
  })
  document.querySelectorAll('.night-decor .star-dot').forEach(el => {
    el.style.top = Math.random() * 100 + '%'
    el.style.left = Math.random() * 100 + '%'
    el.style.animationDelay = Math.random() * 3 + 's'
  })
  document.querySelectorAll('.night-decor .symbol').forEach(el => {
    const sym = noteArr[Math.floor(Math.random() * noteArr.length)]
    el.innerText = sym
    if (sym === '⚡') el.style.filter = 'brightness(0) invert(1)'
    el.style.top = Math.random() * 90 + '%'
    el.style.left = Math.random() * 90 + '%'
    el.style.fontSize = (16 + Math.random() * 8) + 'px'
    el.style.animationDelay = Math.random() * 5 + 's'
  })

  document.querySelectorAll('.firefly-small-card').forEach(el => {
    const s = 2 + Math.random() * 4
    const type = Math.floor(Math.random() * 4)
    if (type === 0) el.style.top = `${Math.random() * 12}%`
    else if (type === 1) el.style.top = `${88 + Math.random() * 12}%`
    else if (type === 2) el.style.left = `${Math.random() * 12}%`
    else el.style.left = `${88 + Math.random() * 12}%`
    el.style.top = el.style.top || `${12 + Math.random() * 76}%`
    el.style.left = el.style.left || `${12 + Math.random() * 76}%`
    el.style.width = s + 'px'
    el.style.height = s + 'px'
    el.style.animationDelay = Math.random() * 3.5 + 's'
  })

  document.querySelectorAll('.decor-container .star-dot').forEach(el => {
    const type = Math.floor(Math.random() * 4)
    if (type === 0) el.style.top = `${Math.random() * 10}%`
    else if (type === 1) el.style.top = `${90 + Math.random() * 10}%`
    else if (type === 2) el.style.left = `${Math.random() * 10}%`
    else el.style.left = `${90 + Math.random() * 10}%`
    el.style.top = el.style.top || `${10 + Math.random() * 80}%`
    el.style.left = el.style.left || `${10 + Math.random() * 80}%`
    el.style.animationDelay = Math.random() * 3 + 's'
  })

  document.querySelectorAll('.decor-container .symbol').forEach(el => {
    const sym = noteArr[Math.floor(Math.random() * noteArr.length)]
    el.innerText = sym
    if (sym === '⚡') el.style.filter = 'brightness(0) invert(1)'
    const type = Math.floor(Math.random() * 4)
    if (type === 0) el.style.top = `${Math.random() * 15}%`
    else if (type === 1) el.style.top = `${85 + Math.random() * 15}%`
    else if (type === 2) el.style.left = `${Math.random() * 15}%`
    else el.style.left = `${85 + Math.random() * 15}%`
    el.style.top = el.style.top || `${15 + Math.random() * 70}%`
    el.style.left = el.style.left || `${15 + Math.random() * 70}%`
    el.style.fontSize = (16 + Math.random() * 8) + 'px'
    el.style.animationDelay = Math.random() * 5 + 's'
  })

  const bigF = document.querySelectorAll('.decor-container .firefly')
  if (bigF[1]) {
    const el = bigF[1]
    el.style.bottom = 'auto'
    el.style.right = 'auto'
    el.style.top = 75 + Math.random() * 20 + '%'
    el.style.left = 75 + Math.random() * 20 + '%'
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.audio-main {
  width: 100vw;
  min-height: 100vh;
  background: transparent;
  position: relative;
  overflow-x: hidden;
}

.night-header {
  position: relative;
  width: 100%;
  height: 66vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 20px;
  z-index: 2;
}

.moon {
  position: absolute;
  width: clamp(140px, 32vw, 280px);
  height: clamp(140px, 32vw, 280px);
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    #ffffff 0%,
    #faf7ee 25%,
    #f0ebe0 55%,
    #e6e0d0 100%
  );
  box-shadow: 
    0 0 60px rgba(255,252,245,0.18),
    0 0 120px rgba(210,220,240,0.12),
    0 0 200px rgba(180,200,220,0.08);
  opacity: 0.9;
  z-index: 1;
}

.night-text {
  font-family: 'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive;
  font-size: clamp(3.8rem, 14vw, 9rem);
  color: rgba(255, 255, 255, 0.92);
  font-weight: 400;
  letter-spacing: 5px;
  transform: rotate(-2.5deg);
  text-shadow: 0 0 24px rgba(255, 255, 255, 0.18), 0 0 50px rgba(200, 215, 240, 0.12);
  position: relative;
  z-index: 3;
}

.night-decor {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2;
}

.firefly-big {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgb(245, 250, 255);
  box-shadow: 0 0 22px rgba(220,235,255,0.4);
  animation: flyBig 4.2s ease-in-out infinite alternate;
}
.firefly-big:nth-child(1) {
  top: 18%;
  left: 15%;
  animation-delay: 0s;
}
.firefly-big:nth-child(2) {
  bottom: 22%;
  right: 12%;
  animation-delay: 1s;
}

.firefly-small {
  position: absolute;
  border-radius: 50%;
  background: rgb(255, 255, 250);
  box-shadow: 0 0 10px rgba(255,255,255,0.35);
  animation: flySmall 3.5s ease-in-out infinite alternate;
}

.firefly-small-card {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  box-shadow: 0 0 6px rgba(255,255,255,0.25);
  animation: flySmall 3.2s ease-in-out infinite alternate;
}

.night-decor .star-dot {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255,255,255,0.3);
  animation: starTwinkle 3.5s ease-in-out infinite alternate;
}
.night-decor .star-dot:nth-child(odd) {
  background: rgba(255,255,255,0.85);
}
.night-decor .star-dot:nth-child(even) {
  background: rgba(255,240,180,0.75);
}

.symbol {
  position: absolute;
  color: rgba(255, 255, 255, 0.88);
  font-size: 20px;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
  animation: symbolFloat 5s ease-in-out infinite alternate;
}

@keyframes flyBig {
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-18px) scale(1.08); opacity: 1; }
}
@keyframes flySmall {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-12px) scale(1.15); opacity: 1; }
}
@keyframes starTwinkle {
  0% { transform: scale(1); opacity: 0.75; }
  100% { transform: scale(1.2); opacity: 0.95; }
}
@keyframes symbolFloat {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-10px) rotate(2deg); }
}

.scroll-container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 28px 60px 10px;
  position: relative;
  z-index: 2;
}
.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.item-wrap {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.item-date {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
  cursor: pointer;
}
.date-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px rgba(255,255,255,0.45);
  margin-bottom: 8px;
}
.date-text {
  font-size: 13px;
  color: #fff;
  letter-spacing: 1px;
  opacity: 0.9;
  white-space: nowrap;
}

.item-content {
  flex: 1;
  padding: 26px;
  border-radius: 22px;
  background: transparent;
  border: none;
  box-shadow: none;
  position: relative;
  z-index: 1;
}
.content-wrapper {
  position: relative;
  z-index: 2;
  padding: 15px;
}

.decor-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.decor-container .firefly {
  position: absolute;
  border-radius: 50%;
  background: rgba(242,245,255,0.9);
  box-shadow: 0 0 18px rgba(245,248,255,0.4), 0 0 35px rgba(255,230,180,0.2);
  animation: cardFly 4s ease-in-out infinite alternate;
}
.decor-container .firefly:nth-child(1) {
  width: 38px;
  height: 38px;
  bottom: 20px;
  right: 80px;
}
.decor-container .firefly:nth-child(2) {
  width: 22px;
  height: 22px;
  animation-delay: 1.2s;
}

.decor-container .star-dot {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(255,255,255,0.3), 0 0 10px rgba(255,255,255,0.2);
  animation: cardStar 3.2s ease-in-out infinite alternate;
}
.decor-container .star-dot:nth-child(3n) {
  background: rgba(255,230,180,1);
}
.decor-container .star-dot:not(:nth-child(3n)) {
  background: rgba(255,255,255,1);
}

.decor-container .symbol {
  position: absolute;
  color: rgba(255, 255, 255, 0.92);
  font-size: 20px;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  animation: cardSymbol 5s ease-in-out infinite alternate;
}

@keyframes cardFly {
  0% { transform: translateY(0) scale(1); opacity: 0.9; }
  100% { transform: translateY(-35px) scale(1.18); opacity: 1; }
}
@keyframes cardStar {
  0% { transform: scale(1); opacity: 0.85; }
  100% { transform: scale(1.3); opacity: 1; }
}
@keyframes cardSymbol {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-12px) rotate(3deg); }
}

.content-text {
  font-size: 16px;
  color: #fff;
  line-height: 1.8;
  margin-bottom: 22px;
  letter-spacing: 0.5px;
}
.content-pics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
  cursor: pointer;
}
.pic-thumb {
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  transition: 0.25s;
}
.pic-thumb:hover { transform: scale(1.03); }
.thumb-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.content-video {
  width: 100%;
  border-radius: 14px;
  margin-bottom: 8px;
}

.content-audios {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}
.audio-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  position: relative;
  z-index: 10;
}
.audio-btn {
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #fff;
  font-size: 18px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  z-index: 11;
}

/* 进度条容器 */
.audio-progress {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
  position: relative;
  z-index: 10;
  cursor: pointer;
}
/* 进度条已播放部分 */
.audio-progress-bar {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  width: 0%;
  position: absolute;
  left: 0;
  top: 0;
}
/* 拖动圆点 */
.audio-drag-thumb {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  left: 0%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  z-index: 12;
  box-shadow: 0 0 5px rgba(255,255,255,0.5);
}
.audio-drag-thumb:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.15);
}

.audio-time {
  min-width: 90px;
  text-align: right;
  color: rgba(255,255,255,0.8);
  font-size: 12px;
  flex-shrink: 0;
}

.preview-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.95);
  z-index: 999;
  display: grid;
  place-items: center;
  padding: 20px;
}
.preview-box {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}
.preview-img {
  max-width: 100%;
  max-height: 75vh;
  border-radius: 8px;
  object-fit: contain;
}
.preview-desc {
  margin-top: 16px;
  color: #fff;
  text-align: center;
  line-height: 1.6;
}
.preview-close {
  position: absolute;
  top: -30px;
  right: -30px;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}
.preview-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28px;
  color: #fff;
  opacity: 0.8;
  cursor: pointer;
  user-select: none;
}
.preview-arrow.left { left: -40px; }
.preview-arrow.right { right: -40px; }

@media (max-width: 768px) {
  .night-header { height: 60vh; }
  .scroll-container { padding: 15px 10px 60px 10px; }
  .list-wrap { gap: 20px; }
  .item-wrap { flex-direction: column; gap: 12px; }
  .item-date { width: 100%; flex-direction: row; gap: 10px; justify-content: center; }
  .item-content { padding: 18px; border-radius: 16px; }
  .content-wrapper { padding: 10px; }
  .content-text { font-size: 15px; }
  .content-pics { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .audio-time { min-width: 70px; font-size: 11px; }
}
</style>