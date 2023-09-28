import * as TE from "fp-ts/lib/TaskEither.js";
import { constVoid, pipe } from "fp-ts/lib/function.js";
import * as O from "fp-ts/lib/Option.js";
import { tryCatchDefault, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import { Filters, PayoutsDI, PayoutsAPI } from "../api.js";
import { getAddressesAndCollaterals, WalletAPI } from "@marlowe.io/wallet/api";
import {
  PayoutId,
  PayoutAvailable,
  AssetId,
  PayoutWithdrawn,
  Assets,
  Tokens,
  assetId,
  mkPolicyId,
  token,
  withdrawalIdToTxId,
} from "@marlowe.io/runtime-core";

import { FPTSRestAPI } from "@marlowe.io/runtime-rest-client";

import * as Rest from "@marlowe.io/runtime-rest-client";

import { DecodingError } from "@marlowe.io/adapter/codec";
import { stringify } from "json-bigint";

export function mkPayoutLifecycle(
  wallet: WalletAPI,
  rest: FPTSRestAPI
): PayoutsAPI {
  const di = { wallet, rest };
  return {
    available: fetchAvailablePayouts(di),
    withdraw: withdrawPayouts(di),
    withdrawn: fetchWithdrawnPayouts(di),
  };
}

const fetchAvailablePayouts =
  ({ wallet, rest }: PayoutsDI) =>
  (filters?: Filters): Promise<PayoutAvailable[]> => {
    return unsafeTaskEither(
      fetchAvailablePayoutsFpTs(rest)(wallet)(O.fromNullable(filters))
    );
  };
const withdrawPayouts =
  ({ wallet, rest }: PayoutsDI) =>
  (payoutIds: PayoutId[]): Promise<void> => {
    return unsafeTaskEither(withdrawPayoutsFpTs(rest)(wallet)(payoutIds));
  };
const fetchWithdrawnPayouts =
  ({ wallet, rest }: PayoutsDI) =>
  (filters?: Filters): Promise<PayoutWithdrawn[]> => {
    return unsafeTaskEither(
      fetchWithdrawnPayoutsFpTs(rest)(wallet)(O.fromNullable(filters))
    );
  };

const fetchAvailablePayoutsFpTs: (
  restAPI: FPTSRestAPI
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

const fetchWithdrawnPayoutsFpTs: (
  restAPI: FPTSRestAPI
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

export const withdrawPayoutsFpTs: (
  client: FPTSRestAPI
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
            wallet.signTx(withdrawalTextEnvelope.tx.cborHex)
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
