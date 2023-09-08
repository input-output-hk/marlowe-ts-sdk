import * as Command from "./tx.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as E from "fp-ts/lib/Either.js";
import * as T from "fp-ts/lib/Task.js";
import { pipe } from "fp-ts/lib/function.js";
import * as O from "fp-ts/lib/Option.js";
import { mkEnvironment } from "@marlowe.io/language-core-v1/environment";
import { addMinutes, subMinutes } from "date-fns";
import { tryCatchDefault, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import { Party } from "@marlowe.io/language-core-v1/semantics/contract/common/payee/party.js";
import {
  ContractsAPI,
  Filters,
  PayoutsAPI,
  RuntimeLifecycle,
} from "../../apis/runtimeLifecycle.js";
import { CreateRequest, ProvideInput } from "../../apis/tx.js";
import { WalletAPI } from "@marlowe.io/wallet/api";
import {
  PolicyId,
  ContractId,
  PayoutId,
  PayoutAvailable,
  AssetId,
  PayoutWithdrawn,
  unPolicyId,
  Assets,
  Tokens,
  assetId,
  mkPolicyId,
  token,
} from "@marlowe.io/runtime-core";

import { RestAPI } from "@marlowe.io/runtime-rest-client";

import * as Rest from "@marlowe.io/runtime-rest-client";

import { DecodingError } from "@marlowe.io/adapter/codec";
import { stringify } from "json-bigint";

class ContractLifecycle implements ContractsAPI {
  constructor(private wallet: WalletAPI, private rest: RestAPI) {}
  async create(req: CreateRequest): Promise<ContractId> {
    return unsafeTaskEither(Command.create(this.rest)(this.wallet)(req));
  }

  async applyInputs(
    contractId: ContractId,
    provideInput: ProvideInput
  ): Promise<ContractId> {
    const contractDetails = await unsafeTaskEither(
      this.rest.contracts.contract.get(contractId)
    );
    const parties = await getParties(this.wallet)(
      contractDetails.roleTokenMintingPolicyId
    )();
    const next = await unsafeTaskEither(
      this.rest.contracts.contract.next(contractId)(
        mkEnvironment(pipe(Date.now(), (date) => subMinutes(date, 15)))(
          pipe(Date.now(), (date) => addMinutes(date, 15))
        )
      )(parties)
    );

    return unsafeTaskEither(
      Command.applyInputs(this.rest)(this.wallet)(contractId)(
        provideInput(next)
      )
    );
  }
}

class PayoutLifecycle implements PayoutsAPI {
  constructor(private wallet: WalletAPI, private rest: RestAPI) {}

  async available(filters?: Filters): Promise<PayoutAvailable[]> {
    return unsafeTaskEither(
      availablePayouts(this.rest)(this.wallet)(O.fromNullable(filters))
    );
  }

  async withdraw(payoutIds: PayoutId[]): Promise<void> {
    return unsafeTaskEither(
      Command.withdraw(this.rest)(this.wallet)(payoutIds)
    );
  }

  async withdrawn(filters?: Filters): Promise<PayoutWithdrawn[]> {
    return unsafeTaskEither(
      withdrawnPayouts(this.rest)(this.wallet)(O.fromNullable(filters))
    );
  }
}

export function mkRuntimeLifecycle(
  restAPI: RestAPI,
  wallet: WalletAPI
): RuntimeLifecycle {
  return {
    wallet: wallet,
    contracts: new ContractLifecycle(wallet, restAPI),
    payouts: new PayoutLifecycle(wallet, restAPI),
  };
}
const availablePayouts: (
  restAPI: RestAPI
) => (
  walletApi: WalletAPI
) => (
  filtersOption: O.Option<Filters>
) => TE.TaskEither<Error | DecodingError, PayoutAvailable[]> =
  (restAPI) => (walletApi) => (filtersOption) =>
    pipe(
      getAssetIds(walletApi),
      TE.chain((walletAssetIds) =>
        pipe(
          restAPI.payouts.getHeadersByRange(O.none)(
            pipe(
              filtersOption,
              O.match(
                () => [],
                (filters) => filters.byContractIds
              )
            )
          )(
            pipe(
              filtersOption,
              O.match(
                () => walletAssetIds,
                (filters) => filters.byMyRoleTokens(walletAssetIds)
              )
            )
          )(O.some("available")),
          TE.map((result) => result.headers)
        )
      ),
      TE.chain((headers) =>
        TE.sequenceArray(
          headers.map((header) => restAPI.payouts.get(header.payoutId))
        )
      ),
      TE.map((payoutsDetails) =>
        payoutsDetails.map((payoutDetails) => ({
          payoutId: payoutDetails.payoutId,
          contractId: payoutDetails.contractId,
          role: payoutDetails.role,
          assets: convertAsset(payoutDetails.assets),
        }))
      )
    );

const withdrawnPayouts: (
  restAPI: RestAPI
) => (
  walletApi: WalletAPI
) => (
  filtersOption: O.Option<Filters>
) => TE.TaskEither<Error | DecodingError, PayoutWithdrawn[]> =
  (restAPI) => (walletApi) => (filtersOption) =>
    pipe(
      getAssetIds(walletApi),
      TE.chain((walletAssetIds) =>
        pipe(
          restAPI.payouts.getHeadersByRange(O.none)(
            pipe(
              filtersOption,
              O.match(
                () => [],
                (filters) => filters.byContractIds
              )
            )
          )(
            pipe(
              filtersOption,
              O.match(
                () => walletAssetIds,
                (filters) => filters.byMyRoleTokens(walletAssetIds)
              )
            )
          )(O.some("withdrawn")),
          TE.map((result) => result.headers)
        )
      ),
      TE.chain((headers) =>
        TE.sequenceArray(
          headers.map((header) => restAPI.payouts.get(header.payoutId))
        )
      ),
      TE.map((payoutsDetails) =>
        payoutsDetails.map((payoutDetails) =>
          pipe(
            payoutDetails.withdrawalId,
            O.match(
              () => {
                throw `Rest API Inconsistencies for Payout API (payout withdrawn without a withdrawalID) : ${stringify(
                  payoutDetails
                )}`;
              },
              (withdrawalId) => ({
                withdrawalId: withdrawalId,
                payoutId: payoutDetails.payoutId,
                contractId: payoutDetails.contractId,
                role: payoutDetails.role,
                assets: convertAsset(payoutDetails.assets),
              })
            )
          )
        )
      )
    );

const convertAsset: (assets: Rest.Assets) => Assets = (restAssets) => ({
  lovelaces: restAssets.lovelace,
  tokens: convertTokens(restAssets.tokens),
});

const convertTokens: (tokens: Rest.Tokens) => Tokens = (restTokens) =>
  Object.entries(restTokens)
    .map(([policyId, x]) =>
      Object.entries(x).map(([assetName, quantity]) =>
        token(quantity)(assetId(mkPolicyId(policyId))(assetName))
      )
    )
    .flat();

const getAssetIds: (walletApi: WalletAPI) => TE.TaskEither<Error, AssetId[]> = (
  walletAPI
) =>
  pipe(
    tryCatchDefault(walletAPI.getTokens),
    TE.map((tokens) => tokens.map((token) => token.assetId))
  );

const getParties: (
  walletApi: WalletAPI
) => (roleTokenMintingPolicyId: PolicyId) => T.Task<Party[]> =
  (walletAPI) => (roleMintingPolicyId) =>
    T.of([]);
