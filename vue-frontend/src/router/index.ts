// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "../views/WelcomeView.vue";
import MainMenu from "../views/MainMenu.vue";
import ConfigView from "../views/ConfigView.vue";
import ProfileConfig from "../views/ProfileConfig.vue";
import GamePlayConfig from "../views/GamePlayConfig.vue";
import CardsConfig from "../views/CardsConfig.vue";
import ControlsConfig from "../views/ControlsConfig.vue";
import SoundConfig from "../views/SoundConfig.vue";
import GameView from "../views/GameView.vue";
import RecordsView from "../views/RecordsView.vue";
import { useAudioStore } from "../store/audioStore";

const routes = [
  { path: "/", component: WelcomeView },
  { path: "/menu", component: MainMenu },
  { path: "/config", component: ConfigView },
  { path: "/config/profile", component: ProfileConfig },
  { path: "/config/gameplay", component: GamePlayConfig },
  { path: "/config/cards", component: CardsConfig },
  { path: "/config/controls", component: ControlsConfig },
  { path: "/config/sound", component: SoundConfig },
  { path: "/game", component: GameView },
  { path: "/records", component: RecordsView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const audioStore = useAudioStore();

  const leavingConfig =
    from.path.startsWith("/config") && !to.path.startsWith("/config");
  const enteringSound = to.path === "/config/sound";
  const goingToConfigRoot = to.path === "/config";
  const comingFromSound = from.path === "/config/sound";

  if (leavingConfig && !enteringSound) audioStore.stopMusic();

  if (goingToConfigRoot && !comingFromSound && !audioStore.bgMusicInstance)
    audioStore.playMenuMusicLoop();

  next();
});
