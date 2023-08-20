import { fileURLToPath } from "node:url";
import dotenv from "dotenv"



const relative = (file) => fileURLToPath(new URL(file, import.meta.url));

const moduleNameMapper = {
  '^@marlowe.io/adapter/(.*)$': relative('../../adapter/dist/$1.js'),
  '^@marlowe.io/core/cardano/(.*)$': relative('../../core/dist/cardano/$1.js'),
  '^@marlowe.io/language\\-core\\-v1$': relative("../../language/core/v1/dist/semantics/contract/index.js"),
  '^@marlowe.io/language\\-core\\-v1/next$': relative('../../language/core/v1/dist/semantics/next/index.js'),
  '^@marlowe.io/language\\-core\\-v1/examples$': relative('../../language/core/v1/dist/examples/index.js'),
  '^@marlowe.io/runtime/restClient': relative('../dist/instance/overRestAPI/restClient/index.js'),
  '^@marlowe.io/runtime/wallet/nodejs/index.js': relative('../dist/wallet/nodejs/index.js'),
  '^(\\.{1,2}/.*)\\.js$': '$1',
}

dotenv.config({ path: relative('./env/.env.test') })

const config = {
  testEnvironment: "node",
  displayName: "runtime-e2e",
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