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
import {
  logError,
  logInfo,
  readTestConfiguration,
} from "@marlowe.io/testing-kit";
import { setUp } from "../setUp.js";

global.console = console;

describe.skip("Runtime Contract Lifecycle ", () => {
  it(
    "can create a Marlowe Contract ",
    async () => {
      try {
        const { bank, runtime } = await readTestConfiguration().then(setUp({}));
        const runtimeLifecycle = runtime.mkLifecycle(bank);
        const [contractId, txIdContractCreated] =
          await runtimeLifecycle.contracts.createContract({
            contract: close,
            minimumLovelaceUTxODeposit: 3_000_000,
          });
        await bank.waitConfirmation(txIdContractCreated);
        logInfo(`contractID created : ${contractId}`);
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
            setUp({})
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
