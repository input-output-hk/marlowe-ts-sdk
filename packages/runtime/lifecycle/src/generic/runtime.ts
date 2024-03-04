import { RuntimeLifecycle } from "../api.js";
import { WalletAPI } from "@marlowe.io/wallet/api";

import { FPTSRestAPI, RestClient } from "@marlowe.io/runtime-rest-client";

import { mkPayoutLifecycle } from "./payouts.js";
import { mkContractLifecycle } from "./contracts.js";
import { mkApplicableActionsAPI } from "./applicable-actions.js";

export function mkRuntimeLifecycle(
  deprecatedRestAPI: FPTSRestAPI,
  restClient: RestClient,
  wallet: WalletAPI
): RuntimeLifecycle {
  const contracts = mkContractLifecycle(wallet, deprecatedRestAPI, restClient);
  return {
    wallet: wallet,
    restClient,
    contracts,
    payouts: mkPayoutLifecycle(wallet, deprecatedRestAPI, restClient),
    applicableActions: mkApplicableActionsAPI(restClient, wallet, contracts),
  };
}
