import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";

import { Deposit } from "@marlowe.io/language-core-v1/next";

import {
  datetoTimeout,
  adaValue,
  Input,
  MarloweState,
} from "@marlowe.io/language-core-v1";

import { setUp } from "../provisionning.js";
import console from "console";
import {
  ContractId,
  runtimeTokenToMarloweTokenValue,
} from "@marlowe.io/runtime-core";
import { onlyByContractIds } from "@marlowe.io/runtime-lifecycle/api";
import { MINUTES } from "@marlowe.io/adapter/time";
import {
  ContractDetails,
  mintRole,
} from "@marlowe.io/runtime-rest-client/contract";
import { AtomicSwap } from "@marlowe.io/language-examples";
import { RestClient } from "@marlowe.io/runtime-rest-client";
import {
  generateSeedPhrase,
  logInfo,
  logWalletInfo,
  readTestConfiguration,
} from "@marlowe.io/testing-kit";
import { AxiosError } from "axios";
import { MarloweJSON } from "@marlowe.io/adapter/codec";

global.console = console;

describe("swap", () => {
  it(
    "can execute the nominal case",
    async () => {
      try {
        const { bank, runtime, provisionResponse } =
          await readTestConfiguration().then((config) =>
            setUp(config, {
              seller: [
                generateSeedPhrase("24-words"),
                {
                  lovelacesToTransfer: 25_000_000n,
                  assetsToMint: { tokenA: 15n },
                },
              ],
              buyer: [
                generateSeedPhrase("24-words"),
                {
                  lovelacesToTransfer: 25_000_000n,
                  assetsToMint: { tokenB: 10n },
                },
              ],
            })
          );
        await bank.waitRuntimeSyncingTillCurrentWalletTip(runtime.client);
        logInfo("Set up Complete");
        const { seller, buyer } = provisionResponse;
        await logWalletInfo("seller", seller.wallet);
        await logWalletInfo("buyer", buyer.wallet);

        const sellerAddress = await seller.wallet.getChangeAddress();
        const scheme: AtomicSwap.Scheme = {
          offer: {
            seller: { address: sellerAddress },
            deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
            asset: runtimeTokenToMarloweTokenValue(
              seller.assetsProvisionned.tokens[0]
            ),
          },
          ask: {
            buyer: { role_token: "buyer" },
            deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
            asset: runtimeTokenToMarloweTokenValue(
              buyer.assetsProvisionned.tokens[0]
            ),
          },
          swapConfirmation: {
            deadline: pipe(addDays(Date.now(), 1), datetoTimeout),
          },
        };

        const swapContract = AtomicSwap.mkContract(scheme);
        logInfo(`contract: ${MarloweJSON.stringify(swapContract)}`);
        const [contractId, txCreatedContract] = await runtime
          .mkLifecycle(seller.wallet)
          .contracts.createContract({
            contract: swapContract,
            roles: {
              [scheme.ask.buyer.role_token]: sellerAddress,
            },
          });
        logInfo("Contract Created");
        await seller.wallet.waitConfirmation(txCreatedContract);
        await seller.wallet.waitRuntimeSyncingTillCurrentWalletTip(
          runtime.client
        );
      } catch (e) {
        const error = e as AxiosError;
        console.log(`catched : ${JSON.stringify(error.response?.data)}`);
        console.log(`catched : ${JSON.stringify(error)}`);
        expect(true).toBe(false);
      }
      // const inputHistory = await getInputHistory(restClient, contractId);
      // const marloweState = await getMarloweStatefromAnActiveContract(
      //   restClient,
      //   contractId
      // );
      // const contractState = AtomicSwap.getActiveState(
      //   scheme,
      //   inputHistory,
      //   marloweState
      // );
      // const availableActions = AtomicSwap.getAvailableActions(
      //   scheme,
      //   contractState
      // );
      // expect(contractState.typeName).toBe("WaitingSellerOffer");
      // expect(availableActions.length).toBe(1);

      // // Applying the first Deposit
      // let next = await runtime(adaProvider).contracts.getApplicableInputs(
      //   contractId
      // );
      // const txFirstTokensDeposited = await runtime(
      //   adaProvider
      // ).contracts.applyInputs(contractId, {
      //   inputs: [pipe(next.applicable_inputs.deposits[0], Deposit.toInput)],
      // });
      // await runtime(adaProvider).wallet.waitConfirmation(
      //   txFirstTokensDeposited
      // );

      // // Applying the second Deposit
      // next = await runtime(tokenProvider).contracts.getApplicableInputs(
      //   contractId
      // );
      // await runtime(tokenProvider).contracts.applyInputs(contractId, {
      //   inputs: [pipe(next.applicable_inputs.deposits[0], Deposit.toInput)],
      // });
      // await runtime(tokenProvider).wallet.waitConfirmation(
      //   txFirstTokensDeposited
      // );

      // // Retrieving Payouts
      // const adaProviderAvalaiblePayouts = await runtime(
      //   adaProvider
      // ).payouts.available(onlyByContractIds([contractId]));
      // expect(adaProviderAvalaiblePayouts.length).toBe(1);
      // await runtime(adaProvider).payouts.withdraw([
      //   adaProviderAvalaiblePayouts[0].payoutId,
      // ]);
      // const adaProviderWithdrawn = await runtime(adaProvider).payouts.withdrawn(
      //   onlyByContractIds([contractId])
      // );
      // expect(adaProviderWithdrawn.length).toBe(1);

      // const tokenProviderAvalaiblePayouts = await runtime(
      //   tokenProvider
      // ).payouts.available(onlyByContractIds([contractId]));
      // expect(tokenProviderAvalaiblePayouts.length).toBe(1);
      // await runtime(tokenProvider).payouts.withdraw([
      //   tokenProviderAvalaiblePayouts[0].payoutId,
      // ]);
      // const tokenProviderWithdrawn = await runtime(
      //   tokenProvider
      // ).payouts.withdrawn(onlyByContractIds([contractId]));
      // expect(tokenProviderWithdrawn.length).toBe(1);
    },
    10 * MINUTES
  );
});

const shouldBeAnActiveContract = (state?: MarloweState): MarloweState => {
  if (state) return state;
  else throw new Error("Contract retrieved is not Active");
};

const getMarloweStatefromAnActiveContract = (
  restClient: RestClient,
  contractId: ContractId
): Promise<MarloweState> =>
  restClient
    .getContractById(contractId)
    .then((contractDetails) => shouldBeAnActiveContract(contractDetails.state));

// new data type that timeInterval + single input
// > array[SingleInputTx]
const getInputHistory = (
  restClient: RestClient,
  contractId: ContractId
): Promise<Input[]> =>
  restClient
    .getTransactionsForContract(contractId)
    .then((result) =>
      Promise.all(
        result.transactions.map((transaction) =>
          restClient.getContractTransactionById(
            contractId,
            transaction.transactionId
          )
        )
      )
    )
    .then((txsDetails) =>
      txsDetails.map((txDetails) => txDetails.inputs).flat()
    );
