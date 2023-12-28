import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";

import {
  datetoTimeout,
  inputNotify,
  close,
} from "@marlowe.io/language-core-v1";
import { oneNotifyTrue } from "@marlowe.io/language-examples";

import {
  getBankPrivateKey,
  getBlockfrostContext,
  getMarloweRuntimeUrl,
} from "../context.js";
import { SetupContext } from "../provisionning.js";
import console from "console";
import { MINUTES } from "@marlowe.io/adapter/time";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/generic";
import { mkLucidWalletTest } from "@marlowe.io/testing-kit";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api.js";
import {
  mkFPTSRestClient,
  mkRestClient,
} from "@marlowe.io/runtime-rest-client";
import { Lucid, Blockfrost } from "lucid-cardano";

global.console = console;
const log = (message: string) => console.log(`\t## - ${message}`);
const formatADA = (lovelaces: bigint): String =>
  new Intl.NumberFormat().format(lovelaces / 1_000_000n).concat(" ₳");

export async function setUp(context: SetupContext): Promise<{
  runtime: RuntimeLifecycle;
}> {
  const { runtimeURL, blockfrost, bankPrivateKey } = context;
  const deprecatedRestAPI = mkFPTSRestClient(runtimeURL);
  const restClient = mkRestClient(runtimeURL);
  const lucid = await Lucid.new(
    new Blockfrost(blockfrost.blockfrostUrl, blockfrost.projectId),
    blockfrost.network
  );
  lucid.selectWalletFromPrivateKey(bankPrivateKey);

  const bank = mkLucidWalletTest(lucid);
  const runtime = mkRuntimeLifecycle(deprecatedRestAPI, restClient, bank);

  const bankBalance = await bank.getLovelaces();
  const address = await bank.getChangeAddress();
  // Check Banks treasury
  log(`Bank (${address})`);
  log(`  - ${formatADA(bankBalance)}`);

  expect(bankBalance).toBeGreaterThan(100_000_000);

  return { runtime };
}

describe.skip("Runtime Contract Lifecycle ", () => {
  it(
    "can create a Marlowe Contract ",
    async () => {
      const { runtime } = await setUp({
        runtimeURL: getMarloweRuntimeUrl(),
        blockfrost: getBlockfrostContext(),
        bankPrivateKey: getBankPrivateKey(),
      });
      const [contractId, txIdContractCreated] =
        await runtime.contracts.createContract({ contract: close });
      await runtime.wallet.waitConfirmation(txIdContractCreated);
      console.log("contractID created", contractId);
    },
    10 * MINUTES
  ),
    it(
      "can Apply Inputs to a Contract",
      async () => {
        const { runtime } = await setUp({
          runtimeURL: getMarloweRuntimeUrl(),
          blockfrost: getBlockfrostContext(),
          bankPrivateKey: getBankPrivateKey(),
        });
        const notifyTimeout = pipe(addDays(Date.now(), 1), datetoTimeout);
        const [contractId, txIdContractCreated] =
          await runtime.contracts.createContract({
            contract: oneNotifyTrue(notifyTimeout),
          });
        await runtime.wallet.waitConfirmation(txIdContractCreated);

        const txIdInputsApplied = await runtime.contracts.applyInputs(
          contractId,
          {
            inputs: [inputNotify],
          }
        );
        const result = await runtime.wallet.waitConfirmation(txIdInputsApplied);
        expect(result).toBe(true);
      },
      10 * MINUTES
    );
});
