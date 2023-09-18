import { pipe } from "fp-ts/lib/function.js";
import addDays from "date-fns/fp/addDays/index.js";

import * as Examples from "@marlowe.io/language-core-v1/examples";
import { datetoTimeout, adaValue } from "@marlowe.io/language-core-v1";
import { toInput } from "@marlowe.io/language-core-v1/next";
import { mkRestClient } from "@marlowe.io/runtime-rest-client/index.js";

import {
  getBankPrivateKey,
  getBlockfrostContext,
  getMarloweRuntimeUrl,
} from "../context.js";
import { provisionAnAdaAndTokenProvider } from "../provisionning.js";
import console from "console";
import { runtimeTokenToMarloweTokenValue } from "@marlowe.io/runtime-core";
import { onlyByContractIds } from "@marlowe.io/runtime-lifecycle/api";
import { MINUTES } from "@marlowe.io/adapter/time";

global.console = console;

describe("Payouts", () => {
  const restAPI = mkRestClient(getMarloweRuntimeUrl());
  const provisionScheme = {
    provider: { adaAmount: 20_000_000n },
    swapper: { adaAmount: 20_000_000n, tokenAmount: 50n, tokenName: "TokenA" },
  };

  async function executeSwapWithRequiredWithdrawalTillClosing() {
    const { tokenValueMinted, runtime, adaProvider, tokenProvider } =
      await provisionAnAdaAndTokenProvider(
        restAPI,
        getBlockfrostContext(),
        getBankPrivateKey(),
        provisionScheme
      );
    const swapRequest = {
      provider: {
        roleName: "Ada provider",
        depositTimeout: pipe(Date.now(), addDays(1), datetoTimeout),
        value: adaValue(2n),
      },
      swapper: {
        roleName: "Token provider",
        depositTimeout: pipe(Date.now(), addDays(2), datetoTimeout),
        value: runtimeTokenToMarloweTokenValue(tokenValueMinted),
      },
    };
    const swapContract = Examples.SwapADAToken.mkSwapContract(swapRequest);
    const contractId = await runtime(adaProvider).contracts.create({
      contract: swapContract,
      roles: {
        [swapRequest.provider.roleName]: adaProvider.address,
        [swapRequest.swapper.roleName]: tokenProvider.address,
      },
    });

    // see [[apply-inputs-next-provider]], I think it would be clearer to separate the "what are the
    // next possible inputs from the apply inputs call"
    await runtime(adaProvider).contracts.applyInputs(contractId, (next) => ({
      inputs: [pipe(next.applicable_inputs.deposits[0], toInput)],
    }));

    await runtime(tokenProvider).contracts.applyInputs(contractId, (next) => ({
      inputs: [pipe(next.applicable_inputs.deposits[0], toInput)],
    }));
    return {
      contractId,
      runtime,
      adaProvider,
      tokenProvider,
    };
  }

  it(
    "Payouts can be withdrawn",
    async () => {
      const result = await executeSwapWithRequiredWithdrawalTillClosing();
      const { adaProvider, tokenProvider, contractId, runtime } = result;
      const adaProviderPayouts = await runtime(adaProvider).payouts.available(
        onlyByContractIds([contractId])
      );
      expect(adaProviderPayouts.length).toBe(1);
      await runtime(adaProvider).payouts.withdraw([
        adaProviderPayouts[0].payoutId,
      ]);

      const tokenProviderPayouts = await runtime(
        tokenProvider
      ).payouts.available(onlyByContractIds([contractId]));
      expect(tokenProviderPayouts.length).toBe(1);
      await runtime(tokenProvider).payouts.withdraw([
        tokenProviderPayouts[0].payoutId,
      ]);
    },
    10 * MINUTES
  );
});
