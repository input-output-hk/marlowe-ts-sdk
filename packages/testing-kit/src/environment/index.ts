import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/generic";
import { RestClient, mkFPTSRestClient } from "@marlowe.io/runtime-rest-client";

import { Lucid } from "lucid-cardano";

import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api";
import { Assets } from "@marlowe.io/runtime-core";
import { TestConfiguration, logInfo, logWalletInfo, mkLucidWalletTest } from "@marlowe.io/testing-kit";
import { ProvisionRequest, WalletTestAPI } from "../wallet/api.js";


/**
 * List of Participants available for a test
 */
export type TestEnvironment = {
  /**
   * Bank Wallet
   */
  bank: WalletTestAPI;
  /**
   * List of Participants available for the test
  */
  participants: Participants;
  /**
   * Access to runtime client and the runtime lifecycle api
   */
  runtime: {
    client: RestClient;
    mkLifecycle: (wallet: WalletTestAPI) => RuntimeLifecycle;
  };
};

/**
 * List of Participants available for a test
 */
export type Participants = {
  [participant: string]: 
     
    { /**
       * Wallet Test instance 
       */
      wallet: WalletTestAPI,
      /**
       * List of Assets provisionned By the Bank Wallet
       */ 
      assetsProvisionned: Assets };
};

/**
 * Provide a Test Environment to execute E2E tests over a Lucid Wallet and an instance of a 
 * Marlowe Runtime.
 * @param provisionRequest 
 * @returns 
 */
export const mkTestEnvironment =
  (provisionRequest: ProvisionRequest) =>
  async (testConfiguration: TestConfiguration): Promise<TestEnvironment> => {
    logInfo("Test Environment : Initiating");

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
    if(bankBalance <= 100_000_000n) {
      throw { message: "Bank is not sufficiently provisionned (< 100 Ada)"}
    }
    logInfo("Bank is provisionned enough");
    const participants = await bank.provision(provisionRequest);

    await bank.waitRuntimeSyncingTillCurrentWalletTip(
      testConfiguration.runtime.client
    );

    logInfo("Test Environment : Ready");
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
