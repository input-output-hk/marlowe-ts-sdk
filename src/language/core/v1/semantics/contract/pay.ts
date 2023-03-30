import * as t from "io-ts"
import { AccountId } from "./common/payee/account";
import { Contract } from ".";
import { Payee } from "./common/payee/index.";
import { Token } from "./common/token";
import { Value } from "./common/value";

export const pay = (
    pay: Value
  , token: Token
  , from_account: AccountId
  , to: Payee
  , then: Contract) => ({pay:pay, token: token, from_account: from_account, to: to, then: then})

export type Pay = {
    pay: Value;
    token: Token;
    from_account: AccountId;
    to: Payee;
    then: Contract;
  }
  
export const Pay 
= t.recursion<Pay>('Pay', () => 
        t.type({ pay: Value
            , token: Token
            , from_account: AccountId
            , to: Payee
            , then: Contract
            }))
  