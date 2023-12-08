/**
 * ```
   import { mkBrowserWallet, getInstalledWalletExtensions } from "@marlowe.io/wallet";
   import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle";

   const runtimeURL = "<url of the Marlowe runtime>";
   const installedWalletExtensions = getInstalledWalletExtensions();

   const wallet = await mkBrowserWallet(installedWalletExtensions[0].name);
   const runtime = mkRuntimeLifecycle({
      runtimeURL,
      wallet,
   });
 ```
 * @packageDocumentation
 */

import { WalletAPI } from "@marlowe.io/wallet";
import * as Generic from "./generic/runtime.js";
import { mkFPTSRestClient, mkRestClient } from "@marlowe.io/runtime-rest-client";

export * as Browser from "./browser/index.js";

/**
 * Options for creating a RuntimeLifecycle instance.
 */
export interface RuntimeLifecycleOptions {
  /**
   * The URL of an available Marlowe runtime.
   */
  runtimeURL: string;
  /**
   * The wallet instance to connect to.
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
  const deprecatedRestAPI = mkFPTSRestClient(runtimeURL);
  const restClient = mkRestClient(runtimeURL);
  return Generic.mkRuntimeLifecycle(deprecatedRestAPI,restClient, wallet);
}
