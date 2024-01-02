import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/generic";
import {
  RestClient,
  mkFPTSRestClient,
  mkRestClient,
} from "@marlowe.io/runtime-rest-client";
import { Context, PrivateKeysAsHex } from "@marlowe.io/wallet/nodejs";
import { Lucid, Blockfrost } from "lucid-cardano";
import {
  mkLucidWalletTest,
  ProvisionRequest,
  ProvisionResponse,
  ProvisionScheme,
  WalletTestAPI,
} from "@marlowe.io/testing-kit";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api.js";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { Assets } from "@marlowe.io/runtime-core";

const log = (message: string) => console.log(`\t## - ${message}`);
const formatADA = (lovelaces: bigint): String =>
  new Intl.NumberFormat().format(lovelaces / 1_000_000n).concat(" ₳");

export type SetupContext = {
  runtimeURL: string;
  lucid: Context;
  bankSeedPhrase: string[];
};
export type SeedPhrase = string[];
export type SetUpRequest = {
  [participant: string]: [SeedPhrase, ProvisionScheme];
};
export type Participants = {
  [participant: string]: { wallet: WalletTestAPI; assetsProvisionned: Assets };
};

export async function setUp(context: SetupContext, request: SetUpRequest) {
  const { runtimeURL, lucid, bankSeedPhrase } = context;
  const blockfrost = new Blockfrost(lucid.blockfrostUrl, lucid.projectId);
  const deprecatedRestAPI = mkFPTSRestClient(runtimeURL);
  const restClient = mkRestClient(runtimeURL);
  const bankLucid = await Lucid.new(blockfrost, lucid.network);

  bankLucid.selectWalletFromSeed(bankSeedPhrase.join(" "));

  const bank = mkLucidWalletTest(bankLucid);

  const bankBalance = await bank.getLovelaces();
  const address = await bank.getChangeAddress();
  // Check Banks treasury
  log(`Bank (${address})`);
  log(`  - ${formatADA(bankBalance)}`);

  expect(bankBalance).toBeGreaterThan(100_000_000);

  let provisionRequest: ProvisionRequest = {};
  await Promise.all(
    Object.entries(request).map(([participant, [seedPhrase, scheme]]) => {
      return Lucid.new(blockfrost, lucid.network).then((newLucidInstance) => {
        const wallet = mkLucidWalletTest(
          newLucidInstance.selectWalletFromSeed(seedPhrase.join(` `))
        );
        provisionRequest[participant] = { wallet, scheme };
      });
    })
  );

  // Check Banks treasury
  log(`Provisionning`);
  log(MarloweJSON.stringify(provisionRequest));
  const provisionResponse = await bank.provision(provisionRequest);

  return {
    bank,
    restClient,
    runtime: (wallet: WalletTestAPI) =>
      mkRuntimeLifecycle(deprecatedRestAPI, restClient, wallet),
    provisionResponse,
  };
}
