import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      exclude: [
        "src/interfaces/**",
        "src/types/**",
        "src/services/*.ts",
        "src/repositories/*.ts", 
        "src/models/*.ts",
        "src/config/db.ts",
        "src/index.ts",
        "**/*.d.ts",
        "vitest.config.ts",
        "eslint.config.mjs",
        "dist/**"
      ],
    },
  },
});
