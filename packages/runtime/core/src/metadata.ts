/**
 * This module contains the static types and the dynamic guards for the metadata that can be attached to a transaction.
 */
import * as t from "io-ts/lib/index.js";

// NOTE: [[recursive branded types]]
// We are using branded types here to further refine some of the metadata types. For
// example, we use StringUnder64 to represent a string that has 64 or less characters, as
// the ledger won't accept strings longer than that.
// When using branded types, the recursive type definition is a bit more complex, as the
// Output type differents from the Actual type.
// See https://github.com/gcanti/io-ts/issues/604 for more information.

/**
 * This branded type represents a string that is a valid number.
 * "1" is a valid NumberLikeString, "a" is not.
 */
export interface NumberLikeStringBrand {
  readonly NumberLikeString: unique symbol;
}
export const NumberLikeStringGuard = t.brand(
  t.string,
  (s): s is t.Branded<string, NumberLikeStringBrand> =>
    !Number.isNaN(Number(s)),
  "NumberLikeString"
);
export type NumberLikeString = t.TypeOf<typeof NumberLikeStringGuard>;

/**
 * This branded type represents a string that has 64 or less characters.
 */
export interface StringUnder64Brand {
  readonly StringUnder64: unique symbol;
}
export const StringUnder64Guard = t.brand(
  t.string,
  (s): s is t.Branded<string, StringUnder64Brand> => s.length <= 64,
  "StringUnder64"
);
export type StringUnder64 = t.TypeOf<typeof StringUnder64Guard>;

export type MetadatumLabel = t.TypeOf<typeof MetadatumLabelGuard>;
export const MetadatumLabelGuard = t.union([t.number, StringUnder64Guard]);

export type MetadatumRecord = { [Key: StringUnder64 | number]: Metadatum };
export type MetadatumOutputRecord = { [Key: string | number]: MetadatumOutput };
export const MetadatumRecordGuard: t.Type<
  MetadatumRecord,
  MetadatumOutputRecord
> = t.recursion("Metadatum", () =>
  t.record(MetadatumLabelGuard, MetadatumGuard)
);

export type MetadatumArray = Array<Metadatum>;
export type MetadatumOutputArray = Array<MetadatumOutput>;
export const MetadatumArrayGuard: t.Type<MetadatumArray, MetadatumOutputArray> =
  t.recursion("Metadatum", () => t.array(MetadatumGuard));

export type Metadatum =
  | bigint
  | StringUnder64
  | MetadatumArray
  | MetadatumRecord;
export type MetadatumOutput =
  | bigint
  | string
  | MetadatumOutputArray
  | MetadatumOutputRecord;
export const MetadatumGuard: t.Type<Metadatum, MetadatumOutput> = t.recursion(
  "Metadatum",
  () =>
    t.union([
      t.bigint,
      StringUnder64Guard,
      MetadatumArrayGuard,
      MetadatumRecordGuard,
    ])
);

// The top level Metadatum record requires its keys to be either numbers or strings
// that can be coerced into a number
export type MetadatumTopLevelLabel = t.TypeOf<
  typeof MetadatumTopLevelLabelGuard
>;
export const MetadatumTopLevelLabelGuard = t.union([
  t.number,
  NumberLikeStringGuard,
]);

export type Metadata = t.TypeOf<typeof Metadata>;
export const Metadata = t.record(MetadatumTopLevelLabelGuard, MetadatumGuard);
