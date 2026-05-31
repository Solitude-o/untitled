<template>
  <div class="date-card glass">
    <div class="year">{{ today.year }}</div>
    <div class="date">{{ today.month }}月{{ today.day }}日</div>
    <div class="week">{{ today.week }}</div>
  </div>
</template>

<script setup>
const today = {}
const d = new Date()
today.year = d.getFullYear()
today.month = d.getMonth() + 1
today.day = d.getDate()
const weekArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
today.week = weekArr[d.getDay()]
</script>

<style scoped>
.date-card {
  padding: 20px 30px;
  text-align: center;
  color: var(--green-light);
  margin-bottom: 30px;
  min-width: 220px;
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
}
.year {
  font-size: 14px;
  opacity: 0.8;
}
.date {
  font-size: clamp(20px, 5vw, 24px);
  font-weight: bold;
  margin: 6px 0;
}
.week {
  font-size: clamp(14px, 4vw, 16px);
  color: var(--green-primary);
}

@media (max-width: 768px) {
  .date-card {
    padding: 15px 20px;
  }
}
</style>