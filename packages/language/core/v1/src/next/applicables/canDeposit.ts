import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";
import { Token } from "../../token.js";
import { IsMerkleizedContinuation } from "../common/IsMerkleizedContinuation.js";
import { CaseIndex } from "../common/caseIndex.js";
import { InputDeposit } from "../../inputs.js";
import { Party } from "../../participants.js";
import { AccountId } from "../../payee.js";

export type CanDeposit = t.TypeOf<typeof CanDeposit>;
export const CanDeposit = t.type({
  case_index: CaseIndex,
  party: Party,
  can_deposit: t.bigint,
  of_token: Token,
  into_account: AccountId,
  is_merkleized_continuation: IsMerkleizedContinuation,
});

export const toInput: (canDeposit: CanDeposit) => InputDeposit = (
  canDeposit
) => ({
  input_from_party: canDeposit.party,
  that_deposits: canDeposit.can_deposit,
  of_token: canDeposit.of_token,
  into_account: canDeposit.into_account,
});
