module.exports = {
  
  projects: [
    { 
      displayName: "e2e test",
      testMatch: ["./**/*.spec.e2e.ts"],
      runner: "jest-serial-runner",
      extensionsToTreatAsEsm: ['.ts'],
      preset: 'ts-jest/presets/default-esm',
      moduleNameMapper: {
        '@adapter/(.*)': '<rootDir>/src/adapter/$1',
        '@runtime/(.*)': '<rootDir>/src/runtime/$1',
        '@language/(.*)': '<rootDir>/src/language/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      globalSetup: "./dotenv/dotenv-test.js",
      setupFilesAfterEnv: ["./jest.config.console.js"],
      transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.m?[tj]sx?$': [
          'ts-jest',
          {
            useESM: true,
          },
        ],
      },
    },
    { 
      displayName: "unit test",
      testMatch: ["./**/*.spec.ts"],
      extensionsToTreatAsEsm: ['.ts'],
      preset: 'ts-jest/presets/default-esm',
      moduleNameMapper: {
        '@adapter/(.*)': '<rootDir>/src/adapter/$1',
        '@runtime/(.*)': '<rootDir>/src/runtime/$1',
        '@language/(.*)': '<rootDir>/src/language/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      globalSetup: "./dotenv/dotenv-test.js",
      setupFilesAfterEnv: ["./jest.config.console.js"],
      transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.m?[tj]sx?$': [
          'ts-jest',
          {
            useESM: true,
          },
        ],
      },
    }
  ]
};

