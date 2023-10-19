/**
 * ```ts
 * import * as C from "@marlowe.io/runtime-rest-client/contract";
 *```
 * @packageDocumentation
 */

export { ContractHeader } from "./header.js";
export { ContractDetails } from "./details.js";
export { RolesConfig } from "./role.js";
export {
  GetContractsResponse,
  GetContractsRequest,
  ContractsRange,
  CreateContractRequest,
  CreateContractResponse,
} from "./endpoints/collection.js";
export { TxHeader } from "./transaction/header.js";
export {
  TransactionsRange,
  GetTransactionsForContractResponse,
} from "./transaction/endpoints/collection.js";
export { TransactionDetails } from "./transaction/details.js";
