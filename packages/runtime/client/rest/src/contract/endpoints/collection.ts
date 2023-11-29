import { AxiosInstance } from "axios";

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
import { assertGuardEqual, proxy } from "@marlowe.io/adapter/io-ts";
import { Contract } from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import { MarloweVersion } from "@marlowe.io/language-core-v1/version";

import * as HTTP from "@marlowe.io/adapter/http";
import { DecodingError } from "@marlowe.io/adapter/codec";

import {
  Tag,
  Tags,
  TagsGuard,
  Metadata,
  TextEnvelope,
  TextEnvelopeGuard,
  unAddressBech32,
  unTxOutRef,
  AddressesAndCollaterals,
  AddressBech32,
  TxOutRef,
  AssetId,
  unPolicyId,
} from "@marlowe.io/runtime-core";

import { ContractHeader, ContractHeaderGuard } from "../header.js";
import { RolesConfig } from "../role.js";

import { ContractId, ContractIdGuard } from "@marlowe.io/runtime-core";

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
 * Request options for the {@link index.RestClient#getContracts | Get contracts } endpoint
 * @category Endpoints
 */
export interface GetContractsRequest {
  /**
   * Optional pagination request. Note that when you call {@link index.RestClient#getContracts | Get contracts }
   * the response includes the next and previous range headers.
   */
  range?: ContractsRange;
  /**
   * Optional tags to filter the contracts by.
   */
  // QUESTION: @Jamie or @N.H, a tag is marked as string, but when creating a contract you need to pass a key and a value, what is this
  //           string supposed to be? I have some contracts with tag "{SurveyContract: CryptoPall2023}" that I don't know how to search for.
  tags?: Tag[];
  /**
   * Optional partyAddresses to filter the contracts by.
   */
  partyAddresses?: AddressBech32[];
  /**
   * Optional partyRoles to filter the contracts by.
   */
  partyRoles?: AssetId[];
}

export type GETHeadersByRange = (
  rangeOption: O.Option<ContractsRange>
) => (kwargs: {
  tags: Tag[];
  partyAddresses: AddressBech32[];
  partyRoles: AssetId[];
}) => TE.TaskEither<Error | DecodingError, GetContractsResponse>;

const roleToParameter = (roleToken: AssetId) =>
  `${unPolicyId(roleToken.policyId)}.${roleToken.assetName}`;

/**
 * @see {@link https://docs.marlowe.iohk.io/api/get-contracts}
 */
export const getHeadersByRangeViaAxios: (
  axiosInstance: AxiosInstance
) => GETHeadersByRange =
  (axiosInstance) =>
  (rangeOption) =>
  ({ tags, partyAddresses, partyRoles }) =>
    pipe(
      {
        url:
          "/contracts?" +
          stringify(
            {
              tag: tags,
              partyAddress: partyAddresses,
              partyRole: partyRoles.map(roleToParameter),
            },
            { indices: false }
          ),
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
          A.map((result) => result.resource)
        ), // All logic instead of Any, TODO : Add the flexibility to chose between Any and All
        previousRange: rawResponse.previousRange,
        nextRange: rawResponse.nextRange,
      }))
    );

export type GETByRangeRawResponse = t.TypeOf<typeof GETByRangeRawResponse>;
export const GETByRangeRawResponse = t.type({
  data: t.type({
    results: t.array(
      t.type({
        links: t.type({ contract: t.string, transactions: t.string }),
        resource: ContractHeaderGuard,
      })
    ),
  }),
  previousRange: optionFromNullable(ContractsRange),
  nextRange: optionFromNullable(ContractsRange),
});

/**
 * Represents the response of the {@link index.RestClient#getContracts | Get contracts } endpoint
 * @category GetContractsResponse
 */
export interface GetContractsResponse {
  /**
   * A list of minimal contract information that can be used to identify a contract.
   */
  // DISCUSSION: Rename to "contracts" or "results"
  headers: ContractHeader[];
  // TODO: Change Option for nullable
  /**
   * The previous query range. This is used for pagination.
   */
  previousRange: O.Option<ContractsRange>;
  /**
   * The next query range. This is used for pagination.
   */
  nextRange: O.Option<ContractsRange>;
  // TODO: Add current range
}

/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for {@link GetContractsResponse}.
 * @category Validator
 * @category GetContractsResponse
 * @hidden
 */
export const GetContractsResponseGuard = assertGuardEqual(
  proxy<GetContractsResponse>(),
  t.type({
    headers: t.array(ContractHeaderGuard),
    previousRange: optionFromNullable(ContractsRange),
    nextRange: optionFromNullable(ContractsRange),
  })
);

/**
 * Request options for the {@link index.RestClient#createContract | Create contract } endpoint
 * @category Endpoints
 */
export interface CreateContractRequest {
  // FIXME: create ticket to add stake address
  // stakeAddress: void;
  /**
   * The Marlowe Runtime utilizes this mandatory field and any additional addresses provided in `usedAddresses`
   * to search for UTxOs that can be used to balance the contract creation transaction.
   *
   * Any change from the creation transaction will be sent here.
   * @see WalletAPI function {@link @marlowe.io/wallet!api.WalletAPI#getChangeAddress}
   * @see WalletAPI function {@link @marlowe.io/wallet!api.WalletAPI#getUsedAddresses}
   * @see {@link https://academy.glassnode.com/concepts/utxo#change-in-utxo-models}
   */
  changeAddress: AddressBech32;
  /**
   * The Marlowe Runtime utilizes the mandatory `changeAddress` and any additional addresses provided here
   * to search for UTxOs that can be used to balance the contract creation transaction.
   * @remarks
   * 1. When using single address wallets like Nami, it is not necesary to fill this field.
   * 2. If an address was provided in the `changeAddress` field, it is redundant to include it here (but it doesn't fail).
   * @see WalletAPI function {@link @marlowe.io/wallet!api.WalletAPI#getChangeAddress}
   * @see WalletAPI function {@link @marlowe.io/wallet!api.WalletAPI#getUsedAddresses}
   */
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
  metadata?: Metadata;
  /**
   * To avoid spamming the network, the cardano ledger requires us to deposit a minimum amount of ADA.
   * The value is in lovelace, so if you want to deposit 3Ada you need to pass 3_000_000 here.
   */
  // TODO: @sam
  //       Create a global documentation page (and link from here) that explains the concept of minUTxO,
  //       why it is required, who deposits it, and how and when you get it back.
  minUTxODeposit: number;

  // TODO: Comment this and improve the generated type (currently `string | {}`)
  roles?: RolesConfig;
  /**
   * An optional object of tags where the **key** is the tag name (`string`) and the **value** is the tag content (`any`)
   */
  tags?: Tags;

  /**
   * The validator version to use.
   */
  version: MarloweVersion;
}

export type POST = (
  postContractsRequest: PostContractsRequest,
  addressesAndCollaterals: AddressesAndCollaterals
) => TE.TaskEither<Error | DecodingError, CreateContractResponse>;

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
    tags: TagsGuard,
    metadata: Metadata,
    minUTxODeposit: t.number,
  }),
  t.partial({ roles: RolesConfig }),
]);

export interface CreateContractResponse {
  /**
   * This is the ID the contract will have after it is signed and submitted.
   */
  contractId: ContractId;
  /**
   * An array of possible errors that the contract might have.
   * @see {@link https://github.com/input-output-hk/marlowe-cardano/blob/81d1e81ca2b40e06c794ad7d97ed4d138f60ab24/marlowe/src/Language/Marlowe/Analysis/Safety/Types.hs#L110}
   */
  // TODO: type this
  safetyErrors: unknown[];
  /**
   * The unsigned transaction that will be used to create the contract.
   * @see {@link @marlowe.io/wallet!api.WalletAPI#signTx}
   * @see {@link index.RestClient#submitContract}
   */
  // QUESTION: Should we rename the property or the type to indicate that is unsigned?
  tx: TextEnvelope;
}

/**
 * @hidden
 */
const CreateContractResponseGuard = assertGuardEqual(
  proxy<CreateContractResponse>(),
  t.type({
    contractId: ContractIdGuard,
    safetyErrors: t.UnknownArray,
    tx: TextEnvelopeGuard,
  })
);

export type PostResponse = t.TypeOf<typeof PostResponse>;
export const PostResponse = t.type({
  links: t.type({ contract: t.string }),
  resource: CreateContractResponseGuard,
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
