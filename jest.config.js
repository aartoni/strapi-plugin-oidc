const base = {
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/(?!jose/)"],
  moduleNameMapper: { "^jose$": "<rootDir>/server/src/tests/jose.mock.js" },
};

module.exports = {
  projects: [
    {
      ...base,
      displayName: "oidc-discovery-on",
      testMatch: ["**/oidc-discovery-on.test.js"],
      setupFiles: ["<rootDir>/server/src/tests/env.discovery-on.js"],
    },
    {
      ...base,
      displayName: "oidc-discovery-off",
      testMatch: ["**/oidc-discovery-off.test.js"],
      setupFiles: ["<rootDir>/server/src/tests/env.discovery-off.js"],
    },
    {
      ...base,
      displayName: "unit",
      testMatch: ["**/__tests__/*.spec.js"],
    },
  ],
};
