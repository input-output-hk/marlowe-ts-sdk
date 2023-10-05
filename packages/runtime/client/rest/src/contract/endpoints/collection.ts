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
import * as G from "@marlowe.io/language-core-v1/guards";
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
  AddressBech32,
  TxOutRef,
} from "@marlowe.io/runtime-core";

import { ContractHeader } from "../header.js";
import { RolesConfig } from "../role.js";

import { ContractId } from "@marlowe.io/runtime-core";

/**
 * @category GetContractsResponse
 */
export interface ContractsRange
  extends Newtype<{ readonly ContractsRange: unique symbol }, string> {}

/**
 * @category GetContractsResponse
 */
export const ContractsRange = fromNewtype<ContractsRange>(t.string);
export const unContractsRange = iso<ContractsRange>().unwrap;
export const contractsRange = iso<ContractsRange>().wrap;

/**
 * Request options for the {@link index.RestAPI#getContracts | Get contracts } endpoint
 * @category Endpoints
 */
export type GetContractsRequest = {
  /**
   * Optional pagination request. Note that when you call {@link index.RestAPI#getContracts | Get contracts }
   * the response includes the next and previous range headers.
   */
  // QUESTION: @Jamie, is this supposed to be constructed by the user? or solely from other endpoints?
  range?: ContractsRange;
  /**
   * Optional tags to filter the contracts by.
   */
  // QUESTION: @Jamie or @N.H, a tag is marked as string, but when creating a contract you need to pass a key and a value, what is this
  //           string supposed to be? I have some contracts with tag "{SurveyContract: CryptoPall2023}" that I don't know how to search for.
  tags?: Tag[];
  // FIXME: create ticket to Add RoleCurrency filter
};

export type GETHeadersByRange = (
  rangeOption: O.Option<ContractsRange>
) => (
  tags: Tag[]
) => TE.TaskEither<Error | DecodingError, GetContractsResponse>;

/**
 * @see {@link https://docs.marlowe.iohk.io/api/get-contracts}
 */
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
        resource: ContractHeader,
      })
    ),
  }),
  previousRange: optionFromNullable(ContractsRange),
  nextRange: optionFromNullable(ContractsRange),
});

/**
 * Represents the response of the {@link index.RestAPI#getContracts | Get contracts } endpoint
 * @see The {@link GetContractsResponse:var | dynamic validator} for this type.
 * @category GetContractsResponse
 */
export interface GetContractsResponse
  extends t.TypeOf<typeof GetContractsResponse> {
  // NOTE: by repeating this the typedoc is generated with the link instead of embedding
  //       the definition
  // headers: ContractHeader[];
}

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for {@link GetContractsResponse:type}.
 * @category Validator
 * @category GetContractsResponse
 */
export const GetContractsResponse = t.type({
  /**
   * An array of {@link ContractHeader:type}
   */
  // DISCUSSION: Rename to "contracts" or "results"
  headers: t.array(ContractHeader),
  // TODO: Change Option for nullable
  // QUESTION: @Jamie, how are these sorted? previousRange means newer contracts? recent activity?
  /**
   * The previous range header. This is used for pagination.
   */
  previousRange: optionFromNullable(ContractsRange),
  /**
   * The next range header. This is used for pagination.
   */
  nextRange: optionFromNullable(ContractsRange),
  // TODO: Add current range
});

/**
 * Request options for the {@link index.RestAPI#createContract | Create contract } endpoint
 * @category Endpoints
 */
export type CreateContractRequest = {
  // FIXME: create ticket to add stake address
  // stakeAddress: void;
  /**
   * Address to send any remainders of the transaction.
   * @see {@link @marlowe.io/wallet.WalletAPI#getChangeAddress}
   * @see {@link https://academy.glassnode.com/concepts/utxo#change-in-utxo-models}
   */
  changeAddress: AddressBech32;
  /**
   * TODO: Document
   */
  // Got this name from AddressesAndCollaterals.
  // TODO: @Jamie, @N.H, lets unify name. Plain `x-Address` is not very descriptive, seems singular
  usedAddresses?: AddressBech32[];
  /**
   * TODO: Document
   */
  collateralUTxOs?: TxOutRef[];
  /**
   * The contract to create
   */
  contract: Contract;
  /**
   * An object containing metadata about the contract
   */
  // TODO: Add link to example of metadata
  // QUESTION: Jamie, why is this required?
  metadata: Metadata;
  /**
   * When we create a contract we need to specify the minimum amount of ADA that we need to deposit. This
   * is a cardano ledger restriction to avoid spamming the network
   */
  // TODO: Find link with better explanation
  minUTxODeposit: number;

  // TODO: Comment this
  roles?: RolesConfig;
  /**
   * An object of tags where the key is the tag name and the value is the tag content
   */
  tags: Tags;

  /**
   * The validator version to use.
   */
  version: MarloweVersion;
};

export type POST = (
  postContractsRequest: PostContractsRequest,
  addressesAndCollaterals: AddressesAndCollaterals
) => TE.TaskEither<Error | DecodingError, ContractTextEnvelope>;

/**
 * @hidden
 */
export type PostContractsRequest = t.TypeOf<typeof PostContractsRequest>;
/**
 * @hidden
 */
export const PostContractsRequest = t.intersection([
  t.type({
    contract: G.Contract,
    version: MarloweVersion,
    tags: Tags,
    metadata: Metadata,
    minUTxODeposit: t.number,
  }),
  t.partial({ roles: RolesConfig }),
]);

// QUESTION: @N.H and @Jamie: This seems to be only used in the context
//           of creating a contract that later needs to be signed and submitted.
//           Should we rename this to something like `UnsignedContractTx` or
//           `UnsignedCreateContractTx`?
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
/**
 * @see {@link https://docs.marlowe.iohk.io/api/create-contracts}
 */
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
