import * as t from "io-ts/lib/index.js";
import { AccountId } from "./common/payee/account.js";
import { Contract } from "./index.js";
import { Payee } from "./common/payee/index.js";
import { Token } from "./common/token.js";
import { Value } from "./common/value.js";

export const pay = (
  pay: Value,
  token: Token,
  from_account: AccountId,
  to: Payee,
  then: Contract
) => ({
  pay: pay,
  token: token,
  from_account: from_account,
  to: to,
  then: then,
});

export type Pay = {
  pay: Value;
  token: Token;
  from_account: AccountId;
  to: Payee;
  then: Contract;
};

export const Pay = t.recursion<Pay>("Pay", () =>
  t.type({
    pay: Value,
    token: Token,
    from_account: AccountId,
    to: Payee,
    then: Contract,
  })
);
