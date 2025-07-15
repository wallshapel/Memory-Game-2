import { createRouter, createWebHistory } from 'vue-router'
import MainMenu from '../views/MainMenu.vue'
import ConfigView from '../views/ConfigView.vue'
import ProfileConfig from '../views/ProfileConfig.vue'
import GamePlayConfig from '../views/GamePlayConfig.vue'
import CardsConfig from '../views/CardsConfig.vue'
import ControlsConfig from '../views/ControlsConfig.vue'
import SoundConfig from '../views/SoundConfig.vue'
import GameView from '../views/GameView.vue'

const routes = [
  { path: '/', component: MainMenu },
  { path: '/config', component: ConfigView },
  { path: '/config/profile', component: ProfileConfig },
  { path: '/config/gameplay', component: GamePlayConfig },
  { path: '/config/cards', component: CardsConfig },
  { path: '/config/controls', component: ControlsConfig },
  { path: '/config/sound', component: SoundConfig },
  { path: '/game', component: GameView }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
