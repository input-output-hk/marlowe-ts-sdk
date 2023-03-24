import * as t from "io-ts";
import { AccountId } from "../../common/payee/account";
import { Party } from "../../common/payee/party";
import { Token } from "../../common/token";

export type InputDeposit = t.TypeOf<typeof InputDeposit>
export const InputDeposit  
    = t.type ({ input_from_party: Party
                , that_deposits: t.bigint
                , of_token: Token
                , into_account: AccountId })