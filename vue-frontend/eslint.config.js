import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";
import vueParser from "vue-eslint-parser";

export default defineConfig([
  // Pure JS
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // TypeScript base rules
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  // Base configuration for Vue
  pluginVue.configs["flat/essential"],

  // TypeScript in .ts and .tsx
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        sourceType: "module",
      },
    },
  },

  // Vue: use vue-eslint-parser + typescript-eslint internally
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.eslint.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
  },

  // JSON files
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.json5"],
    plugins: { json },
    language: "json/json5",
    extends: ["json/recommended"],
  },
]);
