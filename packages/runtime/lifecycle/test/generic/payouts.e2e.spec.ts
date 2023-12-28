import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";

import { AtomicSwap } from "@marlowe.io/language-examples";
import { datetoTimeout, adaValue } from "@marlowe.io/language-core-v1";
import { Deposit } from "@marlowe.io/language-core-v1/next";

import {
  getBankPrivateKey,
  getBlockfrostContext,
  getMarloweRuntimeUrl,
} from "../context.js";
import {} from "../provisionning.js";
import console from "console";
import { runtimeTokenToMarloweTokenValue } from "@marlowe.io/runtime-core";
import { onlyByContractIds } from "@marlowe.io/runtime-lifecycle/api";
import { MINUTES } from "@marlowe.io/adapter/time";
import { mintRole } from "@marlowe.io/runtime-rest-client/contract";

global.console = console;

describe.skip("Payouts", () => {
  // const provisionScheme = {
  //   provider: { adaAmount: 20_000_000n },
  //   swapper: { adaAmount: 20_000_000n, tokenAmount: 50n, tokenName: "TokenA" },
  // };

  // async function executeSwapWithRequiredWithdrawalTillClosing() {
  //   const { tokenValueMinted, runtime, adaProvider, tokenProvider } =
  //     await provisionAnAdaAndTokenProvider(
  //       getMarloweRuntimeUrl(),
  //       getBlockfrostContext(),
  //       getBankPrivateKey(),
  //       provisionScheme
  //     );
  //   const scheme: AtomicSwap.Scheme = {
  //     offer: {
  //       seller: { address: adaProvider.address },
  //       deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
  //       asset: adaValue(2n),
  //     },
  //     ask: {
  //       buyer: { role_token: "buyer" },
  //       deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
  //       asset: runtimeTokenToMarloweTokenValue(tokenValueMinted),
  //     },
  //     swapConfirmation: {
  //       deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
  //     },
  //   };

  //   const swapContract = AtomicSwap.mkContract(scheme);
  //   const [contractId, txCreatedContract] = await runtime(
  //     adaProvider
  //   ).contracts.createContract({
  //     contract: swapContract,
  //     roles: { [scheme.ask.buyer.role_token]: mintRole(tokenProvider.address) },
  //   });

  //   await runtime(adaProvider).wallet.waitConfirmation(txCreatedContract);

  //   // Applying the first Deposit
  //   let next = await runtime(adaProvider).contracts.getApplicableInputs(
  //     contractId
  //   );
  //   const txFirstTokensDeposited = await runtime(
  //     adaProvider
  //   ).contracts.applyInputs(contractId, {
  //     inputs: [pipe(next.applicable_inputs.deposits[0], Deposit.toInput)],
  //   });
  //   await runtime(adaProvider).wallet.waitConfirmation(txFirstTokensDeposited);

  //   // Applying the second Deposit
  //   next = await runtime(tokenProvider).contracts.getApplicableInputs(
  //     contractId
  //   );
  //   await runtime(tokenProvider).contracts.applyInputs(contractId, {
  //     inputs: [pipe(next.applicable_inputs.deposits[0], Deposit.toInput)],
  //   });
  //   await runtime(tokenProvider).wallet.waitConfirmation(
  //     txFirstTokensDeposited
  //   );

  //   return {
  //     contractId,
  //     runtime,
  //     adaProvider,
  //     tokenProvider,
  //   };
  // }

  it(
    "Payouts can be withdrawn",
    async () => {
      // const result = await executeSwapWithRequiredWithdrawalTillClosing();
      // const { adaProvider, tokenProvider, contractId, runtime } = result;
      // const adaProviderPayouts = await runtime(adaProvider).payouts.available(
      //   onlyByContractIds([contractId])
      // );
      // expect(adaProviderPayouts.length).toBe(1);
      // await runtime(adaProvider).payouts.withdraw([
      //   adaProviderPayouts[0].payoutId,
      // ]);
      // const tokenProviderPayouts = await runtime(
      //   tokenProvider
      // ).payouts.available(onlyByContractIds([contractId]));
      // expect(tokenProviderPayouts.length).toBe(1);
      // await runtime(tokenProvider).payouts.withdraw([
      //   tokenProviderPayouts[0].payoutId,
      // ]);
    },
    10 * MINUTES
  );
});
