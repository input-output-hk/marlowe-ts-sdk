import * as t from "io-ts";
import { Contract } from ".";
import { Observation } from "./common/observations";

export type If 
  = { if: Observation
    , then: Contract
    , else: Contract }

export const If : t.Type<If> 
    = t.recursion('If', () => 
        t.type ({ if: Observation
                , then: Contract
                , else: Contract })) 