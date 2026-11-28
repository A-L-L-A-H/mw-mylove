import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import base from "./base.mjs";

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

const reactConfig = [
  {
    name: "mw/react",
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

export default [...base, ...jsxA11yConfig, ...reactConfig];
