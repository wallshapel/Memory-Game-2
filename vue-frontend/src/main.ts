// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";
import { router } from "./router";
import type { Component } from "vue";

import { createPinia } from "pinia";

const app = createApp(App as Component);

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
});

app.use(createPinia());
app.use(vuetify);
app.use(router);
app.mount("#app");
