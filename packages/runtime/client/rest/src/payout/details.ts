import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types";

import {
  ContractIdGuard,
  AssetId,
  PayoutId,
  WithdrawalId,
  AddressBech32Guard,
  AssetsMapGuard,
} from "@marlowe.io/runtime-core";

import { PayoutStatus } from "./status.js";

export type PayoutDetails = t.TypeOf<typeof PayoutDetails>;
export const PayoutDetails = t.type({
  payoutId: PayoutId,
  contractId: ContractIdGuard,
  withdrawalId: optionFromNullable(WithdrawalId),
  role: AssetId,
  payoutValidatorAddress: AddressBech32Guard,
  status: PayoutStatus,
  assets: AssetsMapGuard,
});
