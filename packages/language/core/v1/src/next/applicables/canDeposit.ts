import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";
import { TokenGuard } from "../../token.js";
import { IsMerkleizedContinuation } from "../common/IsMerkleizedContinuation.js";
import { CaseIndex } from "../common/caseIndex.js";
import { IDeposit, IDepositGuard } from "../../inputs.js";
import { PartyGuard } from "../../participants.js";
import { AccountIdGuard } from "../../payee.js";

export type CanDeposit = t.TypeOf<typeof CanDeposit>;
export const CanDeposit = t.type({
  case_index: CaseIndex,
  party: PartyGuard,
  can_deposit: t.bigint,
  of_token: TokenGuard,
  into_account: AccountIdGuard,
  is_merkleized_continuation: IsMerkleizedContinuation,
});

export const toInput: (canDeposit: CanDeposit) => IDeposit = (canDeposit) => ({
  input_from_party: canDeposit.party,
  that_deposits: canDeposit.can_deposit,
  of_token: canDeposit.of_token,
  into_account: canDeposit.into_account,
});
