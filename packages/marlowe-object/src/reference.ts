import * as t from "io-ts/lib/index.js";

/**
 * A label for one of the {@link @marlowe.io/marlowe-object.bundle-list.ObjectType}
 * @category Object
 */
export type Label = string;

export const LabelGuard: t.Type<Label> = t.string;

/**
 * A label for one of the {@link @marlowe.io/marlowe-object.bundle-list.ObjectType}
 * @category Object
 */
export type ContractSourceId = string;

export const ContractSourceIdGuard: t.Type<ContractSourceId> = t.string;

/**
 * A reference to an {@link @marlowe.io/marlowe-object.bundle-list.ObjectType}.
 * @category Object
 */
export interface Reference {
  ref: Label;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Reference | reference type}.
 * @category Object
 */
export const ReferenceGuard: t.Type<Reference> = t.type({
  ref: ContractSourceIdGuard,
});
