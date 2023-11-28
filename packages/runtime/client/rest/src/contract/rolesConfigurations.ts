import * as t from "io-ts/lib/index.js";

import { PolicyId, RoleName } from "@marlowe.io/language-core-v1";

import * as G from "@marlowe.io/language-core-v1/guards";

/**
 *  @category Roles Configuration
 */
export interface AddressBech32Brand {
  readonly AddressBech32: unique symbol;
}

export const AddressBech32Guard = t.brand(
  t.string,
  (s): s is t.Branded<string, AddressBech32Brand> => true,
  "AddressBech32"
);

/**
 *  Cardano Address in a Bech32 format
 *  @category Roles Configuration
 */
export type AddressBech32 = t.TypeOf<typeof AddressBech32Guard>;

/**
 *  Definition a of Closed Role Tlken
 *  @remarks
 *    - It is only defined by the Address where the token is distributed
 *  @category Roles Configuration
 */
export type ClosedRole = AddressBech32;
export const ClosedRoleGuard: t.Type<ClosedRole, string> = AddressBech32Guard;

/**
 *  Definition of an Open Role Token
 *  @category Roles Configuration
 */
export type OpenRole = "OpenRole";
export const OpenRoleGuard = t.literal("OpenRole");

/**
 *  Construction of an Open Role Token
 *  @category Roles Configuration
 */
export const mkOpenRole = "OpenRole";

/**
 *  Definition of the Openness of a Role Token
 *  @category Roles Configuration
 */
export type Openess = ClosedRole | OpenRole;
export const OpenessGuard: t.Type<Openess, string> = t.union([
  ClosedRoleGuard,
  OpenRoleGuard,
]);

/**
 *  @category Roles Configuration
 */
export type UsePolicyWithClosedRoleTokens = PolicyId;

export const UsePolicyWithClosedRoleTokensGuard: t.Type<UsePolicyWithClosedRoleTokens> =
  G.PolicyId;

/**
 *  @category Roles Configuration
 */
export interface UsePolicyWithOpenRoleTokens {
  script: OpenRole;
  policyId: PolicyId;
  openRoleNames: RoleName[];
}
export const UsePolicyWithOpenRoleTokensGuard: t.Type<UsePolicyWithOpenRoleTokens> =
  t.type({
    script: OpenRoleGuard,
    policyId: G.PolicyId,
    openRoleNames: t.array(G.RoleName),
  });

/**
 *  @category Roles Configuration
 */
export interface TokenMetadataFile {
  name: string;
  src: string;
  mediaType: string;
}

export const TokenMetadataFileGuard: t.Type<TokenMetadataFile> = t.type({
  name: t.string,
  src: t.string,
  mediaType: t.string,
});

/**
 *  @category Roles Configuration
 *  TODO : Which CIP are we following here ?
 *  @see
 *  - https://developers.cardano.org/docs/native-tokens/minting-nfts/
 *  - https://docs.nmkr.io/nmkr-studio/token/metadata/metadata-standard-for-fungible-tokens
 */
export interface TokenMetadata {
  name?: string;
  image?: string;
  mediaType: string;
  description: string;
  files: TokenMetadataFile[];
}

export const TokenMetadataGuard: t.Type<TokenMetadata> = t.intersection([
  t.type({
    mediaType: t.string,
    description: t.string,
    files: t.array(TokenMetadataFileGuard),
  }),
  t.partial({ name: t.string }),
  t.partial({ image: t.string }),
]);

/**
 *  @category Roles Configuration
 */
export interface ClosedNFTWithMetadata {
  address: AddressBech32;
  metadata?: TokenMetadata;
}

/**
 *  @category Roles Configuration
 */
export type Recipient = Openess;

export const RecipientGuard: t.Type<Recipient, string> = t.union([
  OpenRoleGuard,
  ClosedRoleGuard,
]);

/**
 *  @category Roles Configuration
 */
export type TokenQuantity = bigint;

export const TokenQuantityGuard: t.Type<TokenQuantity> = t.bigint;

/**
 *  @category Roles Configuration
 */
export interface RoleTokenConfiguration {
  recipients:
    | { [x: string & t.Brand<AddressBech32Brand>]: TokenQuantity }
    | { OpenRole: TokenQuantity };
  metadata?: TokenMetadata;
}

export const RoleTokenConfigurationGuard: t.Type<RoleTokenConfiguration> =
  t.intersection([
    t.type({
      recipients: t.union([
        t.record(OpenRoleGuard, TokenQuantityGuard),
        t.record(ClosedRoleGuard, TokenQuantityGuard),
      ]),
    }),
    t.partial({ metadata: TokenMetadataGuard }),
  ]);

/**
 *  @category Roles Configuration
 */
export type MintRolesTokens = { [x: RoleName]: RoleTokenConfiguration };

export const MintRolesTokensGuard: t.Type<MintRolesTokens> = t.record(
  G.RoleName,
  RoleTokenConfigurationGuard
);

/**
 *  Defines how to configure Roles over Cardano at the creation of a Marlowe Contract.
 *  @see
 *   Smart Constructors are available to ease the configuration:
 *    - {@link @marlowe.io/runtime-rest-client!contract.mkUseMintedRoleTokens}
 *    - {@link @marlowe.io/runtime-rest-client!contract.mkMintOpenRoleToken}
 *    - {@link @marlowe.io/runtime-rest-client!contract.mkMintClosedRoleToken}
 *  @category Endpoint : Build Create Contract Tx
 *  @category Roles Configuration
 */
export type RolesConfiguration =
  | UsePolicyWithClosedRoleTokens
  | UsePolicyWithOpenRoleTokens
  | MintRolesTokens;

export const RolesConfigurationGuard = t.union([
  UsePolicyWithClosedRoleTokensGuard,
  UsePolicyWithOpenRoleTokensGuard,
  MintRolesTokensGuard,
]);

/**
 * Configure Roles using tokens previously Minted. These Role Tokens are already defined (via an NFT platform, cardano-cli, another Marlowe Contract Created, etc.. )
 * @param policyId The policy Id of All the token roles defined in the Marlowe Contract DSL
 * @param openRoleNames defines all the Roles to be Open (Others will be Closed)
 * @remarks
 * It is under the user's responsability to create and distribute properly these role tokens
 *  - Make sure all the Token Name are minted and match all the Role Names defined in the contract
 *  - Depending on the Marlowe Contract logic, make sure the tokens are distributed to the right wallet
 * When using Open Role Tokens
 *  - Thread Role Token needs to me minted when using Open Roles (by default threadRoleName = "")
 *  - see {@link index.RestClient#buildCreateContractTx | Build Create Contract Tx }
 *  @category Endpoint : Build Create Contract Tx
 *  @category Roles Configuration
 */
export const mkUseMintedRoleTokens = (
  policyId: PolicyId,
  openRoleNames?: RoleName[]
): RolesConfiguration =>
  openRoleNames
    ? { script: mkOpenRole, policyId: policyId, openRoleNames: openRoleNames }
    : (policyId as UsePolicyWithClosedRoleTokens);

/**
 *  Configure the minting of a Closed Role Token.
 *  @param address where to distribute the token that will be mint
 *  @param quantity Quantity of the Closed Role Token (by Default an NFT (==1))
 *  @param metadata Token Metadata of the Token
 *  @category Endpoint : Build Create Contract Tx
 *  @category Roles Configuration
 */
export const mkMintClosedRoleToken: (
  address: AddressBech32,
  quantity?: TokenQuantity,
  metadata?: TokenMetadata
) => RoleTokenConfiguration = (address, quantity, metadata) => ({
  recipients: { [address]: quantity ? quantity : 1n },
  metadata: metadata,
});

/**
 *  Configure the minting of an Open Role Token.
 *  @param quantity Quantity of the Closed Role Token (by Default an NFT (==1))
 *  @param metadata Token Metadata of the Token
 *  @category Endpoint : Build Create Contract Tx
 *  @category Roles Configuration
 */
export const mkMintOpenRoleToken: (
  quantity?: TokenQuantity,
  metadata?: TokenMetadata
) => RoleTokenConfiguration = (quantity, metadata) => ({
  recipients: { [mkOpenRole]: quantity ? quantity : 1n },
  metadata: metadata,
});
