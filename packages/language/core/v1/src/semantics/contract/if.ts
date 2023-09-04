import * as t from "io-ts/lib/index.js";
import { Contract } from "./index.js";
import { Observation } from "./common/observations.js";

export type If = { if: Observation; then: Contract; else: Contract };

export const If: t.Type<If> = t.recursion("If", () =>
  t.type({ if: Observation, then: Contract, else: Contract })
);
