/**
 * Utility functions for bigint.
 */
import * as t from "io-ts/lib/index.js";

export const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);
export const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);

// The following type and guard are used to represent a number that can be either a bigint or a number.
// The guard always encode the number as a bigint (when outputting a value).
// NOTE: I'm not sure if is better to have this or to have a guard that accepts both bigint and number
//       as input but has bigint as `A`ctual type and `O`utput type.
//       A good reason to have BigIntOrNumber as Actual type is that it is easier to construct values
//       (as you can omit the final `n`), but a drawback is that in usage you might need to cast
//       to `Number(actual)` or `BigInt(actual)` depending on context.
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
