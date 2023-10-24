import { AxiosInstance } from "axios";

import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts/lib/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";

import { Newtype, iso } from "newtype-ts";
import { fromNewtype, optionFromNullable } from "io-ts-types";

import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import * as HTTP from "@marlowe.io/adapter/http";
import { DecodingError } from "@marlowe.io/adapter/codec";

import {
  AddressBech32,
  AddressesAndCollaterals,
  AssetId,
  PayoutId,
  TextEnvelopeGuard,
  TxOutRef,
  WithdrawalId,
  unAddressBech32,
  unPolicyId,
  unTxOutRef,
} from "@marlowe.io/runtime-core";

import { WithdrawalHeader } from "../header.js";
import { stringify } from "qs";

export interface WithdrawalsRange
  extends Newtype<{ readonly WithdrawalsRange: unique symbol }, string> {}
export const WithdrawalsRange = fromNewtype<WithdrawalsRange>(t.string);
export const unWithdrawalsRange = iso<WithdrawalsRange>().unwrap;
export const contractsRange = iso<WithdrawalsRange>().wrap;

export type GetWithdrawalsRequest = {
  range?: WithdrawalsRange;
  partyRoles?: AssetId[];
};

export type GETHeadersByRange = (
  request?: GetWithdrawalsRequest
) => TE.TaskEither<Error | DecodingError, GetWithdrawalsResponse>;

const roleToParameter = (roleToken: AssetId) =>
  `${unPolicyId(roleToken.policyId)}.${roleToken.assetName}`;

/**
 * @see {@link https://docs.marlowe.iohk.io/api/get-withdrawals}
 */
export const getHeadersByRangeViaAxios: (
  axiosInstance: AxiosInstance
) => GETHeadersByRange = (axiosInstance) => (request) =>
  pipe(
    HTTP.GetWithDataAndHeaders(axiosInstance)(
      `/withdrawals${
        request && request.partyRoles
          ? stringify(
              { partyRole: request.partyRoles.map(roleToParameter) },
              { indices: false }
            )
          : ""
      }`,
      request && request.range
        ? { headers: { Range: unWithdrawalsRange(request.range) } }
        : {}
    ),
    TE.map(([headers, data]) => ({
      data: data,
      previousRange: headers["prev-range"],
      nextRange: headers["next-range"],
    })),
    TE.chainW((data) =>
      TE.fromEither(
        E.mapLeft(formatValidationErrors)(GETByRangeRawResponse.decode(data))
      )
    ),
    TE.map((rawResponse) => ({
      headers: pipe(
        rawResponse.data.results,
        A.map((result) => result.resource)
      ),
      previousRange: rawResponse.previousRange,
      nextRange: rawResponse.nextRange,
    }))
  );

type GETByRangeRawResponse = t.TypeOf<typeof GETByRangeRawResponse>;
const GETByRangeRawResponse = t.type({
  data: t.type({
    results: t.array(
      t.type({
        links: t.type({ contract: t.string, transactions: t.string }),
        resource: WithdrawalHeader,
      })
    ),
  }),
  previousRange: optionFromNullable(WithdrawalsRange),
  nextRange: optionFromNullable(WithdrawalsRange),
});

export type GetWithdrawalsResponse = t.TypeOf<typeof GetWithdrawalsResponse>;
export const GetWithdrawalsResponse = t.type({
  headers: t.array(WithdrawalHeader),
  previousRange: optionFromNullable(WithdrawalsRange),
  nextRange: optionFromNullable(WithdrawalsRange),
});

export type WithdrawPayoutsRequest = {
  payoutIds: PayoutId[];
  changeAddress: AddressBech32;
  usedAddresses?: AddressBech32[];
  collateralUTxOs?: TxOutRef[];
};

export type POST = (
  payoutIds: PayoutId[],
  addressesAndCollaterals: AddressesAndCollaterals
) => TE.TaskEither<Error | DecodingError, WithdrawPayoutsResponse>;

export type WithdrawPayoutsResponse = t.TypeOf<typeof WithdrawPayoutsResponse>;
export const WithdrawPayoutsResponse = t.type({
  withdrawalId: WithdrawalId,
  tx: TextEnvelopeGuard,
});

export type PostResponse = t.TypeOf<typeof PostResponse>;
export const PostResponse = t.type({
  links: t.type({}),
  resource: WithdrawPayoutsResponse,
});

/**
 * @see {@link https://docs.marlowe.iohk.io/api/create-withdrawals}
 */
export const postViaAxios: (axiosInstance: AxiosInstance) => POST =
  (axiosInstance) => (payoutIds, addressesAndCollaterals) =>
    pipe(
      HTTP.Post(axiosInstance)(
        "/withdrawals",
        { payouts: payoutIds },
        {
          headers: {
            Accept: "application/vendor.iog.marlowe-runtime.withdraw-tx-json",
            "Content-Type": "application/json",
            "X-Change-Address": unAddressBech32(
              addressesAndCollaterals.changeAddress
            ),
            "X-Address": pipe(
              addressesAndCollaterals.usedAddresses,
              A.map(unAddressBech32),
              (a) => a.join(",")
            ),
            "X-Collateral-UTxO": pipe(
              addressesAndCollaterals.collateralUTxOs,
              A.map(unTxOutRef),
              (a) => a.join(",")
            ),
          },
        }
      ),
      TE.chainW((data) =>
        TE.fromEither(
          E.mapLeft(formatValidationErrors)(PostResponse.decode(data))
        )
      ),
      TE.map((payload) => payload.resource)
    );
