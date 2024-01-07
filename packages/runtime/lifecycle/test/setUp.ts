import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/generic";
import { RestClient, mkFPTSRestClient } from "@marlowe.io/runtime-rest-client";

import { Lucid } from "lucid-cardano";
import {
  logInfo,
  logWalletInfo,
  mkLucidWalletTest,
  Provision,
  WalletTestAPI,
} from "@marlowe.io/testing-kit";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api.js";
import { Assets } from "@marlowe.io/runtime-core";
import { TestConfiguration } from "@marlowe.io/testing-kit";

export type SetUpReponse = {
  bank: WalletTestAPI;
  participants: Participants;
  runtime: {
    client: RestClient;
    mkLifecycle: (wallet: WalletTestAPI) => RuntimeLifecycle;
  };
};

export type Participants = {
  [participant: string]: { wallet: WalletTestAPI; assetsProvisionned: Assets };
};

export const setUp =
  (provisionRequest: Provision.Request) =>
  async (testConfiguration: TestConfiguration): Promise<SetUpReponse> => {
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
    logInfo("bank is provisionned enough");
    const participants = await bank.provision(provisionRequest);
    logInfo("Set Up : ssss");
    await bank.waitRuntimeSyncingTillCurrentWalletTip(
      testConfiguration.runtime.client
    );
    logInfo("Set Up : Completed");
    return {
      bank,
      participants: participants,
      runtime: {
        client: testConfiguration.runtime.client,
        mkLifecycle: (wallet: WalletTestAPI) =>
          mkRuntimeLifecycle(
            deprecatedRestAPI,
            testConfiguration.runtime.client,
            wallet
          ),
      },
    };
  };
