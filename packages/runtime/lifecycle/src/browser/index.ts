import {
  SupportedWalletName,
  SupportedWalletNameGuard,
  mkBrowserWallet,
} from "@marlowe.io/wallet/browser";
import * as Generic from "../generic/runtime.js";

import {
  mkFPTSRestClient,
  mkRestClient,
} from "@marlowe.io/runtime-rest-client";
import { RuntimeLifecycle } from "../api.js";
import {
  InvalidTypeError,
  strictDynamicTypeCheck,
} from "@marlowe.io/adapter/io-ts";
import * as t from "io-ts/lib/index.js";

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
  walletName: SupportedWalletName;
}

export const BrowserRuntimeLifecycleOptionsGuard: t.Type<BrowserRuntimeLifecycleOptions> =
  t.type({
    runtimeURL: t.string,
    walletName: SupportedWalletNameGuard,
  });

function mkRuntimeLifecycleArgumentDynamicTypeCheck(
  options: unknown,
  strict: boolean
): options is BrowserRuntimeLifecycleOptions {
  if (strict) {
    const result = BrowserRuntimeLifecycleOptionsGuard.decode(options);
    if (result._tag === "Left") {
      throw new InvalidTypeError(
        result.left,
        `Invalid argument to mkRuntimeLifecycle(${options})`
      );
    }
  }
  return true;
}

/**
 * Creates an instance of RuntimeLifecycle using the browser wallet.
 * @param options
 */
export async function mkRuntimeLifecycle(
  options: BrowserRuntimeLifecycleOptions
): Promise<RuntimeLifecycle>;
/**
 * Creates an instance of RuntimeLifecycle using the browser wallet.
 * @param options
 * @param strict Whether to perform runtime checking to provide helpful error messages. May have a slight negative performance impact. Default value is `true`.
 */
export async function mkRuntimeLifecycle(
  options: BrowserRuntimeLifecycleOptions,
  strict: boolean
): Promise<RuntimeLifecycle>;
export async function mkRuntimeLifecycle(
  options: unknown,
  strict: unknown = true
) {
  if (!strictDynamicTypeCheck(strict)) {
    throw new InvalidTypeError(
      [],
      `Invalid type for argument 'strict', expected boolean but got ${strict}`
    );
  }
  if (!mkRuntimeLifecycleArgumentDynamicTypeCheck(options, strict)) {
    throw new InvalidTypeError(
      [],
      `Invalid type for argument 'options', expected string but got ${options}`
    );
  }

  const { runtimeURL, walletName } = options;
  const wallet = await mkBrowserWallet(walletName);
  const deprecatedRestAPI = mkFPTSRestClient(runtimeURL);
  const restClient = mkRestClient(runtimeURL, strict);
  return Generic.mkRuntimeLifecycle(deprecatedRestAPI, restClient, wallet);
}
