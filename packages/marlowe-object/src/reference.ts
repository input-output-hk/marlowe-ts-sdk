import * as t from "io-ts/lib/index.js";

/**
 * A label for one of the {@link ObjectType}
 * @category Object
 */
export type Label = string;

export const LabelGuard: t.Type<Label> = t.string;

/**
 * A reference to an {@link ObjectType}.
 * @category Object
 */
export interface Reference {
  ref: Label;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Reference | reference type}.
 * @category Object
 */
export const ReferenceGuard: t.Type<Reference> = t.type({ ref: t.string });
