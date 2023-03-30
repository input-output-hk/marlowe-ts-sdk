import { optionFromNullable } from "io-ts-types"
import { TxOutRef } from "./tx/outRef"
import { AddressBech32 } from "./address"
import * as t from "io-ts";


export type WalletDetails = t.TypeOf<typeof WalletDetails>
export const WalletDetails = t.type(
      { changeAddress: AddressBech32
      , usedAddresses: optionFromNullable(t.array(AddressBech32)) 
      , collateralUTxOs: optionFromNullable(t.array(TxOutRef))
    })  