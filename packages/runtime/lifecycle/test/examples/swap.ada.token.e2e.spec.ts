import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";

import { Deposit } from "@marlowe.io/language-core-v1/next";
import * as Examples from "@marlowe.io/language-examples";

import { datetoTimeout, adaValue } from "@marlowe.io/language-core-v1";
import { mkFPTSRestClient } from "@marlowe.io/runtime-rest-client/index.js";
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
import { mintRole, openRole } from "@marlowe.io/runtime-rest-client/contract";
import {
  AddressBech32,
  AddressBech32Guard,
} from "@marlowe.io/runtime-rest-client/contract/rolesConfigurations.js";

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
      const restClient = mkFPTSRestClient(getMarloweRuntimeUrl());
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
          depositTimeout: pipe(addDays(Date.now(), 1), datetoTimeout),
          value: adaValue(2n),
        },
        swapper: {
          roleName: "Token provider",
          depositTimeout: pipe(addDays(Date.now(), 2), datetoTimeout),
          value: runtimeTokenToMarloweTokenValue(tokenValueMinted),
        },
      };
      const swapContract = Examples.SwapADAToken.mkSwapContract(swapRequest);

      // Creation of the Contract
      const [contractId, txIdContractCreated] = await runtime(
        adaProvider
      ).contracts.createContract({
        contract: swapContract,
        roles: {
          [swapRequest.provider.roleName]: mintRole(
            adaProvider.address as unknown as AddressBech32
          ),
          [swapRequest.swapper.roleName]: mintRole(
            tokenProvider.address as unknown as AddressBech32
          ),
        },
      });
      await runtime(adaProvider).wallet.waitConfirmation(txIdContractCreated);
      // Applying the first Deposit
      let next = await runtime(adaProvider).contracts.getApplicableInputs(
        contractId
      );
      const txFirstTokensDeposited = await runtime(
        adaProvider
      ).contracts.applyInputs(contractId, {
        inputs: [pipe(next.applicable_inputs.deposits[0], Deposit.toInput)],
      });
      await runtime(adaProvider).wallet.waitConfirmation(
        txFirstTokensDeposited
      );

      // Applying the second Deposit
      next = await runtime(tokenProvider).contracts.getApplicableInputs(
        contractId
      );
      await runtime(tokenProvider).contracts.applyInputs(contractId, {
        inputs: [pipe(next.applicable_inputs.deposits[0], Deposit.toInput)],
      });
      await runtime(tokenProvider).wallet.waitConfirmation(
        txFirstTokensDeposited
      );

      // Retrieving Payouts
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
