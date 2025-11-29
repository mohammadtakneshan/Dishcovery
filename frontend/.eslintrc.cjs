module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: "latest",
    ecmaFeatures: { jsx: true },
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "react-native"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native/all",
  ],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react-native/no-color-literals": "off",
    "react-native/sort-styles": "off",
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "import/no-unresolved": "off",
  },
};
