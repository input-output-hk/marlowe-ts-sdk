import * as t from "io-ts";
import { Contract } from "./index.js";
import { ValueId, Value } from "./common/value.js";

export type Let
  = { let: ValueId
    , be: Value
    , then: Contract }

export const Let : t.Type<Let>
  = t.recursion('Let', () =>
      t.type ({ let: ValueId
              , be: Value
              , then: Contract }))