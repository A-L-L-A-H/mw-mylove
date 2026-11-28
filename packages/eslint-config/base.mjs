import js from "@eslint/js";
import { flatConfigs as importXConfigs } from "eslint-plugin-import-x";
import * as importXNamespace from "eslint-plugin-import-x";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

void importXNamespace;

const baseConfig = [
  {
    ...js.configs.recommended,
    name: "js/recommended",
  },
  {
    name: "mw/base",
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
        ...globals.node,
      },
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "max-len": [
        "error",
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreRegExpLiterals: true,
        },
      ],
      complexity: ["error", 10],
    },
  },
];

const importConfig = [
  {
    ...importXConfigs.recommended,
    name: "import-x/recommended",
    plugins: { "import-x": importXNamespace },
  },
  {
    name: "mw/import",
    rules: {
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            { pattern: "@/**", group: "internal" },
            { pattern: "@mw/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: [],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/no-unresolved": "error",
      "import-x/no-named-as-default": "error",
      "import-x/no-named-as-default-member": "error",
      "import-x/no-duplicates": "error",
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/*.config.mjs",
            "**/eslint.config.mjs",
          ],
        },
      ],
    },
  },
];

const unicornConfig = [
  (() => {
    const config = { ...unicorn.configs.recommended };
    delete config.env;
    delete config.parserOptions;
    delete config.plugins;
    config.name = "unicorn/recommended";
    config.plugins = { unicorn };
    config.languageOptions = {
      globals: { ...globals.es2024 },
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    };
    return config;
  })(),
  {
    name: "mw/unicorn",
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-null": "off",
      "unicorn/prefer-node-protocol": "error",
    },
  },
];

export default [...baseConfig, ...importConfig, ...unicornConfig];
