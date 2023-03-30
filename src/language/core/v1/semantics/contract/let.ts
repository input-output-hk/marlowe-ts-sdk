import * as t from "io-ts";
import { Contract } from ".";
import { ValueId, Value } from "./common/value";

export type Let 
  = { let: ValueId
    , be: Value
    , then: Contract }

export const Let : t.Type<Let> 
  = t.recursion('Let', () => 
      t.type ({ let: ValueId
              , be: Value
              , then: Contract })) 