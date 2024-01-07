/**
 * Create a {@link api.WalletAPI} from a Lucid wallet instance that can work both in the
 * backend (Node.js/Deno) and in the browser
  ```
    import { mkLucidWallet } from "@marlowe.io/wallet/lucid";
    import { Lucid, Blockfrost } from "lucid-cardano";

    const lucid = await Lucid.new(
      new Blockfrost(config.blockfrostUrl, config.blockfrostProjectId),
      config.network
    );
    lucid.selectWalletFromSeed(config.seedPhrase);

    const wallet = mkLucidWallet(lucid);
  ```
 * @packageDocumentation
 */

import { Lucid } from "lucid-cardano";

import { WalletAPI, mkLucidWallet } from "@marlowe.io/wallet";

import { RestClient } from "@marlowe.io/runtime-rest-client";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { logInfo, logWarning } from "../logging.js";

export * as Provision from "./provisionning.js";
import * as Provision from "./provisionning.js";

export type LucidExtendedDI = { lucid: Lucid; wallet: WalletAPI };
export type TxHashSubmitted = string;

export const logWalletInfo = async (
  walletName: string,
  wallet: WalletTestAPI
) => {
  const address = await wallet.getChangeAddress();
  const lovelaces = await wallet.getLovelaces();
  const tokens = await wallet.getTokens();
  logInfo(`Wallet ${walletName}`);
  logInfo(` - Address : ${address}`);
  logInfo(` - Lovelaces : ${lovelaces}`);
  logInfo(` - Tokens : ${MarloweJSON.stringify(tokens)}`);
};

export interface WalletTestAPI extends WalletAPI {
  provision(request: Provision.Request): Promise<Provision.Response>;
  waitRuntimeSyncingTillCurrentWalletTip(client: RestClient): Promise<void>;
}

const isRuntimeChainMoreAdvancedThan =
  (client: RestClient, aSlotNo: bigint) => () =>
    client.getRuntimeStatus().then((status) => {
      if (status.tips.runtimeChain.blockHeader.slotNo >= aSlotNo) {
        return true;
      } else {
        logWarning(
          `Waiting Runtime to be Synced (Delta ${
            status.tips.runtimeChain.blockHeader.slotNo - aSlotNo
          }) `
        );
        return false;
      }
    });

const waitRuntimeSyncingTillCurrentWalletTip =
  (di: LucidExtendedDI) =>
  async (client: RestClient): Promise<void> => {
    const { lucid } = di;
    const currentLucidSlot = BigInt(lucid.currentSlot());
    await waitForPredicatePromise(
      isRuntimeChainMoreAdvancedThan(client, currentLucidSlot)
    );
    return sleep(5);
  };

function sleep(secondes: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, secondes * 1_000));
}

async function waitForPredicatePromise(
  predicate: () => Promise<boolean>,
  interval: number = 3_000
): Promise<void> {
  if (await predicate()) {
    // Predicate is already true, no need to wait
    return;
  }
  // Use a promise to wait for the specified interval
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Wait for the specified interval
  await wait(interval);

  // Recursive call to continue checking the predicate
  await waitForPredicatePromise(predicate, interval);
}

export function mkLucidWalletTest(lucidWallet: Lucid): WalletTestAPI {
  const di = { lucid: lucidWallet, wallet: mkLucidWallet(lucidWallet) };
  return {
    ...di.wallet,
    ...{ provision: Provision.provision(di) },
    ...{
      waitRuntimeSyncingTillCurrentWalletTip:
        waitRuntimeSyncingTillCurrentWalletTip(di),
    },
  };
}
