import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";
import { TxOutRef } from "./tx/outRef.js";

export type AddressBech32 = Newtype<
  { readonly AddressBech32: unique symbol },
  string
>;
export const AddressBech32 = fromNewtype<AddressBech32>(t.string);
export const unAddressBech32 = iso<AddressBech32>().unwrap;
export const addressBech32 = iso<AddressBech32>().wrap;

export type AddressesAndCollaterals = t.TypeOf<typeof AddressesAndCollaterals>;
export const AddressesAndCollaterals = t.type({
  changeAddress: AddressBech32,
  usedAddresses: t.array(AddressBech32),
  collateralUTxOs: t.array(TxOutRef),
});

export type StakeAddressBech32 = Newtype<
  { readonly StakeAddressBech32: unique symbol },
  string
>;
export const StakeAddressBech32 = fromNewtype<StakeAddressBech32>(t.string);
export const unStakeAddressBech32 = iso<StakeAddressBech32>().unwrap;
export const stakeAddressBech32 = iso<StakeAddressBech32>().wrap;
