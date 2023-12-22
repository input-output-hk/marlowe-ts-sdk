import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Environment, Party } from "@marlowe.io/language-core-v1";
import { tryCatchDefault, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import {
  ApplyInputsRequest,
  ContractsAPI,
  ContractsDI,
  CreateContractRequest,
} from "../api.js";

import { getAddressesAndCollaterals, WalletAPI } from "@marlowe.io/wallet/api";
import {
  PolicyId,
  ContractId,
  contractIdToTxId,
  TxId,
  AddressesAndCollaterals,
  HexTransactionWitnessSet,
  transactionWitnessSetTextEnvelope,
} from "@marlowe.io/runtime-core";

import {
  FPTSRestAPI,
  RestClient,
  ItemRange,
} from "@marlowe.io/runtime-rest-client";
import { DecodingError } from "@marlowe.io/adapter/codec";

import { Next, noNext } from "@marlowe.io/language-core-v1/next";
import {
  BuildCreateContractTxResponse,
  TransactionTextEnvelope,
} from "@marlowe.io/runtime-rest-client/contract";

export function mkContractLifecycle(
  wallet: WalletAPI,
  deprecatedRestAPI: FPTSRestAPI,
  restClient: RestClient
): ContractsAPI {
  const di = { wallet, deprecatedRestAPI, restClient };
  return {
    createContract: submitCreateTx(di),
    applyInputs: applyInputsTx(di),
    getApplicableInputs: getApplicableInputs(di),
    getContractIds: getContractIds(di),
  };
}

const submitCreateTx =
  ({ wallet, restClient }: ContractsDI) =>
  (
    createContractRequest: CreateContractRequest
  ): Promise<[ContractId, TxId]> => {
    return unsafeTaskEither(
      submitCreateTxFpTs(restClient)(wallet)(createContractRequest)
    );
  };

const applyInputsTx =
  ({ wallet, deprecatedRestAPI }: ContractsDI) =>
  async (
    contractId: ContractId,
    applyInputsRequest: ApplyInputsRequest
  ): Promise<TxId> => {
    return unsafeTaskEither(
      applyInputsTxFpTs(deprecatedRestAPI)(wallet)(contractId)(
        applyInputsRequest
      )
    );
  };

const getApplicableInputs =
  ({ wallet, deprecatedRestAPI }: ContractsDI) =>
  async (contractId: ContractId, environement: Environment): Promise<Next> => {
    const contractDetails = await unsafeTaskEither(
      deprecatedRestAPI.contracts.contract.get(contractId)
    );
    if (contractDetails.state) {
      return noNext;
    } else {
      const parties = await getParties(wallet)(
        contractDetails.roleTokenMintingPolicyId
      );
      return await unsafeTaskEither(
        deprecatedRestAPI.contracts.contract.next(contractId)(environement)(
          parties
        )
      );
    }
  };

const getContractIds =
  ({ deprecatedRestAPI, wallet }: ContractsDI) =>
  async (): Promise<ContractId[]> => {
    const partyAddresses = [
      await wallet.getChangeAddress(),
      ...(await wallet.getUsedAddresses()),
    ];
    const kwargs = { tags: [], partyAddresses, partyRoles: [] };
    const loop = async (
      acc: ContractId[],
      range?: ItemRange
    ): Promise<ContractId[]> => {
      const result = await deprecatedRestAPI.contracts.getHeadersByRange(range)(
        kwargs
      )();
      if (result._tag === "Left") throw result.left;
      const response = result.right;
      const contractIds = [
        ...acc,
        ...response.contracts.map(({ contractId }) => contractId),
      ];
      return response.page.next
        ? loop(contractIds, response.page.next)
        : contractIds;
    };
    return loop([]);
  };

const getParties: (
  walletApi: WalletAPI
) => (roleTokenMintingPolicyId: PolicyId) => Promise<Party[]> =
  (walletAPI) => async (roleMintingPolicyId) => {
    const changeAddress: Party = await walletAPI
      .getChangeAddress()
      .then((addressBech32) => ({ address: addressBech32 }));
    const usedAddresses: Party[] = await walletAPI
      .getUsedAddresses()
      .then((addressesBech32) =>
        addressesBech32.map((addressBech32) => ({
          address: addressBech32,
        }))
      );
    const roles: Party[] = (await walletAPI.getTokens())
      .filter((token) => token.assetId.policyId == roleMintingPolicyId)
      .map((token) => ({ role_token: token.assetId.policyId }));
    return roles.concat([changeAddress]).concat(usedAddresses);
  };

export const submitCreateTxFpTs: (
  client: RestClient
) => (
  wallet: WalletAPI
) => (
  createContractRequest: CreateContractRequest
) => TE.TaskEither<Error | DecodingError, [ContractId, TxId]> =
  (client) => (wallet) => (createContractRequest) =>
    pipe(
      tryCatchDefault(() => getAddressesAndCollaterals(wallet)),
      TE.chain((addressesAndCollaterals) =>
        tryCatchDefault(() =>
          client.buildCreateContractTx({
            version: "v1",

            changeAddress: addressesAndCollaterals.changeAddress,
            usedAddresses: addressesAndCollaterals.usedAddresses,
            collateralUTxOs: addressesAndCollaterals.collateralUTxOs,
            stakeAddress: createContractRequest.stakeAddress,

            contract: createContractRequest.contract,
            threadRoleName: createContractRequest.threadRoleName,
            roles: createContractRequest.roles,

            tags: createContractRequest.tags,
            metadata: createContractRequest.metadata,
            minimumLovelaceUTxODeposit:
              createContractRequest.minimumLovelaceUTxODeposit,
          })
        )
      ),
      TE.chainW(
        (buildCreateContractTxResponse: BuildCreateContractTxResponse) =>
          pipe(
            tryCatchDefault(() =>
              wallet.signTx(buildCreateContractTxResponse.tx.cborHex)
            ),
            TE.chain((hexTransactionWitnessSet) =>
              tryCatchDefault(() =>
                client.submitContract(
                  buildCreateContractTxResponse.contractId,
                  transactionWitnessSetTextEnvelope(hexTransactionWitnessSet)
                )
              )
            ),
            TE.map(() => buildCreateContractTxResponse.contractId)
          )
      ),
      TE.map((contractId) => [contractId, contractIdToTxId(contractId)])
    );

export const createContractFpTs: (
  client: RestClient
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

export const applyInputsTxFpTs: (
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
      applyInputsTxFpTs(client)(wallet)(contractId)(applyInputsRequest),
      TE.chainW((txId) =>
        tryCatchDefault(() => wallet.waitConfirmation(txId).then((_) => txId))
      )
    );
