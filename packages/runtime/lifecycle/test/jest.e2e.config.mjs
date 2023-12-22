import { fileURLToPath } from "node:url";
import dotenv from "dotenv"

const relative = (file) => fileURLToPath(new URL(file, import.meta.url));

const moduleNameMapper = {
  '^(\\.{1,2}/.*)\\.js$': '$1',
}

dotenv.config({ path: relative('../../../../env/.env.test') })

const config = {
  testEnvironment: "node",
  displayName: "Runtime Lifecycle e2e Test" ,
  extensionsToTreatAsEsm: ['.ts'],
  testRegex: ".*e2e.spec.ts$",
  // modulePaths: [relative('.')],
  moduleNameMapper,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig:relative("tsconfig.json"), useESM: true, isolatedModules: true }],
  },
};

export default config;
