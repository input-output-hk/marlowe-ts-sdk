
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'

import { HexTransactionWitnessSet, MarloweTxCBORHex } from '../runtime/common/textEnvelope';
import { optionFromNullable } from "io-ts-types"
import { TxOutRef } from "../runtime/common/tx/outRef"
import { AddressBech32 } from "../runtime/common/address"
import * as t from "io-ts";
import { pipe } from 'fp-ts/lib/function';


export type AddressesAndCollaterals = t.TypeOf<typeof AddressesAndCollaterals>
export const AddressesAndCollaterals = t.type(
      { changeAddress: AddressBech32
      , usedAddresses: optionFromNullable(t.array(AddressBech32)) 
      , collateralUTxOs: optionFromNullable(t.array(TxOutRef))
    })  

export interface WalletAPI {
    waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean>
    signTxTheCIP30Way : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>
    getChangeAddress : T.Task<AddressBech32>
    getUsedAddresses : T.Task<AddressBech32[]>
    getCollaterals : T.Task<TxOutRef[]>
}

export const getAddressesAndCollaterals : (walletAPI : WalletAPI)  => T.Task<AddressesAndCollaterals> =
        (walletAPI) => 
          pipe( T.Do
              , T.bind('changeAddress',() => walletAPI.getChangeAddress)
              , T.bind('usedAddresses',() => walletAPI.getUsedAddresses)
              , T.bind('collateralUTxOs'  ,() => walletAPI.getCollaterals)
              , T.map (({changeAddress,usedAddresses,collateralUTxOs}) => 
                    ({changeAddress: changeAddress
                     ,usedAddresses: usedAddresses.length == 0 ? O.none : O.some(usedAddresses) 
                     ,collateralUTxOs: collateralUTxOs.length == 0 ? O.none : O.some(collateralUTxOs)}))
              )

