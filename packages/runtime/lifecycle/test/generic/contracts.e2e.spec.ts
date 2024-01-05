import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";
import { AxiosError } from "axios";
import {
  datetoTimeout,
  inputNotify,
  close,
} from "@marlowe.io/language-core-v1";
import { oneNotifyTrue } from "@marlowe.io/language-examples";

import console from "console";
import { MINUTES } from "@marlowe.io/adapter/time";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/generic";
import {
  TestConfiguration,
  WalletTestAPI,
  logError,
  logInfo,
  mkLucidWalletTest,
  readTestConfiguration,
} from "@marlowe.io/testing-kit";
import { mkFPTSRestClient } from "@marlowe.io/runtime-rest-client";
import { Lucid } from "lucid-cardano";

global.console = console;

const formatADA = (lovelaces: bigint): String =>
  new Intl.NumberFormat().format(lovelaces / 1_000_000n).concat(" ₳");

export async function setUp(testConfiguration: TestConfiguration) {
  const deprecatedRestAPI = mkFPTSRestClient(
    testConfiguration.runtime.url.toString()
  );

  const bankLucid = await Lucid.new(
    testConfiguration.lucid.blockfrost,
    testConfiguration.lucid.node.network
  );

  bankLucid.selectWalletFromSeed(testConfiguration.bank.seedPhrase.join(" "));

  const bank = mkLucidWalletTest(bankLucid);

  const bankBalance = await bank.getLovelaces();
  const address = await bank.getChangeAddress();

  logInfo(`Bank (${address})`);
  logInfo(`${formatADA(bankBalance)}`);

  expect(bankBalance).toBeGreaterThan(100_000_000);
  await bank.waitRuntimeSyncingTillCurrentWalletTip(
    testConfiguration.runtime.client
  );
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
  };
}

describe.skip("Runtime Contract Lifecycle ", () => {
  it(
    "can create a Marlowe Contract ",
    async () => {
      try {
        const { bank, runtime } = await readTestConfiguration().then((config) =>
          setUp(config)
        );
        const runtimeLifecycle = runtime.mkLifecycle(bank);
        const [contractId, txIdContractCreated] =
          await runtimeLifecycle.contracts.createContract({
            contract: close,
            minimumLovelaceUTxODeposit: 3_000_000,
          });
        await bank.waitConfirmation(txIdContractCreated);
        logInfo(`contractID created : ${contractId}`);
        logInfo(`end :  ${formatADA(await bank.getLovelaces())}`);
      } catch (e) {
        const error = e as AxiosError;
        logError(JSON.stringify(error.response?.data));
        logError(JSON.stringify(error));
        expect(true).toBe(false);
      }
    },
    10 * MINUTES
  ),
    it(
      "can Apply Inputs to a Contract",
      async () => {
        try {
          const { bank, runtime } = await readTestConfiguration().then(
            (config) => setUp(config)
          );
          const runtimeLifecycle = runtime.mkLifecycle(bank);

          const notifyTimeout = pipe(addDays(Date.now(), 1), datetoTimeout);
          const [contractId, txIdContractCreated] =
            await runtimeLifecycle.contracts.createContract({
              contract: oneNotifyTrue(notifyTimeout),
              minimumLovelaceUTxODeposit: 3_000_000,
            });
          await bank.waitConfirmation(txIdContractCreated);
          logInfo(
            `contractID status : ${contractId} -> ${
              (await runtime.client.getContractById(contractId)).status
            }`
          );
          await bank.waitRuntimeSyncingTillCurrentWalletTip(runtime.client);
          const txIdInputsApplied =
            await runtimeLifecycle.contracts.applyInputs(contractId, {
              inputs: [inputNotify],
            });
          const result = await bank.waitConfirmation(txIdInputsApplied);
          expect(result).toBe(true);
        } catch (e) {
          const error = e as AxiosError;
          logError(error.message);
          logError(JSON.stringify(error.response?.data));
          logError(JSON.stringify(error));
          expect(true).toBe(false);
        }
      },
      10 * MINUTES
    );
});
