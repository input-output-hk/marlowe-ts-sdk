
import * as t from "io-ts";

import { Assert } from "./assert.js";
import { Close } from "./close.js";
import { If } from "./if.js";
import { Let } from "./let.js";
import { Pay } from "./pay.js";
import { When } from "./when/index.js";
export { Assert } from "./assert.js";
export { Close } from "./close.js";
export { If } from "./if.js";
export { Let } from "./let.js";
export { Pay } from "./pay.js";
export { When } from "./when/index.js";


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

