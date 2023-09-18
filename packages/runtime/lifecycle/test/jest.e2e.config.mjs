import { fileURLToPath } from "node:url";
import dotenv from "dotenv"



const relative = (file) => fileURLToPath(new URL(file, import.meta.url));

const moduleNameMapper = {
  '^@marlowe.io/adapter/(.*)$': relative('../../../adapter/dist/esm/$1.js'),
  '^@marlowe.io/language\\-core\\-v1$': relative("../../../language/core/v1/dist/esm/semantics/contract/index.js"),
  '^@marlowe.io/language\\-core\\-v1/next$': relative('../../../language/core/v1/dist/esm/semantics/next/index.js'),
  '^@marlowe.io/language\\-core\\-v1/examples$': relative('../../../language/core/v1/dist/esm/examples/index.js'),
  '^@marlowe.io/wallet/nodejs/(.*)$': relative('../../../wallet/dist/esm/nodejs/$1.js'),
  '^@marlowe.io/wallet/nodejs/index.js': relative('../../../dist/esm/wallet/nodejs/index.js'),
  '^@marlowe.io/runtime\\-core/(.*)$': relative('../../core/dist/esm/$1.js'),
  '^@marlowe.io/runtime\\-rest\\-client/index.js$': relative('../../client/rest/dist/esm/index.js'),
  '^(\\.{1,2}/.*)\\.js$': '$1',
}

dotenv.config({ path: relative('../../../../env/.env.test') })

const config = {
  testEnvironment: "node",
  displayName: "Runtime Lifecycle e2e Test" ,
  extensionsToTreatAsEsm: ['.ts'],
  testRegex: ".*e2e.ts$",
  modulePaths: [relative('.')],
  moduleNameMapper,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig:"test/tsconfig.json", useESM: true, isolatedModules: true }],
  },
};

export default config;
