import {
  WalletAPI
} from "@marlowe.io/wallet";
import * as Generic from "./generic/runtime.js";
import { mkFPTSRestClient } from "@marlowe.io/runtime-rest-client";

export * as Browser from "./browser/index.js";
export * as NodeJS from "./browser/index.js";

/**
 * Options for creating a RuntimeLifecycle instance.
 */
export interface RuntimeLifecycleOptions {
  /**
   * The URL of an available Marlowe runtime.
   */
  runtimeURL: string;
  /**
   * The name of the wallet to connect to.
   */
  wallet: WalletAPI;
}

/**
 * Creates an instance of RuntimeLifecycle.
 */
export function mkRuntimeLifecycle({
  runtimeURL,
  wallet,
}: RuntimeLifecycleOptions) {
  const restClient = mkFPTSRestClient(runtimeURL);
  return Generic.mkRuntimeLifecycle(restClient, wallet);
}
