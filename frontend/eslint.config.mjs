import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    // Landing page is a faithful port of a design prototype with lots of
    // editorial copy (apostrophes, quotes) inlined as JSX text.
    files: ["src/components/landing/**/*.tsx", "src/components/docs/**/*.tsx"],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Docs bodies are hand-authored prose data; internal links use plain <a>
    // (full-reload nav between static doc pages is fine).
    files: ["src/components/docs/**/*.tsx"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
