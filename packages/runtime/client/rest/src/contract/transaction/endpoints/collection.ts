import * as t from "io-ts/lib/index.js";
import { Newtype, iso } from "newtype-ts";
import * as E from "fp-ts/lib/Either.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";
import { fromNewtype, optionFromNullable } from "io-ts-types";
import { AxiosInstance } from "axios";

import * as G from "@marlowe.io/language-core-v1/guards";
import { MarloweVersion } from "@marlowe.io/language-core-v1/version";

import * as HTTP from "@marlowe.io/adapter/http";
import { DecodingError } from "@marlowe.io/adapter/codec";
import { ISO8601 } from "@marlowe.io/adapter/time";

import {
  AddressBech32,
  AddressesAndCollaterals,
  Metadata,
  TagsGuard,
  TextEnvelopeGuard,
  TxId,
  TxOutRef,
  unAddressBech32,
  unTxOutRef,
} from "@marlowe.io/runtime-core";

import { TxHeader, TxHeaderGuard } from "../header.js";
import {
  ContractId,
  ContractIdGuard,
  unContractId,
} from "@marlowe.io/runtime-core";
import { assertGuardEqual, proxy } from "@marlowe.io/adapter/io-ts";
import { Input } from "@marlowe.io/language-core-v1";

/**
 * A transaction range provides pagination options for the {@link index.RestAPI#getTransactionsForContract | Get transactions for contract } endpoint
 */
export interface TransactionsRange
  extends Newtype<{ readonly TransactionsRange: unique symbol }, string> {}
export const TransactionsRangeGuard = fromNewtype<TransactionsRange>(t.string);
export const unTransactionsRange = iso<TransactionsRange>().unwrap;
export const transactionsRange = iso<TransactionsRange>().wrap;

export type GETHeadersByRange = (
  contractId: ContractId,
  rangeOption: O.Option<TransactionsRange>
) => TE.TaskEither<Error | DecodingError, GetTransactionsForContractResponse>;

export const getHeadersByRangeViaAxios: (
  axiosInstance: AxiosInstance
) => GETHeadersByRange = (axiosInstance) => (contractId, rangeOption) =>
  pipe(
    HTTP.GetWithDataAndHeaders(axiosInstance)(
      transactionsEndpoint(contractId),
      pipe(
        rangeOption,
        O.match(
          () => ({}),
          (range) => ({ headers: { Range: unTransactionsRange(range) } })
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
        E.mapLeft(formatValidationErrors)(GetContractsRawResponse.decode(data))
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

type GetContractsRawResponse = t.TypeOf<typeof GetContractsRawResponse>;
const GetContractsRawResponse = t.type({
  data: t.type({
    results: t.array(t.type({ links: t.type({}), resource: TxHeaderGuard })),
  }),
  previousRange: optionFromNullable(TransactionsRangeGuard),
  nextRange: optionFromNullable(TransactionsRangeGuard),
});

/**
 * Represents the response of the {@link index.RestAPI#getTransactionsForContract | Get transactions for contract } endpoint
 * @category GetTransactionsForContractResponse
 */
export interface GetTransactionsForContractResponse {
  /**
   * The list of transactions heading information for the contract
   */
  headers: TxHeader[];
  /**
   * The previous range header. This is used for pagination.
   */
  previousRange: O.Option<TransactionsRange>;
  /**
   * The next range header. This is used for pagination.
   */
  nextRange: O.Option<TransactionsRange>;
}

/**
 * @hidden
 */
export const GetTransactionsForContractResponseGuard = assertGuardEqual(
  proxy<GetTransactionsForContractResponse>(),
  t.type({
    headers: t.array(TxHeaderGuard),
    previousRange: optionFromNullable(TransactionsRangeGuard),
    nextRange: optionFromNullable(TransactionsRangeGuard),
  })
);

export type TransactionTextEnvelope = t.TypeOf<typeof TransactionTextEnvelope>;
export const TransactionTextEnvelope = t.type({
  contractId: ContractIdGuard,
  transactionId: TxId,
  tx: TextEnvelopeGuard,
});

export type ApplyInputsToContractRequest = {
  contractId: ContractId;
  changeAddress: AddressBech32;
  usedAddresses?: AddressBech32[];
  collateralUTxOs?: TxOutRef[];
  invalidBefore?: string;
  invalidHereafter?: string;
  version?: "v1";
  metadata?: { [label: string | number]: any };
  tags?: { [tag: string]: any };
  inputs: Input[];
};

export type POST = (
  contractId: ContractId,
  postTransactionsRequest: PostTransactionsRequest,
  addressesAndCollaterals: AddressesAndCollaterals
) => TE.TaskEither<Error | DecodingError, TransactionTextEnvelope>;

export const postViaAxios: (axiosInstance: AxiosInstance) => POST =
  (axiosInstance) =>
  (contractId, postTransactionsRequest, addressesAndCollaterals) =>
    pipe(
      HTTP.Post(axiosInstance)(
        transactionsEndpoint(contractId),
        postTransactionsRequest,
        {
          headers: {
            Accept:
              "application/vendor.iog.marlowe-runtime.apply-inputs-tx-json",
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

export type PostTransactionsRequest = t.TypeOf<typeof PostTransactionsRequest>;
export const PostTransactionsRequest = t.intersection([
  t.type({
    version: MarloweVersion,
    inputs: t.array(G.Input),
    metadata: Metadata,
    tags: TagsGuard,
  }),
  t.partial({ invalidBefore: ISO8601 }),
  t.partial({ invalidHereafter: ISO8601 }),
]);

export type PostResponse = t.TypeOf<typeof PostResponse>;
export const PostResponse = t.type({
  links: t.type({ transaction: t.string }),
  resource: TransactionTextEnvelope,
});

const transactionsEndpoint = (contractId: ContractId): string =>
  `/contracts/${encodeURIComponent(unContractId(contractId))}/transactions`;
