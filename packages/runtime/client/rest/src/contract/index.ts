/**
 * ```ts
 * import * as C from "@marlowe.io/runtime-rest-client/contract";
 *```
 * This package contains all the implementation and details related to 
 * endpoints under the URI `/contracts/...` : 
 *  - {@link index.RestClient#buildCreateContractTx | Build Create Contract Tx } 
 *  - {@link index.RestClient#getContracts | Get contracts }
 *  - {@link index.RestClient#getContractById | Get Contract By Id }

 * @packageDocumentation
 */

export { ContractHeader } from "./header.js";
export { ContractDetails } from "./details.js";
export {
  useMintedRoles,
  mintRole,
  openRole,
  ClosedRole,
  OpenRole,
  Openness,
  UsePolicyWithClosedRoleTokens,
  UsePolicyWithOpenRoleTokens,
  MintRolesTokens,
  TokenMetadataFile,
  TokenMetadata,
  Recipient,
  TokenQuantity,
  RoleTokenConfiguration,
  RolesConfiguration,
} from "./rolesConfigurations.js";
export {
  GetContractsResponse,
  GetContractsRequest,
  ContractsRange,
  ContractOrSourceId,
  BuildCreateContractTxRequest,
  BuildCreateContractTxRequestWithContract,
  BuildCreateContractTxRequestWithSourceId,
  BuildCreateContractTxRequestOptions,
  BuildCreateContractTxResponse,
} from "./endpoints/collection.js";
export { TxHeader } from "./transaction/header.js";
export {
  TransactionsRange,
  GetTransactionsForContractResponse,
} from "./transaction/endpoints/collection.js";

export { TransactionDetails } from "./transaction/details.js";

export { TransactionTextEnvelope } from "./transaction/endpoints/collection.js";
