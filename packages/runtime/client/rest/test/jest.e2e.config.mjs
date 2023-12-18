import { fileURLToPath } from "node:url";
import dotenv from "dotenv"



const relative = (file) => fileURLToPath(new URL(file, import.meta.url));

const moduleNameMapper = {
  '^(\\.{1,2}/.*)\\.js$': '$1',
}

dotenv.config({ path: relative('../../../../../env/.env.test') })

const config = {
  testEnvironment: "node",
  displayName: "Runtime Rest Client e2e Tests",
  extensionsToTreatAsEsm: ['.ts'],
  testRegex: ".*e2e.ts$",
  modulePaths: [relative('.')],
  moduleNameMapper,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig:"test/tsconfig.json", useESM: true, isolatedModules: true }],
  },
};

export default config;