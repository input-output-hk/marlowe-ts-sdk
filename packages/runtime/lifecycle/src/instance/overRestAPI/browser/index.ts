import {
  SupportedWallet,
  createBrowserWallet,
} from "@marlowe.io/wallet/browser";
import * as Generic from "../index.js";

import { mkRestClient } from "@marlowe.io/runtime-rest-client";

/**
 * Options for creating a RuntimeLifecycle instance using the browser wallet.
 */
export interface BrowserRuntimeLifecycleOptions {
  // DISCUSSION: should we pass a Map of urls instead? Ideally we could distinguish between
  //             preprod and preview, but the CIP30 standard doesn't allow that
  /**
   * The URL of an available Marlowe runtime.
   */
  runtimeURL: string;
  /**
   * The name of the wallet to connect to.
   */
  walletName: SupportedWallet;
}

/**
 * Creates an instance of RuntimeLifecycle using the browser wallet.
 * @param options
 */
export async function mkRuntimeLifecycle({
  runtimeURL,
  walletName,
}: BrowserRuntimeLifecycleOptions) {
  const wallet = await createBrowserWallet(walletName);
  const restClient = mkRestClient(runtimeURL);
  return Generic.mkRuntimeLifecycle(restClient, wallet);
}
