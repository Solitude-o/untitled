import { createRouter, createWebHashHistory } from 'vue-router'
import Login from './views/Login.vue'
import AudioRoom from './views/AudioRoom.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/audio', component: AudioRoom }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router