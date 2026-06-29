import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";
import pluginCypress from "eslint-plugin-cypress";
import js from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  js.configs.recommended,
  {
    ignores: [
      "**/data/",
      "**/dist/",
      "**/.yalc/",
      "**/.strapi/",
      "**/generated/",
    ],
  },
  {
    extends: [tseslint.configs.recommended],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
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
      curly: "error",
    },
  },
  {
    files: ["cypress/**/*.js"],
    extends: [pluginCypress.configs.recommended],
  },
  eslintPluginPrettierRecommended,
]);
