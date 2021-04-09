module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["plugin:cypress/recommended", "plugin:prettier/recommended"],
  plugins: ["cypress", "prettier"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
  },
};
