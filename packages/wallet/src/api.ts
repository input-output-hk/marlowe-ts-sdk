
import * as T from 'fp-ts/lib/Task.js'
import * as O from 'fp-ts/lib/Option.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js'

import { AddressBech32, AddressesAndCollaterals, HexTransactionWitnessSet, MarloweTxCBORHex, TxOutRef } from '@marlowe.io/core'
import { TokenValue } from '@marlowe.io/language-core-v1/semantics/contract/common/tokenValue.js';


// N.B : Network Id returned by CIP30 Interface doesn't provide information on which Testnet Network
//       the extension in configured.
export type CIP30Network = "Mainnet" | "Testnets";

export interface WalletAPI {
    waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean>
    signTxTheCIP30Way : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>
    getChangeAddress : T.Task<AddressBech32>
    getUsedAddresses : T.Task<AddressBech32[]>
    getCollaterals : T.Task<TxOutRef[]>
    getCIP30Network: T.Task<CIP30Network> 
    getTokenValues : TE.TaskEither<Error,TokenValue[]>
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

