import { defineConfig } from "eslint/config";
import globals from "globals";
import pluginCypress from "eslint-plugin-cypress";
import js from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  js.configs.recommended,
  {
    ignores: ["**/data/", "**/dist/", "**/.yalc/", "**/.strapi/"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        strapi: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-param-reassign": "error",
      "no-throw-literal": "error",
      curly: "error",
    },
  },
  {
    files: ["cypress/**/*.js"],
    extends: [pluginCypress.configs.recommended],
  },
  eslintPluginPrettierRecommended,
]);
