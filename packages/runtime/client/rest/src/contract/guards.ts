/**
  * This module offers {@link !io-ts-usage | dynamic type guards} for JSON schemas as specified in Runtime Rest API  
  ```
  import * as G from "@marlowe/language-core-v1/guards"
  const jsonObject = JSON.parse(fileContents)

  if (G.Contract.is(jsonObject)) {
    // The jsonObject respects the JSON schema for Contract
  } else {
    // The jsonObject does not respect the JSON schema for Contract
  }
  ```
  @packageDocumentation
 */

export {
  ClosedRoleGuard as ClosedRole,
  OpenRoleGuard as OpenRole,
  OpennessGuard as Openess,
  UsePolicyWithClosedRoleTokensGuard as UsePolicyWithClosedRoleTokens,
  UsePolicyWithOpenRoleTokensGuard as UsePolicyWithOpenRoleTokens,
  TokenMetadataFileGuard as TokenMetadataFile,
  TokenMetadataGuard as TokenMetadata,
  RoleTokenConfigurationGuard as RoleTokenConfiguration,
  RolesConfigurationGuard as RolesConfiguration,
  AddressBech32Guard as AddressBech32,
} from "./rolesConfigurations.js";
