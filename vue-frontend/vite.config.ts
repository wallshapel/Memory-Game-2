// vite.config.ts
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  test: {
    exclude: [
      "node_modules",
      "dist",
      "**/interfaces/**",
      "**/main.ts",
      "**/App.vue",
      "**/router/**",
      "**/*.d.ts",
    ],
    coverage: {
      reporter: ["text", "html", "lcov"],
      exclude: [
        "src/interfaces/**",
        "src/constants/**",
        "src/main.ts",
        "src/App.vue",
        "src/router/**",
        "**/*.d.ts",
        "vite.config.ts"
      ],
    },
  },
});
