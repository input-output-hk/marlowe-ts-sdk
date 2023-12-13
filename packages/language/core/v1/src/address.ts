import { unsafeEither } from "@marlowe.io/adapter/fp-ts";
import * as t from "io-ts/lib/index.js";

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link @marlowe.io/language-core-v1!index.Address | Address type}.
 * @category Address
 */
export interface AddressBech32Brand {
  readonly AddressBech32: unique symbol;
}

export const AddressBech32Guard = t.brand(
  t.string,
  (s): s is t.Branded<string, AddressBech32Brand> => true, // Todo : Enforce Cardano Address Formats
  "AddressBech32"
);

/**
 *  Cardano Address in a Bech32 format Type
 *  @category Address
 */
export type AddressBech32 = t.TypeOf<typeof AddressBech32Guard>;

/**
 *  Cardano Address in a Bech32 format Constructor
 *  @category Address
 */
export const addressBech32 = (s: string) =>
  unsafeEither(AddressBech32Guard.decode(s));
