import * as TE from "fp-ts/lib/TaskEither.js";
import * as T from "fp-ts/lib/Task.js";
import { pipe } from "fp-ts/lib/function.js";
import { mkEnvironment } from "@marlowe.io/language-core-v1/environment";
import { addMinutes, subMinutes } from "date-fns";
import { tryCatchDefault, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import { Party } from "@marlowe.io/language-core-v1/semantics/contract/common/payee/party.js";
import {
  ApplyInputsRequest,
  ContractsAPI,
  ContractsDI,
  CreateRequest,
  ProvideInput,
  RuntimeLifecycle,
} from "../api.js";

import { getAddressesAndCollaterals, WalletAPI } from "@marlowe.io/wallet/api";
import {
  PolicyId,
  ContractId,
  contractIdToTxId,
} from "@marlowe.io/runtime-core";

import { FPTSRestAPI } from "@marlowe.io/runtime-rest-client";
import { DecodingError } from "@marlowe.io/adapter/codec";
import * as Tx from "@marlowe.io/runtime-rest-client/transaction";

export function mkContractLifecycle(
  wallet: WalletAPI,
  rest: FPTSRestAPI
): ContractsAPI {
  const di = { wallet, rest };
  return {
    create: createContract(di),
    applyInputs: applyInputsToContract(di),
  };
}

const createContract =
  ({ wallet, rest }: ContractsDI) =>
  (req: CreateRequest): Promise<ContractId> => {
    return unsafeTaskEither(createContractFpTs(rest)(wallet)(req));
  };

const applyInputsToContract =
  ({ wallet, rest }: ContractsDI) =>
  async (
    contractId: ContractId,
    provideInput: ProvideInput
  ): Promise<ContractId> => {
    const contractDetails = await unsafeTaskEither(
      rest.contracts.contract.get(contractId)
    );
    const parties = await getParties(wallet)(
      contractDetails.roleTokenMintingPolicyId
    )();
    const next = await unsafeTaskEither(
      rest.contracts.contract.next(contractId)(
        mkEnvironment(pipe(Date.now(), (date) => subMinutes(date, 15)))(
          pipe(Date.now(), (date) => addMinutes(date, 15))
        )
      )(parties)
    );

    return unsafeTaskEither(
      applyInputsFpTs(rest)(wallet)(contractId)(provideInput(next))
    );
  };

const getParties: (
  walletApi: WalletAPI
) => (roleTokenMintingPolicyId: PolicyId) => T.Task<Party[]> =
  (walletAPI) => (roleMintingPolicyId) =>
    T.of([]);

export const createContractFpTs: (
  client: FPTSRestAPI
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

export const applyInputsFpTs: (
  client: FPTSRestAPI
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
