import * as TE from "fp-ts/lib/TaskEither.js";

import { constVoid, pipe } from "fp-ts/lib/function.js";
import { RestAPI } from "@marlowe.io/runtime-rest-client/index.js";
import { WalletAPI, getAddressesAndCollaterals } from "@marlowe.io/wallet/api";
import { DecodingError } from "@marlowe.io/adapter/codec";
import { CreateRequest, ApplyInputsRequest } from "../../apis/tx.js";
import {
  ContractId,
  PayoutId,
  contractIdToTxId,
  withdrawalIdToTxId,
} from "@marlowe.io/runtime-core";

import * as Tx from "@marlowe.io/runtime-rest-client/transaction";
import { tryCatchDefault } from "@marlowe.io/adapter/fp-ts";

export const create: (
  client: RestAPI
) => (
  wallet: WalletAPI
) => (
  payload: CreateRequest
) => TE.TaskEither<Error | DecodingError, ContractId> =
  (client) => (wallet) => (payload) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals) =>
        client.contracts.post(
          {
            contract: payload.contract,
            version: "v1",
            roles: payload.roles,
            tags: payload.tags ? payload.tags : {},
            metadata: payload.metadata ? payload.metadata : {},
            minUTxODeposit: payload.minUTxODeposit
              ? payload.minUTxODeposit
              : 3_000_000,
          },
          addressesAndCollaterals
        )
      ),
      TE.chainW((contractTextEnvelope) =>
        pipe(
          tryCatchDefault(() =>
            wallet.signTxTheCIP30Way(contractTextEnvelope.tx.cborHex)
          ),
          TE.chain((hexTransactionWitnessSet) =>
            client.contracts.contract.put(
              contractTextEnvelope.contractId,
              hexTransactionWitnessSet
            )
          ),
          TE.map(() => contractTextEnvelope.contractId)
        )
      ),
      TE.chainFirstW((contractId) =>
        tryCatchDefault(() =>
          wallet.waitConfirmation(pipe(contractId, contractIdToTxId))
        )
      )
    );

export const applyInputs: (
  client: RestAPI
) => (
  wallet: WalletAPI
) => (
  contractId: ContractId
) => (
  payload: ApplyInputsRequest
) => TE.TaskEither<Error | DecodingError, ContractId> =
  (client) => (wallet) => (contractId) => (payload) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals) =>
        client.contracts.contract.transactions.post(
          contractId,
          {
            inputs: payload.inputs,
            version: "v1",
            tags: payload.tags ? payload.tags : {},
            metadata: payload.metadata ? payload.metadata : {},
            invalidBefore: payload.invalidBefore,
            invalidHereafter: payload.invalidHereafter,
          },
          addressesAndCollaterals
        )
      ),
      TE.chainW((transactionTextEnvelope) =>
        pipe(
          tryCatchDefault(() =>
            wallet.signTxTheCIP30Way(transactionTextEnvelope.tx.cborHex)
          ),
          TE.chain((hexTransactionWitnessSet) =>
            client.contracts.contract.transactions.transaction.put(
              contractId,
              transactionTextEnvelope.transactionId,
              hexTransactionWitnessSet
            )
          ),
          TE.map(() => transactionTextEnvelope.transactionId)
        )
      ),
      TE.chainFirstW((transactionId) =>
        tryCatchDefault(() =>
          wallet.waitConfirmation(pipe(transactionId, Tx.idToTxId))
        )
      ),
      TE.map(() => contractId)
    );

export const withdraw: (
  client: RestAPI
) => (
  wallet: WalletAPI
) => (payoutIds: PayoutId[]) => TE.TaskEither<Error | DecodingError, void> =
  (client) => (wallet) => (payoutIds) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals) =>
        client.withdrawals.post(payoutIds, addressesAndCollaterals)
      ),
      TE.chainW((withdrawalTextEnvelope) =>
        pipe(
          tryCatchDefault(() =>
            wallet.signTxTheCIP30Way(withdrawalTextEnvelope.tx.cborHex)
          ),
          TE.chain((hexTransactionWitnessSet) =>
            client.withdrawals.withdrawal.put(
              withdrawalTextEnvelope.withdrawalId,
              hexTransactionWitnessSet
            )
          ),
          TE.map(() => withdrawalTextEnvelope.withdrawalId)
        )
      ),
      TE.chainFirstW((withdrawalId) =>
        tryCatchDefault(() =>
          wallet.waitConfirmation(pipe(withdrawalId, withdrawalIdToTxId))
        )
      ),
      TE.map(constVoid)
    );
