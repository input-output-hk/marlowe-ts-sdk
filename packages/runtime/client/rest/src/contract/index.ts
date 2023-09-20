/**
 * ```ts
 * import * as C from "@marlowe.io/runtime-rest-client/contract";
 *```
 * @packageDocumentation
 */

// TODO: See what is really needed to be exported
export {ContractHeader} from "./header.js";
// export * from "./details.js";
export {RolesConfig} from "./role.js";
export { GetContractsResponse, GetContractsRequest, ContractsRange, CreateContractRequest } from "./endpoints/collection.js";
