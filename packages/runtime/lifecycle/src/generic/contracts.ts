import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Environment, Party } from "@marlowe.io/language-core-v1";
import { tryCatchDefault, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import {
  ApplyInputsRequest,
  ContractsAPI,
  ContractsDI,
  CreateContractRequest,
  minUTxODepositDefault,
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
import { Next, noNext } from "@marlowe.io/language-core-v1/next";
import { isNone, none, Option } from "fp-ts/lib/Option.js";
import { ContractsRange } from "@marlowe.io/runtime-rest-client/contract/index";

export function mkContractLifecycle(
  wallet: WalletAPI,
  rest: FPTSRestAPI
): ContractsAPI {
  const di = { wallet, rest };
  return {
    createContract: submitCreateTx(di),
    applyInputs: submitApplyInputsTx(di),
    getApplicableInputs: getApplicableInputs(di),
    getContractIds: getContractIds(di),
  };
}

const submitCreateTx =
  ({ wallet, rest }: ContractsDI) =>
  (
    createContractRequest: CreateContractRequest
  ): Promise<[ContractId, TxId]> => {
    return unsafeTaskEither(
      submitCreateTxFpTs(rest)(wallet)(createContractRequest)
    );
  };

const submitApplyInputsTx =
  ({ wallet, rest }: ContractsDI) =>
  async (
    contractId: ContractId,
    applyInputsRequest: ApplyInputsRequest
  ): Promise<TxId> => {
    return unsafeTaskEither(
      submitApplyInputsTxFpTs(rest)(wallet)(contractId)(applyInputsRequest)
    );
  };

const getApplicableInputs =
  ({ wallet, rest }: ContractsDI) =>
  async (contractId: ContractId, environement: Environment): Promise<Next> => {
    const contractDetails = await unsafeTaskEither(
      rest.contracts.contract.get(contractId)
    );
    if (isNone(contractDetails.currentContract)) {
      return noNext;
    } else {
      const parties = await getParties(wallet)(
        contractDetails.roleTokenMintingPolicyId
      );
      return await unsafeTaskEither(
        rest.contracts.contract.next(contractId)(environement)(parties)
      );
    }
  };

const getContractIds =
  ({ rest, wallet }: ContractsDI) =>
  async (): Promise<ContractId[]> => {
    const partyAddresses = [
      await wallet.getChangeAddress(),
      ...(await wallet.getUsedAddresses()),
    ];
    const kwargs = { tags: [], partyAddresses, partyRoles: [] };
    const loop = async (
      range: Option<ContractsRange>,
      acc: ContractId[]
    ): Promise<ContractId[]> => {
      const result = await rest.contracts.getHeadersByRange(range)(kwargs)();
      if (result._tag === "Left") throw result.left;
      const response = result.right;
      const contractIds = [
        ...acc,
        ...response.headers.map(({ contractId }) => contractId),
      ];
      return response.nextRange._tag === "None"
        ? contractIds
        : loop(response.nextRange, contractIds);
    };
    return loop(none, []);
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
  createContractRequest: CreateContractRequest
) => TE.TaskEither<Error | DecodingError, [ContractId, TxId]> =
  (client) => (wallet) => (createContractRequest) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals) =>
        client.contracts.post(
          {
            contract: createContractRequest.contract,
            version: "v1",
            roles: createContractRequest.roles,
            tags: createContractRequest.tags ? createContractRequest.tags : {},
            metadata: createContractRequest.metadata
              ? createContractRequest.metadata
              : {},
            minUTxODeposit: createContractRequest.minUTxODeposit
              ? createContractRequest.minUTxODeposit
              : minUTxODepositDefault,
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
  createContractRequest: CreateContractRequest
) => TE.TaskEither<Error | DecodingError, ContractId> =
  (client) => (wallet) => (createContractRequest) =>
    pipe(
      submitCreateTxFpTs(client)(wallet)(createContractRequest),
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
  applyInputsRequest: ApplyInputsRequest
) => TE.TaskEither<Error | DecodingError, TxId> =
  (client) => (wallet) => (contractId) => (applyInputsRequest) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals: AddressesAndCollaterals) =>
        client.contracts.contract.transactions.post(
          contractId,
          {
            inputs: applyInputsRequest.inputs,
            version: "v1",
            tags: applyInputsRequest.tags ? applyInputsRequest.tags : {},
            metadata: applyInputsRequest.metadata
              ? applyInputsRequest.metadata
              : {},
            invalidBefore: applyInputsRequest.invalidBefore,
            invalidHereafter: applyInputsRequest.invalidHereafter,
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
  applyInputsRequest: ApplyInputsRequest
) => TE.TaskEither<Error | DecodingError, TxId> =
  (client) => (wallet) => (contractId) => (applyInputsRequest) =>
    pipe(
      submitApplyInputsTxFpTs(client)(wallet)(contractId)(applyInputsRequest),
      TE.chainW((txId) =>
        tryCatchDefault(() => wallet.waitConfirmation(txId).then((_) => txId))
      )
    );
