import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns/fp";

import { toInput } from "@marlowe.io/language-core-v1/next";
import * as Examples from "@marlowe.io/language-core-v1/examples";
import { datetoTimeout, adaValue } from "@marlowe.io/language-core-v1";
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

describe("swap", () => {
  it(
    "can execute the nominal case",
    async () => {
      const provisionScheme = {
        provider: { adaAmount: 20_000_000n },
        swapper: {
          adaAmount: 20_000_000n,
          tokenAmount: 50n,
          tokenName: "TokenA",
        },
      };
      const restClient = mkRestClient(getMarloweRuntimeUrl());
      const { tokenValueMinted, adaProvider, tokenProvider, runtime } =
        await provisionAnAdaAndTokenProvider(
          restClient,
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
      // see [[apply-inputs-next-provider]]
      await runtime(adaProvider).contracts.applyInputs(contractId, (next) => ({
        inputs: [pipe(next.applicable_inputs.deposits[0], toInput)],
      }));
      await runtime(tokenProvider).contracts.applyInputs(
        contractId,
        (next) => ({
          inputs: [pipe(next.applicable_inputs.deposits[0], toInput)],
        })
      );

      const adaProviderAvalaiblePayouts = await runtime(
        adaProvider
      ).payouts.available(onlyByContractIds([contractId]));
      expect(adaProviderAvalaiblePayouts.length).toBe(1);
      await runtime(adaProvider).payouts.withdraw([
        adaProviderAvalaiblePayouts[0].payoutId,
      ]);
      const adaProviderWithdrawn = await runtime(adaProvider).payouts.withdrawn(
        onlyByContractIds([contractId])
      );
      expect(adaProviderWithdrawn.length).toBe(1);

      const tokenProviderAvalaiblePayouts = await runtime(
        tokenProvider
      ).payouts.available(onlyByContractIds([contractId]));
      expect(tokenProviderAvalaiblePayouts.length).toBe(1);
      await runtime(tokenProvider).payouts.withdraw([
        tokenProviderAvalaiblePayouts[0].payoutId,
      ]);
      const tokenProviderWithdrawn = await runtime(
        tokenProvider
      ).payouts.withdrawn(onlyByContractIds([contractId]));
      expect(tokenProviderWithdrawn.length).toBe(1);
    },
    10 * MINUTES
  );
});
