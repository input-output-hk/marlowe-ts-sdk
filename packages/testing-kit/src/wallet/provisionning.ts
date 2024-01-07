import {
  Lucid,
  toUnit,
  fromText,
  Blockfrost,
  NativeScript,
  Script,
  Assets as LucidAssets,
} from "lucid-cardano";
import { addDays } from "date-fns";

import { mergeAssets } from "@marlowe.io/adapter/lucid";

import * as RuntimeCore from "@marlowe.io/runtime-core";
import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { logInfo } from "../logging.js";
import { SeedPhrase } from "../seedPhrase.js";
import { LucidExtendedDI, WalletTestAPI, mkLucidWalletTest } from "./index.js";

export type Request = {
  [participant: string]: {
    walletSeedPhrase: SeedPhrase;
    scheme: Scheme;
  };
};
type RequestWithWallets = {
  [participant: string]: {
    wallet: WalletTestAPI;
    scheme: Scheme;
  };
};
export type Response = {
  [participant: string]: {
    wallet: WalletTestAPI;
    assetsProvisionned: RuntimeCore.Assets;
  };
};
export type MintRequest = {
  [assetName: RuntimeCore.AssetName]: RuntimeCore.AssetQuantity;
};
export type Scheme = {
  lovelacesToTransfer: RuntimeCore.AssetQuantity;
  assetsToMint: MintRequest;
};

export const provision =
  (di: LucidExtendedDI) =>
  async (request: Request): Promise<Response> => {
    if (Object.entries(request).length === 0) {
      logInfo("No Participants Involved");
      return Promise.resolve({});
    }

    const { lucid, wallet } = di;
    let requestWithWallets: RequestWithWallets = {};
    await Promise.all(
      Object.entries(request).map(
        ([participant, { walletSeedPhrase, scheme }]) => {
          return Lucid.new(
            new Blockfrost(
              "https://cardano-preprod.blockfrost.io/api/v0",
              "preprodVI3AcxOFa6ClooZSzWSM4Fa4ujDd3Dx7"
            ),
            "Preprod"
          ).then((newLucidInstance) => {
            const wallet = mkLucidWalletTest(
              newLucidInstance.selectWalletFromSeed(walletSeedPhrase.join(` `))
            );
            logInfo(`walletAddress : ${wallet.getChangeAddress()}`);
            requestWithWallets[participant] = { wallet, scheme };
          });
        }
      )
    );

    logInfo(
      `Provisionning Request : ${MarloweJSON.stringify(
        requestWithWallets,
        null,
        4
      )}`
    );

    const mintingDeadline = addDays(Date.now(), 1);

    const [script, policyId] = await mkPolicyWithDeadlineAndOneAuthorizedSigner(
      di
    )(mintingDeadline);

    const distributions = await Promise.all(
      Object.entries(requestWithWallets).map(([participant, x]) =>
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

    logInfo(`Distribution : ${MarloweJSON.stringify(distributions, null, 4)}`);
    logInfo(`Assets to mint : ${MarloweJSON.stringify(assetsToMint, null, 4)}`);

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
            .payToAddress(aDistribution[2], { lovelace: 5_000_000n })
            .payToAddress(aDistribution[2], { lovelace: 5_000_000n })
            .payToAddress(aDistribution[2], { lovelace: 5_000_000n }) // add a Collateral
      )
    );

    var result: Response = {};
    distributions.map(([participant, wallet, , assetsProvisionned]) => {
      result[participant] = {
        wallet: wallet,
        assetsProvisionned: assetsProvisionned,
      };
    });
    logInfo(`result : ${MarloweJSON.stringify(result, null, 4)}`);
    const provisionTx = await mintTx.compose(transferTx).complete();
    logInfo(`here `);
    await provisionTx
      .sign()
      .complete()
      .then((tx) => tx.submit())
      .then((txHashSubmitted) => wallet.waitConfirmation(txHashSubmitted));
    return result;
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
