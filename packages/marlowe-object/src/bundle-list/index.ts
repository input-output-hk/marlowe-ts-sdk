/**
 * This module allows to bundle different {@link ObjectType | ObjectTypes} in a sorted list.
 * To create a valid bundle, an Object needs to be defined before making a reference to it.
 *
 * You can use {@link index.bundleListToMap} to convert to {@link bundle-map.ContractBundleMap} while checking for
 * the integrity of the bundle.
 * ```
 * import { ContractBundleList, close, lovelace } from "@marlowe.io/marlowe-object"
 *
 * type MyContractAnnotation = "AnnotationA" | "AnnotationB" | "AnnotationC";
 *
 * const example: ContractBundleList<MyContractAnnotation> = {
 *   main: "main",
 *   bundle: [
 *     { label: "partyA", type: "party", value: { role_token: "partyA" } },
 *     {
 *       label: "partyADeposits",
 *       type: "action",
 *       value: {
 *         party: { ref: "partyA" },
 *         deposits: 1000000n,
 *         of_token: lovelace,
 *         into_account: { ref: "partyA" },
 *       },
 *     },
 *     {
 *       label: "main",
 *       type: "contract",
 *       value: {
 *         annotation: "AnnotationA",
 *         when: [{ case: { ref: "partyADeposits" }, then: close("AnnotationB") }],
 *         timeout: 10000n,
 *         timeout_continuation: close("AnnotationC"),
 *       },
 *     },
 *   ],
 * };
 * ```
 * @packageDocumentation
 */
export {
  ObjectParty,
  ObjectValue,
  ObjectObservation,
  ObjectToken,
  ObjectContract,
  ObjectAction,
  ObjectType,
  BundleList,
  ContractBundleList,
} from "./bundle-list.js";
