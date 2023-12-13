import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { TxOutRef } from "./tx/outRef.js";
import { unsafeEither } from "@marlowe.io/adapter/fp-ts";

export interface AddressBech32Brand {
  readonly AddressBech32: unique symbol;
}

export const AddressBech32Guard = t.brand(
  t.string,
  (s): s is t.Branded<string, AddressBech32Brand> => true,
  "AddressBech32"
);

export type AddressBech32 = t.TypeOf<typeof AddressBech32Guard>;

export const addressBech32 = (s: string) =>
  unsafeEither(AddressBech32Guard.decode(s));

export type AddressesAndCollaterals = t.TypeOf<typeof AddressesAndCollaterals>;
export const AddressesAndCollaterals = t.type({
  changeAddress: AddressBech32Guard,
  usedAddresses: t.array(AddressBech32Guard),
  collateralUTxOs: t.array(TxOutRef),
});

export type StakeAddressBech32 = Newtype<
  { readonly StakeAddressBech32: unique symbol },
  string
>;
export const StakeAddressBech32 = fromNewtype<StakeAddressBech32>(t.string);
export const unStakeAddressBech32 = iso<StakeAddressBech32>().unwrap;
export const stakeAddressBech32 = iso<StakeAddressBech32>().wrap;
