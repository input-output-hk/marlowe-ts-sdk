/**
 * Utility functions for bigint.
 */
import * as t from "io-ts/lib/index.js";

export const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);
export const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);

// Check if it is a good idea to always use BigInt as output.
export type BigIntOrNumber = bigint | number;
export const BigIntOrNumberGuard = new t.Type<BigIntOrNumber, bigint, unknown>(
  "BigIntOrNumber",
  (u): u is BigIntOrNumber => typeof u === "bigint" || typeof u === "number",
  (u, c) => {
    if (typeof u === "bigint") {
      return t.success(u);
    } else if (typeof u === "number") {
      return t.success(u);
    } else {
      return t.failure(u, c);
    }
  },
  (u) => BigInt(u)
);
