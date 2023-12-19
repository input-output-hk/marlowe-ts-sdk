import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";

import { Deposit } from "@marlowe.io/language-core-v1/next";

import { datetoTimeout, adaValue } from "@marlowe.io/language-core-v1";
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
import { mintRole } from "@marlowe.io/runtime-rest-client/contract";
import { AtomicSwap } from "@marlowe.io/language-examples";

global.console = console;

describe.skip("swap", () => {
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

      const { tokenValueMinted, adaProvider, tokenProvider, runtime } =
        await provisionAnAdaAndTokenProvider(
          getMarloweRuntimeUrl(),
          getBlockfrostContext(),
          getBankPrivateKey(),
          provisionScheme
        );
      const scheme: AtomicSwap.Scheme = {
        participants: {
          seller: { address: adaProvider.address },
          buyer: { role_token: "buyer" },
        },
        offer: {
          deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
          asset: adaValue(2n),
        },
        ask: {
          deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
          asset: runtimeTokenToMarloweTokenValue(tokenValueMinted),
        },
        swapConfirmation: {
          deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
        },
      };

      const swapContract = AtomicSwap.mkContract(scheme);

      const [contractId, txCreatedContract] = await runtime(
        adaProvider
      ).contracts.submitCreateContract({
        contract: swapContract,
        roles: {
          [scheme.participants.buyer.role_token]: mintRole(
            tokenProvider.address
          ),
        },
      });

      await runtime(adaProvider).wallet.waitConfirmation(txCreatedContract);
      // Applying the first Deposit
      let next = await runtime(adaProvider).contracts.getApplicableInputs(
        contractId
      );
      const txFirstTokensDeposited = await runtime(
        adaProvider
      ).contracts.submitApplyInputs(contractId, {
        inputs: [pipe(next.applicable_inputs.deposits[0], Deposit.toInput)],
      });
      await runtime(adaProvider).wallet.waitConfirmation(
        txFirstTokensDeposited
      );

      // Applying the second Deposit
      next = await runtime(tokenProvider).contracts.getApplicableInputs(
        contractId
      );
      await runtime(tokenProvider).contracts.submitApplyInputs(contractId, {
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
