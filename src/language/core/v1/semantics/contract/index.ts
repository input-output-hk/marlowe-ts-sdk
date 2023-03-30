
import * as t from "io-ts";

import { Assert } from "./assert";
import { Close } from "./close";
import { If } from "./if";
import { Let } from "./let";
import { Pay } from "./pay";
import { When } from "./when";


export type Contract =
  | Close
  | Pay
  | If
  | When
  | Let
  | Assert

export const Contract : t.Type<Contract> 
  = t.recursion('Contract', () => 
      t.union ([ Close
              , Pay
              , If
              , When
              , Let
              ,  Assert])) 

