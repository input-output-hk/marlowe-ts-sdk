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
import { initialiseBankAndverifyProvisionning } from "../provisionning.js";
import console from "console";
import { MINUTES } from "@marlowe.io/adapter/time";

global.console = console;

describe("Runtime Contract Lifecycle ", () => {
  it(
    "can create a Marlowe Contract ",
    async () => {
      const { runtime } = await initialiseBankAndverifyProvisionning(
        getMarloweRuntimeUrl(),
        getBlockfrostContext(),
        getBankPrivateKey()
      );
      const [contractId, txIdContractCreated] =
        await runtime.contracts.submitCreateContract({ contract: close });
      await runtime.wallet.waitConfirmation(txIdContractCreated);
      console.log("contractID created", contractId);
    },
    10 * MINUTES
  ),
    it(
      "can Apply Inputs to a Contract",
      async () => {
        const { runtime } = await initialiseBankAndverifyProvisionning(
          getMarloweRuntimeUrl(),
          getBlockfrostContext(),
          getBankPrivateKey()
        );
        const notifyTimeout = pipe(addDays(Date.now(), 1), datetoTimeout);
        const [contractId, txIdContractCreated] =
          await runtime.contracts.submitCreateContract({
            contract: oneNotifyTrue(notifyTimeout),
          });
        await runtime.wallet.waitConfirmation(txIdContractCreated);

        const txIdInputsApplied = await runtime.contracts.submitApplyInputs(
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
