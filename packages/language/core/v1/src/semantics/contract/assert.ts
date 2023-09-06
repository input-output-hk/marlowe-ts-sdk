import * as t from "io-ts/lib/index.js";
import { Contract } from "./index.js";
import { Observation } from "./common/observations.js";

export type Assert = { assert: Observation; then: Contract };

export const Assert: t.Type<Assert> = t.recursion("Assert", () =>
  t.type({ assert: Observation, then: Contract })
);
