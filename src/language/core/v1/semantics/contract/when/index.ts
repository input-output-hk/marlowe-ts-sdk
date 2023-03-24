import * as t from "io-ts";
import { Action } from "./action";
import { Contract } from "..";
import { pipe } from "fp-ts/lib/function";
import getUnixTime from 'date-fns/getUnixTime'


export type When 
  = { when: Case[]
    , timeout: Timeout
    , timeout_continuation: Contract }

export const When : t.Type<When> 
  = t.recursion('When', () => 
      t.type ({ when: t.array(Case)
              , timeout: Timeout
              , timeout_continuation: Contract })) 

export type Case 
  = { case: Action
    , then: Contract }

export const Case : t.Type<Case> 
  = t.recursion('Case', () => 
      t.type ({ case: Action
              , then: Contract })) 

export type Timeout = t.TypeOf<typeof Timeout>
export const Timeout = t.bigint 

export const datetoTimeout = (date:Date):Timeout => pipe(date,getUnixTime,(a) => a * 1_000,BigInt)