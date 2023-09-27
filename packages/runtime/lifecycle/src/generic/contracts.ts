import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { mkEnvironment, Party } from "@marlowe.io/language-core-v1";
import { addMinutes, subMinutes } from "date-fns";
import { tryCatchDefault, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import {
  ApplyInputsRequest,
  ContractsAPI,
  ContractsDI,
  CreateRequest,
  ProvideInput,
} from "../api.js";

import { getAddressesAndCollaterals, WalletAPI } from "@marlowe.io/wallet/api";
import {
  PolicyId,
  ContractId,
  contractIdToTxId,
  TxId,
  AddressesAndCollaterals,
  HexTransactionWitnessSet,
  unAddressBech32,
  unPolicyId,
} from "@marlowe.io/runtime-core";

import { FPTSRestAPI } from "@marlowe.io/runtime-rest-client";
import { DecodingError } from "@marlowe.io/adapter/codec";
import { TransactionTextEnvelope } from "@marlowe.io/runtime-rest-client/contract/transaction/endpoints/collection";
import { Next } from "@marlowe.io/language-core-v1/next";

export function mkContractLifecycle(
  wallet: WalletAPI,
  rest: FPTSRestAPI
): ContractsAPI {
  const di = { wallet, rest };
  return {
    submitCreateTx: submitCreateTx(di),
    create: create(di),
    submitApplyInputsTx: submitApplyInputsTx(di),
    getNext: getNext(di),
    applyInputs: applyInputs(di),
    waitConfirmation: wallet.waitConfirmation,
  };
}

const submitCreateTx =
  ({ wallet, rest }: ContractsDI) =>
  (req: CreateRequest): Promise<[ContractId, TxId]> => {
    return unsafeTaskEither(submitCreateTxFpTs(rest)(wallet)(req));
  };

const create =
  ({ wallet, rest }: ContractsDI) =>
  (req: CreateRequest): Promise<ContractId> => {
    return unsafeTaskEither(createContractFpTs(rest)(wallet)(req));
  };

const submitApplyInputsTx =
  ({ wallet, rest }: ContractsDI) =>
  async (
    contractId: ContractId,
    request: ApplyInputsRequest
  ): Promise<TxId> => {
    return unsafeTaskEither(
      submitApplyInputsTxFpTs(rest)(wallet)(contractId)(request)
    );
  };

const getNext =
  ({ wallet, rest }: ContractsDI) =>
  async (contractId: ContractId): Promise<Next> => {
    const contractDetails = await unsafeTaskEither(
      rest.contracts.contract.get(contractId)
    );
    const parties = await getParties(wallet)(
      contractDetails.roleTokenMintingPolicyId
    );
    return await unsafeTaskEither(
      rest.contracts.contract.next(contractId)(
        mkEnvironment(pipe(Date.now(), (date) => subMinutes(date, 15)))(
          pipe(Date.now(), (date) => addMinutes(date, 15))
        )
      )(parties)
    );
  };

const applyInputs =
  ({ wallet, rest }: ContractsDI) =>
  async (contractId: ContractId, provideInput: ProvideInput): Promise<TxId> => {
    const next = await getNext({ wallet, rest })(contractId);
    return unsafeTaskEither(
      applyInputsFpTs(rest)(wallet)(contractId)(provideInput(next))
    );
  };

const getParties: (
  walletApi: WalletAPI
) => (roleTokenMintingPolicyId: PolicyId) => Promise<Party[]> =
  (walletAPI) => async (roleMintingPolicyId) => {
    const changeAddress: Party = await walletAPI
      .getChangeAddress()
      .then((addressBech32) => ({ address: unAddressBech32(addressBech32) }));
    const usedAddresses: Party[] = await walletAPI
      .getUsedAddresses()
      .then((addressesBech32) =>
        addressesBech32.map((addressBech32) => ({
          address: unAddressBech32(addressBech32),
        }))
      );
    const roles: Party[] = (await walletAPI.getTokens())
      .filter((token) => token.assetId.policyId == roleMintingPolicyId)
      .map((token) => ({ role_token: unPolicyId(token.assetId.policyId) }));
    return roles.concat([changeAddress]).concat(usedAddresses);
  };

export const submitCreateTxFpTs: (
  client: FPTSRestAPI
) => (
  wallet: WalletAPI
) => (
  payload: CreateRequest
) => TE.TaskEither<Error | DecodingError, [ContractId, TxId]> =
  (client) => (wallet) => (request) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals) =>
        client.contracts.post(
          {
            contract: request.contract,
            version: "v1",
            roles: request.roles,
            tags: request.tags ? request.tags : {},
            metadata: request.metadata ? request.metadata : {},
            minUTxODeposit: request.minUTxODeposit
              ? request.minUTxODeposit
              : 3_000_000,
          },
          addressesAndCollaterals
        )
      ),
      TE.chainW((contractTextEnvelope) =>
        pipe(
          tryCatchDefault(() => wallet.signTx(contractTextEnvelope.tx.cborHex)),
          TE.chain((hexTransactionWitnessSet) =>
            client.contracts.contract.put(
              contractTextEnvelope.contractId,
              hexTransactionWitnessSet
            )
          ),
          TE.map(() => contractTextEnvelope.contractId)
        )
      ),
      TE.map((contractId) => [contractId, contractIdToTxId(contractId)])
    );

export const createContractFpTs: (
  client: FPTSRestAPI
) => (
  wallet: WalletAPI
) => (
  payload: CreateRequest
) => TE.TaskEither<Error | DecodingError, ContractId> =
  (client) => (wallet) => (request) =>
    pipe(
      submitCreateTxFpTs(client)(wallet)(request),
      TE.chainW(([contractId, txId]) =>
        tryCatchDefault(() =>
          wallet.waitConfirmation(txId).then((_) => contractId)
        )
      )
    );

export const submitApplyInputsTxFpTs: (
  client: FPTSRestAPI
) => (
  wallet: WalletAPI
) => (
  contractId: ContractId
) => (
  payload: ApplyInputsRequest
) => TE.TaskEither<Error | DecodingError, TxId> =
  (client) => (wallet) => (contractId) => (payload) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals: AddressesAndCollaterals) =>
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
      TE.chainW((transactionTextEnvelope: TransactionTextEnvelope) =>
        pipe(
          tryCatchDefault(() =>
            wallet.signTx(transactionTextEnvelope.tx.cborHex)
          ),
          TE.chain((hexTransactionWitnessSet: HexTransactionWitnessSet) =>
            client.contracts.contract.transactions.transaction.put(
              contractId,
              transactionTextEnvelope.transactionId,
              hexTransactionWitnessSet
            )
          ),
          TE.map(() => transactionTextEnvelope.transactionId)
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
) => TE.TaskEither<Error | DecodingError, TxId> =
  (client) => (wallet) => (contractId) => (request) =>
    pipe(
      submitApplyInputsTxFpTs(client)(wallet)(contractId)(request),
      TE.chainW((txId) =>
        tryCatchDefault(() => wallet.waitConfirmation(txId).then((_) => txId))
      )
    );
