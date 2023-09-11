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
  AddressesAndCollaterals,
  PayoutId,
  TextEnvelope,
  WithdrawalId,
  unAddressBech32,
  unTxOutRef,
} from "@marlowe.io/runtime-core";

import { WithdrawalHeader } from "../header.js";

export interface WithdrawalsRange
  extends Newtype<{ readonly WithdrawalsRange: unique symbol }, string> {}
export const WithdrawalsRange = fromNewtype<WithdrawalsRange>(t.string);
export const unWithdrawalsRange = iso<WithdrawalsRange>().unwrap;
export const contractsRange = iso<WithdrawalsRange>().wrap;

export type GETHeadersByRange = (
  rangeOption: O.Option<WithdrawalsRange>
) => TE.TaskEither<Error | DecodingError, GETByRangeResponse>;

export const getHeadersByRangeViaAxios: (
  axiosInstance: AxiosInstance
) => GETHeadersByRange = (axiosInstance) => (rangeOption) =>
  pipe(
    HTTP.GetWithDataAndHeaders(axiosInstance)(
      "/withdrawals",
      pipe(
        rangeOption,
        O.match(
          () => ({}),
          (range) => ({ headers: { Range: unWithdrawalsRange(range) } })
        )
      )
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

export type GETByRangeResponse = t.TypeOf<typeof GETByRangeResponse>;
export const GETByRangeResponse = t.type({
  headers: t.array(WithdrawalHeader),
  previousRange: optionFromNullable(WithdrawalsRange),
  nextRange: optionFromNullable(WithdrawalsRange),
});

export type POST = (
  payoutIds: PayoutId[],
  addressesAndCollaterals: AddressesAndCollaterals
) => TE.TaskEither<Error | DecodingError, WithdrawalTextEnvelope>;

export type WithdrawalTextEnvelope = t.TypeOf<typeof WithdrawalTextEnvelope>;
export const WithdrawalTextEnvelope = t.type({
  withdrawalId: WithdrawalId,
  tx: TextEnvelope,
});

export type PostResponse = t.TypeOf<typeof PostResponse>;
export const PostResponse = t.type({
  links: t.type({}),
  resource: WithdrawalTextEnvelope,
});

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
