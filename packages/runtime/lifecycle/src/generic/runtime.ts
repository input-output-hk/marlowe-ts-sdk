import { RuntimeLifecycle } from "../api.js";
import { WalletAPI } from "@marlowe.io/wallet/api";

import { FPTSRestAPI, RestClient } from "@marlowe.io/runtime-rest-client";

import { mkPayoutLifecycle } from "./payouts.js";
import { mkContractLifecycle } from "./contracts.js";
import { mkApplicableInputsAPI } from "./applicable-inputs.js";

export function mkRuntimeLifecycle(
  deprecatedRestAPI: FPTSRestAPI,
  restClient: RestClient,
  wallet: WalletAPI
): RuntimeLifecycle {
  return {
    wallet: wallet,
    restClient,
    contracts: mkContractLifecycle(wallet, deprecatedRestAPI, restClient),
    payouts: mkPayoutLifecycle(wallet, deprecatedRestAPI, restClient),
    applicableInputs: mkApplicableInputsAPI(restClient, wallet),
  };
}
