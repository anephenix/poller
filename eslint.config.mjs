import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["src/*.{ts}", "test/*.{ts}", "scripts/*.{ts}"]},
  {languageOptions: { globals: { ...globals.node } }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
        ignores: ["dist/*", "coverage/*"]
  }
];