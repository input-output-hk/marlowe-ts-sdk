
import * as t from "io-ts";

import { Assert } from "./assert.js";
import { Close } from "./close.js";
import { If } from "./if.js";
import { Let } from "./let.js";
import { Pay } from "./pay.js";
import { When } from "./when/index.js";
export { Assert } from "./assert.js";
export { Close, close } from "./close.js";
export { If } from "./if.js";
export { Let } from "./let.js";
export { Pay } from "./pay.js";
export { When, datetoTimeout } from "./when/index.js";
export { Action } from "./when/action/index.js";
export { inputNotify } from "./when/input/notify.js";
export { Input, BuiltinByteString } from "./when/input/index.js";
export { Value } from "./common/value.js";
export { Accounts } from "./common/payee/account.js";
export { Token, TokenName, tokenToString, token } from './common/token.js';
export { TokenValue, tokenValue, adaValue } from './common/tokenValue.js';
export { PolicyId } from './common/policyId.js';

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

