import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts";
import { AccountId } from "../../contract/common/payee/account.js";
import { Party } from "../../contract/common/payee/party.js";
import { Token } from "../../contract/common/token.js";
import { IsMerkleizedContinuation } from "../common/IsMerkleizedContinuation.js";
import { CaseIndex } from "../common/caseIndex.js";
import { InputDeposit } from "../../contract/when/input/deposit.js";

export type CanDeposit = t.TypeOf<typeof CanDeposit>
export const CanDeposit
    = t.type(
        { case_index: CaseIndex
        , party : Party
        , can_deposit : t.bigint
        , of_token : Token
        , into_account : AccountId
        , is_merkleized_continuation: IsMerkleizedContinuation
    })

export const toInput : (canDeposit : CanDeposit) => (InputDeposit) =
  (canDeposit) =>
    ({input_from_party: canDeposit.party
     , that_deposits: canDeposit.can_deposit
     , of_token: canDeposit.of_token
     , into_account: canDeposit.into_account})