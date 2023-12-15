/**
 * <h4>Contract Examples</h4>
 * <p>
 * Here are examples of contracts that you can reuse/modify at your free will.</p>
 *
 * Some of them are used in prototypes, others only in tests or in our examples folder at the root of this project:
 * - Vesting : https://github.com/input-output-hk/marlowe-token-plans
 * - Swap : https://github.com/input-output-hk/marlowe-order-book-swap
 * - Survey : https://github.com/input-output-hk/marlowe-ts-sdk/tree/main/examples/survey-workshop
 *
 *
 * @packageDocumentation
 */

export * as Vesting from "./vesting.js";
export * as AtomicSwap from "./atomicSwap.js";
export * as Survey from "./survey.js";
export { oneNotifyTrue } from "./contract-one-notify.js";
export { escrow } from "./playground-v1/escrow.js";
export { escrowWithCollateral } from "./playground-v1/escrow-with-collateral.js";
