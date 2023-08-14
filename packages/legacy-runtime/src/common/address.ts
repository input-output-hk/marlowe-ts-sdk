import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";

import { pipe } from "fp-ts/lib/function.js";
import * as CSL from '@emurgo/cardano-serialization-lib-asmjs'
import { hex } from '@47ng/codec'

export type AddressBech32 = Newtype<{ readonly AddressBech32: unique symbol }, string>
export const AddressBech32 = fromNewtype<AddressBech32>(t.string)
export const unAddressBech32 =  iso<AddressBech32>().unwrap
export const addressBech32 =  iso<AddressBech32>().wrap

export const deserializeAddress : (addressHex:string) =>  AddressBech32 =
  (addressHex) => 
    pipe(CSL.Address.from_bytes(hex.decode(addressHex),).to_bech32()
        ,addressBech32)