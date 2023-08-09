import { fileURLToPath } from "node:url";

const relative = (file) => fileURLToPath(new URL(file, import.meta.url));

const moduleNameMapper = {
  '^@marlowe/legacy-adapter/(.*)$': relative('../../legacy-adapter/dist/$1.js'),
  '^@marlowe/language\\-core\\-v1$': relative("../../language/core/v1/dist/semantics/contract/index.js"),
  '^@marlowe/language\\-core\\-v1/next$': relative('../../language/core/v1/dist/semantics/next/index.js'),
  '^@marlowe/language\\-core\\-v1/examples$': relative('../../language/core/v1/dist/examples/index.js'),
  '^@marlowe/legacy\\-runtime/restAPI': relative('../dist/restAPI.js'),
  '^(\\.{1,2}/.*)\\.js$': '$1',
}


const config = {
  testEnvironment: "node",
  displayName: "legacy-runtime-e2e",
  extensionsToTreatAsEsm: ['.ts'],
  testRegex: ".*e2e.ts$",
  // testRegex: "swap.ada.token.spec.e2e.ts$",
  modulePaths: [relative('.')],
  moduleNameMapper,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig:"test/tsconfig.json", useESM: true, isolatedModules: true }],
  },
};

export default config;