import * as t from "io-ts";

import { Choice } from "./choice.js";
import { Deposit } from "./deposit.js";
import { Notify } from "./notify.js";

export type Action =
  | Deposit
  | Choice
  | Notify

export const Action : t.Type<Action>
  = t.recursion('Action', () =>
      t.union ([ Deposit
               , Choice
               , Notify]))






