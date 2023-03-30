import * as t from "io-ts";

import { Choice } from "./choice";
import { Deposit } from "./deposit";
import { Notify } from "./notify";

export type Action =
  | Deposit
  | Choice
  | Notify

export const Action : t.Type<Action> 
  = t.recursion('Action', () => 
      t.union ([ Deposit
               , Choice
               , Notify])) 






