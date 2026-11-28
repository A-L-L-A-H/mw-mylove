import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { flatConfigs as importXConfigs } from "eslint-plugin-import-x";
import * as importXNamespace from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

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

const jsxA11yConfig = [
  {
    ...jsxA11y.flatConfigs.recommended,
    name: "jsx-a11y/recommended",
    plugins: { "jsx-a11y": jsxA11y },
  },
  {
    name: "mw/jsx-a11y",
    rules: {
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
    },
  },
];

const typedParserOptions = {
  projectService: {
    allowDefaultProject: ["*.ts", "scripts/*.ts", "*.mjs"],
  },
  tsconfigRootDir: process.cwd(),
};

const reactConfig = [
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    name: c.name || "typescript-eslint/recommended-type-checked",
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ...c.languageOptions,
      parserOptions: {
        ...c.languageOptions?.parserOptions,
        ...typedParserOptions,
      },
    },
  })),
  {
    name: "mw/react",
    files: ["**/*.ts", "**/*.tsx", "**/*.jsx"],
    settings: {
      react: { version: "19" },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
];

const typescriptConfig = [
  ...tseslint.configs.strictTypeChecked.map((c) => ({
    ...c,
    name: c.name || "typescript-eslint/strict-type-checked",
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ...c.languageOptions,
      parserOptions: {
        ...c.languageOptions?.parserOptions,
        ...typedParserOptions,
      },
    },
  })),
  {
    name: "mw/typescript",
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
    },
  },
];

export const base = [...baseConfig, ...importConfig, ...unicornConfig];
export const react = [...base, ...jsxA11yConfig, ...reactConfig];
export const typescript = [...base, ...typescriptConfig];
export const all = [
  ...react,
  ...typescriptConfig,
  {
    ...prettier,
    rules: {
      ...prettier.rules,
      "max-len": [
        "error",
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },
];

export default all;
