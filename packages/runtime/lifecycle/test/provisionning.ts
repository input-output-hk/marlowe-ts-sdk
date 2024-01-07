import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/generic";
import {
  RestClient,
  mkFPTSRestClient,
  mkRestClient,
} from "@marlowe.io/runtime-rest-client";

import { Lucid, Blockfrost } from "lucid-cardano";
import {
  logWalletInfo,
  mkLucidWalletTest,
  ProvisionRequest,
  ProvisionResponse,
  ProvisionScheme,
  WalletTestAPI,
} from "@marlowe.io/testing-kit";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api.js";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { Assets } from "@marlowe.io/runtime-core";
import { SeedPhrase } from "@marlowe.io/testing-kit";
import { TestConfiguration, logInfo } from "@marlowe.io/testing-kit";

export type SetUpRequest = {
  [participant: string]: [SeedPhrase, ProvisionScheme];
};
export type Participants = {
  [participant: string]: { wallet: WalletTestAPI; assetsProvisionned: Assets };
};

export async function setUp(
  testConfiguration: TestConfiguration,
  request: ProvisionRequest
) {
  const deprecatedRestAPI = mkFPTSRestClient(
    testConfiguration.runtime.url.toString()
  );

  const bankLucid = await Lucid.new(
    testConfiguration.lucid.blockfrost,
    testConfiguration.lucid.node.network
  );

  bankLucid.selectWalletFromSeed(testConfiguration.bank.seedPhrase.join(" "));

  const bank = mkLucidWalletTest(bankLucid);

  await logWalletInfo("bank", bank);

  const bankBalance = await bank.getLovelaces();
  expect(bankBalance).toBeGreaterThan(100_000_000);

  let provisionRequest: ProvisionRequest = {};
  await Promise.all(
    Object.entries(request).map(([participant, [seedPhrase, scheme]]) => {
      return Lucid.new(
        testConfiguration.lucid.blockfrost,
        testConfiguration.lucid.node.network
      ).then((newLucidInstance) => {
        const wallet = mkLucidWalletTest(
          newLucidInstance.selectWalletFromSeed(seedPhrase.join(` `))
        );
        provisionRequest[participant] = { wallet, scheme };
      });
    })
  );

  logInfo(
    `Provisionning Request : ${MarloweJSON.stringify(
      provisionRequest,
      null,
      4
    )}`
  );
  const provisionResponse = await bank.provision(provisionRequest);
  return {
    bank,
    runtime: {
      client: testConfiguration.runtime.client,
      mkLifecycle: (wallet: WalletTestAPI) =>
        mkRuntimeLifecycle(
          deprecatedRestAPI,
          testConfiguration.runtime.client,
          wallet
        ),
    },
    provisionResponse,
  };
}
