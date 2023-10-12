import * as t from "io-ts/lib/index.js";
import { failure, success, Type } from "io-ts/lib/index.js";

/**
 * @hidden
 */
export function isBigIntOrNumber(u: unknown): u is bigint | number {
  return typeof u === "bigint" || typeof u === "number";
}

/**
 * @hidden
 */
export function isBigInt(u: unknown): u is bigint {
  return typeof u === "bigint";
}

/**
 * @hidden
 */
export const bigintGuard = new Type<bigint, bigint, unknown>(
  "bigint",
  isBigInt,
  (i, c) => (isBigIntOrNumber(i) ? success(BigInt(i)) : failure(i, c)),
  (number) => number
);

/**
 * A block header has basic information about a cardano block.
 */
export interface BlockHeader {
  // TODO: find global documentation for these fields
  slotNo: bigint;
  blockNo: bigint;
  blockHeaderHash: string;
}
/**
 * @hidden
 */
export const BlockHeaderGuard = t.type({
  slotNo: bigintGuard,
  blockNo: bigintGuard,
  blockHeaderHash: t.string,
});
