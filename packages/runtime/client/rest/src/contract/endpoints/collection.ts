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
  StakeAddressBech32,
  unStakeAddressBech32,
  SourceId,
  SourceIdGuard,
} from "@marlowe.io/runtime-core";

import { ContractHeader, ContractHeaderGuard } from "../header.js";
import { RolesConfig } from "../role.js";

import { ContractId, ContractIdGuard } from "@marlowe.io/runtime-core";

/**
 * @category Endpoint : Get Contracts
 */
export interface ContractsRange
  extends Newtype<{ readonly ContractsRange: unique symbol }, string> {}

/**
 * @category Endpoint : Get Contracts
 */
export const ContractsRange = fromNewtype<ContractsRange>(t.string);
export const unContractsRange = iso<ContractsRange>().unwrap;
export const contractsRange = iso<ContractsRange>().wrap;

/**
 * Request options for the {@link index.RestClient#getContracts | Get contracts } endpoint
 * @category Endpoint : Get Contracts
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
 * @category Endpoint : Get Contracts
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
 * Either a Non Merkleized Marlowe Contract or a Merkleized One
 * @category Endpoint : Build Create Contract Tx
 */
export type ContractOrSourceId = Contract | SourceId;

/**
 * Guard for ContractOrSourceId type
 * @category Endpoint : Build Create Contract Tx
 */
export const ContractOrSourceIdGuard: t.Type<ContractOrSourceId> = t.union([
  G.Contract,
  SourceIdGuard,
]);

/**
 * Request options for the {@link index.RestClient#buildCreateContractTx | Build Create Contract Tx } endpoint
 * @category Endpoint : Build Create Contract Tx
 */
export interface BuildCreateContractTxRequest {
  /**
   * The Marlowe Runtime utilizes this Optional field to set a stake address
   * where to send staking rewards for the Marlowe script outputs of this contract.
   */
  stakeAddress?: StakeAddressBech32;
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
   * UTxOs provided as collateral in case the Tx built will unexpectedly fail at the submit phase.
   * @justification
   * The collateral mechanism is an important feature that has been designed to ensure
   * successful smart contract execution.
   * Collateral is used to guarantee that nodes are compensated for their work in case phase-2 validation fails.
   * Thus, collateral is the monetary guarantee a user gives to assure that the contract has been carefully designed
   * and thoroughly tested. Collateral amount is specified at the time of constructing the transaction.
   * Not directly, but by adding collateral inputs to the transaction. The total balance in the UTXOs
   * corresponding to these specially marked inputs is the transaction’s collateral amount.
   * If the user fulfills the conditions of the guarantee, and a contract gets executed, the collateral is safe.
   * @see
   * https://docs.cardano.org/smart-contracts/plutus/collateral-mechanism
   */
  collateralUTxOs?: TxOutRef[];

  /**
   * A Marlowe Contract or a Merkleized One (referred by its source Id) to create over Cardano
   * @see Large/Deep Contracts Support (Contract Merkleization) and `@marlowe.io/language-core`
   */
  contractOrSourceId: ContractOrSourceId;
  /**
   * Marlowe Tags are stored as Metadata within the Transaction Metadata under the top-level Marlowe Reserved Key (`1564`).
   * Tags allows to Query created Marlowe Contracts via {@link index.RestClient#getContracts | Get contracts }
   * @remarks
   * 1. They aren't limited size-wise like regular metadata fields are over Cardano.
   * 2. Metadata can be associated under each tag
   * @example
   * ```ts
   * const myTags : Tags = { "My Tag 1 That can be as long as I want": // Not limited to 64 bytes
   *                            { a: 0
   *                            , b : "Tag 1 content" // Limited to 64 bytes (Cardano Metadata constraint)
   *                            },
   *                         "MyTag2": { c: 0, d : "Tag 2 content"}};
   * ```
   */
  tags?: Tags;
  /**
   * Cardano Metadata about the contract creation.
   * @remarks
   * Metadata can be expressed as a JSON object with some restrictions:
   *   - All top-level keys must be integers between 0 and 2^64 - 1.
   *   - Each metadata value is tagged with its type.
   *   - Strings must be at most 64 bytes when UTF-8 is encoded.
   *   - Bytestrings are hex-encoded, with a maximum length of 64 bytes.
   *
   * Metadata aren't stored as JSON on the Cardano blockchain but are instead stored using a compact binary encoding (CBOR).
   * The binary encoding of metadata values supports three simple types:
   *    - Integers in the range `-(2^64 - 1)` to `2^64 - 1`
   *    - Strings (UTF-8 encoded)
   *    - Bytestrings
   *    - And two compound types:
   *        - Lists of metadata values
   *        - Mappings from metadata values to metadata values
   *
   * It is possible to transform any JSON object into this schema (See https://developers.cardano.org/docs/transaction-metadata )
   * @see
   * https://developers.cardano.org/docs/transaction-metadata
   */
  metadata?: Metadata;
  /**
   * Minimum Lovelace value to add on the UTxO created (Representing the Marlowe Contract Created on the ledger).This value
   * is computed automatically within the Runtime, so this parameter is only necessary if you need some custom adjustment.
   * @justification
   * Creating a Marlowe Contracts over Cardano is about creating UTxO entries on the Ledger.
   * To protect the ledger from growing beyond a certain size that will cost too much to maintain,
   * a constraint called "Minimum ada value requirement (mininmumLovelaceUTxODeposit)" that adjust
   * the value (in ADA) of each UTxO has been added. The more the UTxOs entries are big in size, the more the value of minimum
   * of ADAs needs to be contained.
   * @see
   * https://docs.cardano.org/native-tokens/minimum-ada-value-requirement
   */
  mininmumLovelaceUTxODeposit?: number;

  // TODO: Comment this and improve the generated type (currently `string | {}`)
  roles?: RolesConfig;

  /**
   * The Marlowe validator version to use.
   */
  version: MarloweVersion;
}

export type POST = (
  postContractsRequest: PostContractsRequest,
  addressesAndCollaterals: AddressesAndCollaterals,
  stakeAddress?: StakeAddressBech32
) => TE.TaskEither<Error | DecodingError, BuildCreateContractTxResponse>;

/**
 * @hidden
 */
export type PostContractsRequest = t.TypeOf<typeof PostContractsRequest>;
/**
 * @hidden
 */
export const PostContractsRequest = t.intersection([
  t.type({
    contract: ContractOrSourceIdGuard,
    version: MarloweVersion,
    tags: TagsGuard,
    metadata: Metadata,
  }),
  t.partial({ roles: RolesConfig }),
  t.partial({ minUTxODeposit: t.number }),
]);

/**
 * Response for the {@link index.RestClient#buildCreateContractTx | Build Create Contract Tx } endpoint
 * @category Endpoint : Build Create Contract Tx
 */
export interface BuildCreateContractTxResponse {
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
  proxy<BuildCreateContractTxResponse>(),
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
  (axiosInstance) =>
  (postContractsRequest, addressesAndCollaterals, stakeAddress) =>
    pipe(
      HTTP.Post(axiosInstance)("/contracts", postContractsRequest, {
        headers: {
          Accept: "application/vendor.iog.marlowe-runtime.contract-tx-json",
          "Content-Type": "application/json",
          ...(stakeAddress && {
            "X-Stake-Address": unStakeAddressBech32(stakeAddress),
          }),
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
