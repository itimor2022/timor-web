module.exports = {
  extends: ["next", "turbo", "prettier", "@typescript-eslint/parser"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "jsx-a11/alt-text": "off",
    "@next/next/no-img-element": "off"
  },
};
