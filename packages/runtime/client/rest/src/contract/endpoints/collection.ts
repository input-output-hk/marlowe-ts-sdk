import { AxiosInstance, ParamEncoder, ParamsSerializerOptions } from "axios";

import * as t from "io-ts/lib/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as E from "fp-ts/lib/Either.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import { Newtype, iso } from "newtype-ts";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";
import { fromNewtype, optionFromNullable } from "io-ts-types";
import { stringify } from "qs";

import { Contract } from "@marlowe.io/language-core-v1";
import { MarloweVersion } from "@marlowe.io/language-core-v1/version";

import * as HTTP from "@marlowe.io/adapter/http";
import { DecodingError } from "@marlowe.io/adapter/codec";

import {
  Tag,
  Tags,
  Metadata,
  TextEnvelope,
  unAddressBech32,
  unTxOutRef,
  AddressesAndCollaterals,
} from "@marlowe.io/runtime-core";

import { Header } from "../header.js";
import { RolesConfig } from "../role.js";

import { ContractId } from "@marlowe.io/runtime-core";

export interface ContractsRange
  extends Newtype<{ readonly ContractsRange: unique symbol }, string> {}
export const ContractsRange = fromNewtype<ContractsRange>(t.string);
export const unContractsRange = iso<ContractsRange>().unwrap;
export const contractsRange = iso<ContractsRange>().wrap;

export type GETHeadersByRange = (
  rangeOption: O.Option<ContractsRange>
) => (tags: Tag[]) => TE.TaskEither<Error | DecodingError, GETByRangeResponse>;

export const getHeadersByRangeViaAxios: (
  axiosInstance: AxiosInstance
) => GETHeadersByRange = (axiosInstance) => (rangeOption) => (tags) =>
  pipe(
    {
      url: "/contracts?" + stringify({ tag: tags }, { indices: false }),
      configs: pipe(
        rangeOption,
        O.match(
          () => ({}),
          (range) => ({ headers: { Range: unContractsRange(range) } })
        )
      ),
    },
    ({ url, configs }) =>
      HTTP.GetWithDataAndHeaders(axiosInstance)(url, configs),
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
        A.map((result) => result.resource),
        A.filter((header) =>
          eqSetString(new Set(Object.keys(header.tags)), new Set(tags))
        )
      ), // All logic instead of Any, TODO : Add the flexibility to chose between Any and All
      previousRange: rawResponse.previousRange,
      nextRange: rawResponse.nextRange,
    }))
  );

const eqSetString = (xs: Set<string>, ys: Set<string>) =>
  xs.size === ys.size && [...xs].every((x) => ys.has(x));

export type GETByRangeRawResponse = t.TypeOf<typeof GETByRangeRawResponse>;
export const GETByRangeRawResponse = t.type({
  data: t.type({
    results: t.array(
      t.type({
        links: t.type({ contract: t.string, transactions: t.string }),
        resource: Header,
      })
    ),
  }),
  previousRange: optionFromNullable(ContractsRange),
  nextRange: optionFromNullable(ContractsRange),
});

export type GETByRangeResponse = t.TypeOf<typeof GETByRangeResponse>;
export const GETByRangeResponse = t.type({
  headers: t.array(Header),
  previousRange: optionFromNullable(ContractsRange),
  nextRange: optionFromNullable(ContractsRange),
});

export type POST = (
  postContractsRequest: PostContractsRequest,
  addressesAndCollaterals: AddressesAndCollaterals
) => TE.TaskEither<Error | DecodingError, ContractTextEnvelope>;

export type PostContractsRequest = t.TypeOf<typeof PostContractsRequest>;
export const PostContractsRequest = t.intersection([
  t.type({
    contract: Contract,
    version: MarloweVersion,
    tags: Tags,
    metadata: Metadata,
    minUTxODeposit: t.number,
  }),
  t.partial({ roles: RolesConfig }),
]);

export type ContractTextEnvelope = t.TypeOf<typeof ContractTextEnvelope>;
export const ContractTextEnvelope = t.type({
  contractId: ContractId,
  tx: TextEnvelope,
});

export type PostResponse = t.TypeOf<typeof PostResponse>;
export const PostResponse = t.type({
  links: t.type({ contract: t.string }),
  resource: ContractTextEnvelope,
});

export const postViaAxios: (axiosInstance: AxiosInstance) => POST =
  (axiosInstance) => (postContractsRequest, addressesAndCollaterals) =>
    pipe(
      HTTP.Post(axiosInstance)("/contracts", postContractsRequest, {
        headers: {
          Accept: "application/vendor.iog.marlowe-runtime.contract-tx-json",
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
      }),
      TE.chainW((data) =>
        TE.fromEither(
          E.mapLeft(formatValidationErrors)(PostResponse.decode(data))
        )
      ),
      TE.map((payload) => payload.resource)
    );
