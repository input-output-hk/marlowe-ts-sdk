import * as t from "io-ts";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";

export type AddressBech32 = Newtype<{ readonly AddressBech32: unique symbol }, string> 
export const AddressBech32 = fromNewtype<AddressBech32>(t.string)
export const unAddressBech32 =  iso<AddressBech32>().unwrap
export const addressBech32 =  iso<AddressBech32>().wrap