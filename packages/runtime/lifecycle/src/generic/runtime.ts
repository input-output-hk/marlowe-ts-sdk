import { RuntimeLifecycle } from "../api.js";
import { WalletAPI } from "@marlowe.io/wallet/api";

import { FPTSRestAPI } from "@marlowe.io/runtime-rest-client";

import { mkPayoutLifecycle } from "./payouts.js";
import { mkContractLifecycle } from "./contracts.js";

export function mkRuntimeLifecycle(
  restAPI: FPTSRestAPI,
  wallet: WalletAPI
): RuntimeLifecycle {
  return {
    wallet: wallet,
    contracts: mkContractLifecycle(wallet, restAPI),
    payouts: mkPayoutLifecycle(wallet, restAPI),
  };
}
