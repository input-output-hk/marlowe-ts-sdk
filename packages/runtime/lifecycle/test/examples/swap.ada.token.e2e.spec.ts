import { pipe } from "fp-ts/lib/function.js";
import { addDays } from "date-fns";

import {
  datetoTimeout,
  Input,
  MarloweState,
} from "@marlowe.io/language-core-v1";

import console from "console";
import {
  ContractId,
  runtimeTokenToMarloweTokenValue,
} from "@marlowe.io/runtime-core";
import { MINUTES } from "@marlowe.io/adapter/time";
import { AtomicSwap } from "@marlowe.io/language-examples";
import { RestClient } from "@marlowe.io/runtime-rest-client";
import {
  generateSeedPhrase,
  logDebug,
  logInfo,
  logWalletInfo,
  readEnvConfigurationFile,mkTestEnvironment
} from "@marlowe.io/testing-kit";
import { AxiosError } from "axios";
import { MarloweJSON } from "@marlowe.io/adapter/codec";


global.console = console;

describe("swap", () => {
  it(
    "can execute the nominal case",
    async () => {
      try {
        const { bank, runtime, participants } =
          await readEnvConfigurationFile().then(mkTestEnvironment(
            {
              seller: {
                walletSeedPhrase: generateSeedPhrase("24-words"),
                scheme: {
                  lovelacesToTransfer: 25_000_000n,
                  assetsToMint: { tokenA: 15n },
                },
              },
              buyer: {
                walletSeedPhrase: generateSeedPhrase("24-words"),
                scheme: {
                  lovelacesToTransfer: 25_000_000n,
                  assetsToMint: { tokenB: 10n },
                },
              },
            }
          ));

        const { seller, buyer } = participants;

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
        logDebug(`contract: ${MarloweJSON.stringify(swapContract,null,4)}`);

        const [contractId, txCreatedContract] = await runtime
          .mkLifecycle(seller.wallet)
          .contracts.createContract({
            contract: swapContract,
            minimumLovelaceUTxODeposit: 3_000_000,
            roles: {
              [scheme.ask.buyer.role_token]: sellerAddress,
            },
          });
        logInfo("Contract Created");
        await seller.wallet.waitConfirmation(txCreatedContract);
        await seller.wallet.waitRuntimeSyncingTillCurrentWalletTip(
          runtime.client
        );
      // TODO : Completing the Test
      //   const inputHistory = await getInputHistory(runtime.client, contractId);
      //   const marloweState = await getMarloweStatefromAnActiveContract(
      //     runtime.client,
      //     contractId
      //   );
      //   const contractState = AtomicSwap.getActiveState(
      //     scheme,
      //     inputHistory,
      //     marloweState
      //   );
      //   const availableActions = AtomicSwap.getAvailableActions(
      //     scheme,
      //     contractState
      //   );
      //   expect(contractState.typeName).toBe("WaitingSellerOffer");
      //   expect(availableActions.length).toBe(1);

      // // // Applying the first Deposit
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
    } catch (e) {
      console.log(`catched : ${JSON.stringify(e)}`);
      const error = e as AxiosError;
      console.log(`catched : ${JSON.stringify(error.response?.data)}`);
      expect(true).toBe(false);
    }
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
