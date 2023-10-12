import * as t from "io-ts/lib/index.js";

import { TxStatus } from "../contract/transaction/status.js";

import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BlockHeaderGuard, WithdrawalId } from "@marlowe.io/runtime-core";
import { PayoutHeader } from "../payout/header.js";

export type WithdrawalDetails = t.TypeOf<typeof WithdrawalDetails>;
export const WithdrawalDetails = t.type({
  withdrawalId: WithdrawalId,
  status: TxStatus,
  block: optionFromNullable(BlockHeaderGuard),
  payouts: t.array(PayoutHeader),
});
