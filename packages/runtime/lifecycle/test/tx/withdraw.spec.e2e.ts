import { pipe } from "fp-ts/lib/function.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { addDays } from "date-fns/fp";

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

global.console = console;

describe("Payouts", () => {
  const restAPI = mkRestClient(getMarloweRuntimeUrl());
  const provisionScheme = {
    provider: { adaAmount: 20_000_000n },
    swapper: { adaAmount: 20_000_000n, tokenAmount: 50n, tokenName: "TokenA" },
  };

  const executeSwapWithRequiredWithdrawalTillClosing = pipe(
    provisionAnAdaAndTokenProvider(restAPI)(getBlockfrostContext())(
      getBankPrivateKey()
    )(provisionScheme),
    TE.let(`swapRequest`, ({ tokenValueMinted }) => ({
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
    })),
    TE.let(`swapContract`, ({ swapRequest }) =>
      Examples.SwapADAToken.mkSwapContract(swapRequest)
    ),
    TE.bindW(
      "contractId",
      ({ runtime, adaProvider, tokenProvider, swapRequest, swapContract }) =>
        pipe(
          runtime(adaProvider).contracts.create({
            contract: swapContract,
            roles: {
              [swapRequest.provider.roleName]: adaProvider.address,
              [swapRequest.swapper.roleName]: tokenProvider.address,
            },
          }),
          TE.chainW((contractId) =>
            runtime(adaProvider).contracts.applyInputs(contractId)((next) => ({
              inputs: [pipe(next.applicable_inputs.deposits[0], toInput)],
            }))
          ),
          TE.chainW((contractId) =>
            runtime(tokenProvider).contracts.applyInputs(contractId)(
              (next) => ({
                inputs: [pipe(next.applicable_inputs.deposits[0], toInput)],
              })
            )
          )
        )
    )
  );

  it("Payouts can be withdrawn", async () => {
    await pipe(
      executeSwapWithRequiredWithdrawalTillClosing,
      TE.bindW(
        "result",
        ({ adaProvider, tokenProvider, contractId, runtime }) =>
          TE.sequenceArray([
            pipe(
              runtime(adaProvider).payouts.available(
                onlyByContractIds([contractId])
              ),
              TE.map((payouts) => {
                expect(payouts.length).toBe(1);
                return payouts.map((payout) => payout.payoutId);
              }),
              TE.chain((payoutIds) =>
                runtime(adaProvider).payouts.withdraw(payoutIds)
              )
            ),
            pipe(
              runtime(tokenProvider).payouts.available(
                onlyByContractIds([contractId])
              ),
              TE.map((payouts) => {
                expect(payouts.length).toBe(1);
                return payouts.map((payout) => payout.payoutId);
              }),
              TE.chain((payoutIds) =>
                runtime(tokenProvider).payouts.withdraw(payoutIds)
              )
            ),
          ])
      ),
      TE.match(
        (e) => {
          console.dir(e, { depth: null });
          expect(e).not.toBeDefined();
        },
        () => {}
      )
    )();
  }, 1_000_000);
});
