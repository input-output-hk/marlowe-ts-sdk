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

import {
  C,
  Lucid,
  toUnit,
  fromText,
  NativeScript,
  Network,
  Tx,
  Script,
  Assets as LucidAssets,
} from "lucid-cardano";
import { addDays } from "date-fns";

import { WalletAPI, mkLucidWallet } from "@marlowe.io/wallet";
import { mergeAssets } from "@marlowe.io/adapter/lucid";

import * as RuntimeCore from "@marlowe.io/runtime-core";
import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";
import { RestClient } from "@marlowe.io/runtime-rest-client";
import { MarloweJSON, MarloweJSONCodec } from "@marlowe.io/adapter/codec";
import { logError, logInfo, logWarning } from "./logging.js";

type LucidExtendedDI = { lucid: Lucid; wallet: WalletAPI };
export type TxHashSubmitted = string;

export const logWalletInfo = async (
  walletName: string,
  wallet: WalletTestAPI
) => {
  const address = await wallet.getChangeAddress();
  const lovelaces = await wallet.getLovelaces();
  const tokens = await wallet.getTokens();
  logInfo(`Wallet ${walletName}`);
  logInfo(`\tAddress : ${address}`);
  logInfo(`\tLovelaces : ${lovelaces}`);
  logInfo(`\tTokens : ${MarloweJSON.stringify(tokens)}`);
};

const mkPolicyWithDeadlineAndOneAuthorizedSigner =
  ({ lucid }: LucidExtendedDI) =>
  async (deadline: Date): Promise<[Script, RuntimeCore.PolicyId]> => {
    const { paymentCredential } = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    );
    const json: NativeScript = {
      type: "all",
      scripts: [
        {
          type: "before",
          slot: lucid.utils.unixTimeToSlot(deadline.valueOf()),
        },
        { type: "sig", keyHash: paymentCredential?.hash! },
      ],
    };
    const script = lucid.utils.nativeScriptFromJson(json);
    const policyId = lucid.utils.mintingPolicyToId(script);
    return [script, RuntimeCore.policyId(policyId)];
  };

export interface WalletTestAPI extends WalletAPI {
  provision(request: ProvisionRequest): Promise<ProvisionResponse>;
  waitRuntimeSyncingTillCurrentWalletTip(client: RestClient): Promise<void>;
}

const toAssetsToTransfer = (assets: RuntimeCore.Assets): LucidAssets => {
  var lucidAssets: { [key: string]: bigint } = {};
  lucidAssets["lovelace"] = assets.lovelaces;
  assets.tokens.map(
    (token) =>
      (lucidAssets[
        toUnit(token.assetId.policyId, fromText(token.assetId.assetName))
      ] = token.quantity)
  );
  return lucidAssets;
};

const toAssetsToMint = (assets: RuntimeCore.Assets): LucidAssets => {
  var lucidAssets: { [key: string]: bigint } = {};
  assets.tokens.map(
    (token) =>
      (lucidAssets[
        toUnit(token.assetId.policyId, fromText(token.assetId.assetName))
      ] = token.quantity)
  );
  return lucidAssets;
};

export type MintRequest = {
  [assetName: RuntimeCore.AssetName]: RuntimeCore.AssetQuantity;
};
export type ProvisionScheme = {
  lovelacesToTransfer: RuntimeCore.AssetQuantity;
  assetsToMint: MintRequest;
};
export type ProvisionRequest = {
  [participant: string]: { wallet: WalletTestAPI; scheme: ProvisionScheme };
};
export type ProvisionResponse = {
  [participant: string]: {
    wallet: WalletTestAPI;
    assetsProvisionned: RuntimeCore.Assets;
  };
};

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
    await waitForPredicate(
      isRuntimeChainMoreAdvancedThan(client, currentLucidSlot)
    );
    return sleep(5);
  };

function sleep(secondes: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, secondes * 1_000));
}

async function waitForPredicate(
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
  await waitForPredicate(predicate, interval);
}

const provision =
  (di: LucidExtendedDI) =>
  async (requests: ProvisionRequest): Promise<ProvisionResponse> => {
    const { lucid, wallet } = di;

    const mintingDeadline = addDays(Date.now(), 1);

    const [script, policyId] = await mkPolicyWithDeadlineAndOneAuthorizedSigner(
      di
    )(mintingDeadline);

    const distributions = await Promise.all(
      Object.entries(requests).map(([participant, x]) =>
        x.wallet.getChangeAddress().then(
          (address) =>
            [
              participant,
              x.wallet,
              RuntimeCore.addressBech32(address),
              {
                lovelaces: x.scheme.lovelacesToTransfer,
                tokens: Object.entries(x.scheme.assetsToMint).map(
                  ([assetName, quantity]) => ({
                    quantity,
                    assetId: { assetName, policyId },
                  })
                ),
              },
            ] as [
              string,
              WalletTestAPI,
              RuntimeCore.AddressBech32,
              RuntimeCore.Assets
            ]
        )
      )
    );

    const assetsToMint = pipe(
      distributions,
      A.map((aDistribution) => toAssetsToMint(aDistribution[3])),
      A.reduce(mergeAssets.empty, mergeAssets.concat)
    );

    console.log("Distribution : ", MarloweJSON.stringify(distributions));
    console.log("Assets to mint : ", MarloweJSON.stringify(assetsToMint));
    const mintTx = lucid
      .newTx()
      .mintAssets(assetsToMint)
      .validTo(Date.now() + 100000)
      .attachMintingPolicy(script);

    const transferTx = await pipe(
      distributions,
      A.reduce(
        lucid.newTx(),
        (tx, aDistribution) =>
          tx
            .payToAddress(
              aDistribution[2],
              toAssetsToTransfer(aDistribution[3])
            )
            .payToAddress(aDistribution[2], { lovelace: 5_000_000n }) // add a Collateral
      )
    );

    var result: ProvisionResponse = {};
    distributions.map(([participant, wallet, , assetsProvisionned]) => {
      result[participant] = {
        wallet: wallet,
        assetsProvisionned: assetsProvisionned,
      };
    });

    const provisionTx = await mintTx.compose(transferTx).complete();
    await provisionTx
      .sign()
      .complete()
      .then((tx) => tx.submit())
      .then((txHashSubmitted) => wallet.waitConfirmation(txHashSubmitted));
    return result;
  };

export function mkLucidWalletTest(lucidWallet: Lucid): WalletTestAPI {
  const di = { lucid: lucidWallet, wallet: mkLucidWallet(lucidWallet) };
  return {
    ...di.wallet,
    ...{ provision: provision(di) },
    ...{
      waitRuntimeSyncingTillCurrentWalletTip:
        waitRuntimeSyncingTillCurrentWalletTip(di),
    },
  };
}
