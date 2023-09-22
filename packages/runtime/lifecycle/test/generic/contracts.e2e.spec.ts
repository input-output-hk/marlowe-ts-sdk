import { pipe } from "fp-ts/lib/function.js";
import * as O from "fp-ts/lib/Option.js";
import { addDays } from "date-fns";

import {
  datetoTimeout,
  inputNotify,
  close,
} from "@marlowe.io/language-core-v1";
import { oneNotifyTrue } from "@marlowe.io/language-core-v1/examples";
import { mkRestClient } from "@marlowe.io/runtime-rest-client/index.js";

import {
  getBankPrivateKey,
  getBlockfrostContext,
  getMarloweRuntimeUrl,
} from "../context.js";
import { initialiseBankAndverifyProvisionning } from "../provisionning.js";
import console from "console";
import { unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import { MINUTES } from "@marlowe.io/adapter/time";
import { Next } from "@marlowe.io/language-core-v1/next";

global.console = console;

describe("Runtime Contract Lifecycle ", () => {
  it(
    "can create a Marlowe Contract ",
    async () => {
      const restClient = mkRestClient(getMarloweRuntimeUrl());
      const { runtime } = await initialiseBankAndverifyProvisionning(
        restClient,
        getBlockfrostContext(),
        getBankPrivateKey()
      );
      const contractId = await runtime.contracts.create({ contract: close });

      console.log("contractID created", contractId);
    },
    10 * MINUTES
  ),
    it(
      "can Apply Inputs to a Contract",
      async () => {
        const restClient = mkRestClient(getMarloweRuntimeUrl());
        const { runtime } = await initialiseBankAndverifyProvisionning(
          restClient,
          getBlockfrostContext(),
          getBankPrivateKey()
        );
        const notifyTimeout = pipe(addDays(Date.now(), 1), datetoTimeout);
        const contractId = await runtime.contracts.create({
          contract: oneNotifyTrue(notifyTimeout),
        });
        await runtime.contracts.applyInputs(contractId, (_next: Next) => ({
          inputs: [inputNotify],
        }));
        const result = await unsafeTaskEither(
          restClient.contracts.contract.transactions.getHeadersByRange(
            contractId,
            O.none
          )
        );
        expect(result.headers.length).toBe(1);
      },
      10 * MINUTES
    );
});
