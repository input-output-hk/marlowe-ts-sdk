import { close } from "@marlowe.io/language-core-v1";
import { create } from "@marlowe.io/runtime-lifecycle/tx";
import { mkRestClient } from "@marlowe.io/runtime-rest-client/index.js";

import { initialiseBankAndverifyProvisionning } from "../provisionning.js";
import {
  getBankPrivateKey,
  getBlockfrostContext,
  getMarloweRuntimeUrl,
} from "../context.js";

import console from "console";
import { unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import { MINUTES } from "@marlowe.io/adapter/time";
global.console = console;

describe("Marlowe Tx Commands", () => {
  const restClient = mkRestClient(getMarloweRuntimeUrl());
  it(
    "can create a Marlowe Contract ",
    async () => {
      const { bank } = await initialiseBankAndverifyProvisionning(
        restClient,
        getBlockfrostContext(),
        getBankPrivateKey()
      );
      const contractId = await unsafeTaskEither(
        create(restClient)(bank)({ contract: close })
      );
      console.log("contractID created", contractId);
    },
    10 * MINUTES
  );
});
