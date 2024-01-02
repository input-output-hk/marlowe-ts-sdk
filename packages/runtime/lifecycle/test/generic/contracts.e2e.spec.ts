import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";
import { AxiosError } from "axios";
import {
  datetoTimeout,
  inputNotify,
  close,
} from "@marlowe.io/language-core-v1";
import { oneNotifyTrue } from "@marlowe.io/language-examples";

import {
  getBankSeedPhrase,
  getBlockfrostContext,
  getMarloweRuntimeUrl,
} from "../context.js";
import { SetupContext } from "../provisionning.js";
import console from "console";
import { MINUTES } from "@marlowe.io/adapter/time";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/generic";
import { mkLucidWalletTest } from "@marlowe.io/testing-kit";
import {
  mkFPTSRestClient,
  mkRestClient,
} from "@marlowe.io/runtime-rest-client";
import { Lucid, Blockfrost } from "lucid-cardano";

global.console = console;
const log = (message: string) => console.log(`\t## - ${message}`);
const formatADA = (lovelaces: bigint): String =>
  new Intl.NumberFormat().format(lovelaces / 1_000_000n).concat(" ₳");

export async function setUp(context: SetupContext) {
  const { runtimeURL, lucid, bankSeedPhrase } = context;
  const deprecatedRestAPI = mkFPTSRestClient(runtimeURL);
  const restClient = mkRestClient(runtimeURL);
  const lucidInstance = await Lucid.new(
    new Blockfrost(lucid.blockfrostUrl, lucid.projectId),
    lucid.network
  );
  lucidInstance.selectWalletFromSeed(bankSeedPhrase.join(" "));

  const bank = mkLucidWalletTest(lucidInstance);
  const runtime = mkRuntimeLifecycle(deprecatedRestAPI, restClient, bank);

  const bankBalance = await bank.getLovelaces();
  const address = await bank.getChangeAddress();
  // Check Banks treasury
  log(`Bank (${address})`);
  log(`${formatADA(bankBalance)}`);

  expect(bankBalance).toBeGreaterThan(100_000_000);

  return { runtime, restClient };
}

describe("Runtime Contract Lifecycle ", () => {
  it(
    "can create a Marlowe Contract ",
    async () => {
      try {
        const { runtime } = await setUp({
          runtimeURL: getMarloweRuntimeUrl(),
          lucid: getBlockfrostContext(),
          bankSeedPhrase: getBankSeedPhrase(),
        });
        const [contractId, txIdContractCreated] =
          await runtime.contracts.createContract({
            contract: close,
            minimumLovelaceUTxODeposit: 3_000_000,
          });
        await runtime.wallet.waitConfirmation(txIdContractCreated);
        log(`contractID created : ${contractId}`);
        // Check Banks treasury
        log(`end :  ${formatADA(await runtime.wallet.getLovelaces())}`);
      } catch (e) {
        const error = e as AxiosError;
        console.log(`catched : ${JSON.stringify(error.response?.data)}`);
        console.log(`catched : ${JSON.stringify(error)}`);
        expect(true).toBe(false);
      }
    },
    10 * MINUTES
  ),
    it(
      "can Apply Inputs to a Contract",
      async () => {
        try {
          const { runtime, restClient } = await setUp({
            runtimeURL: getMarloweRuntimeUrl(),
            lucid: getBlockfrostContext(),
            bankSeedPhrase: getBankSeedPhrase(),
          });
          const notifyTimeout = pipe(addDays(Date.now(), 1), datetoTimeout);
          const [contractId, txIdContractCreated] =
            await runtime.contracts.createContract({
              contract: oneNotifyTrue(notifyTimeout),
              minimumLovelaceUTxODeposit: 3_000_000,
            });
          await runtime.wallet.waitConfirmation(txIdContractCreated);
          log(
            `contractID status : ${contractId} -> ${
              (await restClient.getContractById(contractId)).status
            }`
          );
          const txIdInputsApplied = await runtime.contracts.applyInputs(
            contractId,
            {
              inputs: [inputNotify],
            }
          );
          const result = await runtime.wallet.waitConfirmation(
            txIdInputsApplied
          );
          expect(result).toBe(true);
        } catch (e) {
          const error = e as AxiosError;
          console.log(`catched : ${error.message}`);
          console.log(`catched : ${JSON.stringify(error.response?.data)}`);
          console.log(`catched : ${JSON.stringify(error)}`);
          expect(true).toBe(false);
        }
      },
      10 * MINUTES
    );
});
