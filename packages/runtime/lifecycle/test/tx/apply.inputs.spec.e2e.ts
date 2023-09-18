import { pipe } from "fp-ts/lib/function.js";
import * as O from "fp-ts/lib/Option.js";
import addDays from "date-fns/fp/addDays/index.js";

import { datetoTimeout, inputNotify } from "@marlowe.io/language-core-v1";
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

global.console = console;

describe("Marlowe Tx Commands", () => {
  it(
    "can Apply Inputs",
    async () => {
      const restAPI = mkRestClient(getMarloweRuntimeUrl());
      const { runtime } = await initialiseBankAndverifyProvisionning(
        restAPI,
        getBlockfrostContext(),
        getBankPrivateKey()
      );
      const notifyTimeout = pipe(Date.now(), addDays(1), datetoTimeout);
      const contractId = await runtime.contracts.create({
        contract: oneNotifyTrue(notifyTimeout),
      });
      await runtime.contracts.applyInputs(contractId, (next) => ({
        inputs: [inputNotify],
      }));
      const result = await unsafeTaskEither(
        restAPI.contracts.contract.transactions.getHeadersByRange(
          contractId,
          O.none
        )
      );
      expect(result.headers.length).toBe(1);
    },
    10 * MINUTES
  );
});
