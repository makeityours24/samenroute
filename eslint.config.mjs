import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "eslint.config.mjs",
      "next.config.ts",
      "postcss.config.mjs",
      "playwright.config.ts",
      "vitest.config.ts",
      "prisma.config.ts"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
);
