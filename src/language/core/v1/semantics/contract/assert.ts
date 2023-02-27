import * as t from "io-ts";
import { Contract } from ".";
import { Observation } from "./common/observations";

export type Assert 
  = { assert: Observation
    , then: Contract }

export const Assert : t.Type<Assert> 
  = t.recursion('Assert', () => 
      t.type ({ assert: Observation
              , then: Contract })) 