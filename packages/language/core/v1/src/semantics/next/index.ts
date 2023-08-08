import * as t from "io-ts";
import { ApplicableInputs } from "./applicables/index.js";

export type Next = t.TypeOf<typeof Next>
export const Next
  = t.type(
      { can_reduce: t.boolean
      , applicable_inputs: ApplicableInputs
    })