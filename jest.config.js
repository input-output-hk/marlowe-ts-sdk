module.exports = {
  testEnvironment: "node",
  projects: [
    "<rootDir>/packages/language/core/v1/test/jest.unit.config.mjs",
    "<rootDir>/packages/language/examples/test/jest.unit.config.mjs",
    "<rootDir>/packages/wallet/test/jest.unit.config.mjs",
    "<rootDir>/packages/runtime/client/rest/test/jest.e2e.config.mjs",
    "<rootDir>/packages/runtime/lifecycle/test/jest.e2e.config.mjs",
  ],
};
