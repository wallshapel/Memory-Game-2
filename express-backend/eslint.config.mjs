import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,ts}"],
    plugins: { sonarjs },
    rules: {
      "sonarjs/no-duplicate-string": "warn",
      "sonarjs/cognitive-complexity": "warn",
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-small-switch": "warn",
      "sonarjs/no-inverted-boolean-check": "warn",
    },
  },
]);
