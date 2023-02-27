import * as t from "io-ts";
import { AccountId } from "../../common/payee/account";
import { Party } from "../../common/payee/party";
import { Token } from "../../common/token";
import { Value } from "../../common/value";

export type InputDeposit = t.TypeOf<typeof InputDeposit>
export const InputDeposit  
    = t.type ({ input_from_party: Party
                , that_deposits: Value
                , of_token: Token
                , into_account: AccountId })