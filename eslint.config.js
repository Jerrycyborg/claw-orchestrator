import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "scripts/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        URL: "readonly",
        setTimeout: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  },
  {
    ignores: ["node_modules/**", ".orchestrator/**", ".ai/**"]
  }
];
