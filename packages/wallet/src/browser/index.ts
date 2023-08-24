import * as T from 'fp-ts/lib/Task.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as A from 'fp-ts/lib/Array.js'

import { token } from '@marlowe.io/language-core-v1/token';
import { TokenValue, lovelaceValue, tokenValue } from '@marlowe.io/language-core-v1/tokenValue';

import { CIP30Network, WalletAPI } from '../api.js';
import { C,Core } from 'lucid-cardano';
import { hex, utf8 } from '@47ng/codec'
import { MarloweTxCBORHex, HexTransactionWitnessSet, AddressBech32, TxOutRef, addressBech32, txOutRef } from '@marlowe.io/runtime-core';


export const getExtensionInstance : (extensionName : string) => T.Task<WalletAPI> = (extensionName) =>
    pipe(() =>  window.cardano[extensionName.toLowerCase()].enable()
        ,T.map (extensionCIP30Instance =>
            ({ waitConfirmation: waitConfirmation
             , signTxTheCIP30Way : signMarloweTx(extensionCIP30Instance)
             , getChangeAddress : fetchChangeAddress(extensionCIP30Instance)
             , getUsedAddresses : fetchUsedAddresses(extensionCIP30Instance)
             , getCollaterals : fetchCollaterals(extensionCIP30Instance)
             , getTokenValues : fetchTokenValues(extensionCIP30Instance)
             , getCIP30Network : fetchCIP30Network(extensionCIP30Instance)
            })) )


const waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean> = (txHash) => TE.of (true)

const signMarloweTx : (extensionCIP30Instance : BroswerExtensionCIP30Api) => (cborHex :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet> =
  (extensionCIP30Instance) => (cborHex) => pipe( () => extensionCIP30Instance.signTx (cborHex,true), TE.fromTask)


const fetchChangeAddress : (extensionCIP30Instance : BroswerExtensionCIP30Api)  => T.Task<AddressBech32> =
  (extensionCIP30Instance) =>
    pipe( T.Do
        , T.bind('changeAddress',() => pipe(() => extensionCIP30Instance.getChangeAddress ()))
        , T.map (({changeAddress}) => deserializeAddress(changeAddress))
        )

const fetchUsedAddresses : (extensionCIP30Instance : BroswerExtensionCIP30Api)  => T.Task<AddressBech32[]> =
        (extensionCIP30Instance) =>
          pipe( T.Do
              , T.bind('usedAddresses',() => pipe(() => extensionCIP30Instance.getUsedAddresses ()))
              , T.map (({usedAddresses}) => pipe( usedAddresses, A.map(deserializeAddress)))
              )

const fetchCIP30Network : (extensionCIP30Instance : BroswerExtensionCIP30Api)  => T.Task<CIP30Network> =
  (extensionCIP30Instance) =>
    pipe( T.Do
        , T.bind('networkId'  ,() => pipe(() => extensionCIP30Instance.getNetworkId()))
        , T.map (({networkId}) =>  networkId == 1 ? "Mainnet" : "Testnets")
        )

const fetchCollaterals : (extensionCIP30Instance : BroswerExtensionCIP30Api)  => T.Task<TxOutRef[]> =
              (extensionCIP30Instance) =>
                pipe( T.Do
                    , T.bind('collaterals'  ,() => pipe(() => extensionCIP30Instance.experimental.getCollateral()))
                    , T.map (({collaterals}) =>  collaterals == undefined ? [] : pipe( collaterals, A.map(deserializeCollateral)))
                    )

const deserializeAddress : (addressHex:string) =>  AddressBech32 =
    (addressHex) => 
      pipe(C.Address.from_bytes(hex.decode(addressHex),).to_bech32(undefined)
          ,addressBech32)


const deserializeCollateral : (collateral:string) =>  TxOutRef 
  = (collateral) => 
    pipe( C.TransactionUnspentOutput.from_bytes(hex.decode(collateral))
        , utxo => txOutRef (utxo.input().transaction_id().to_hex() + '#' + utxo.input().index().toString()))

type DataSignature = {
    signature: string;
    key: string;
};


type Cardano = {
  [key: string]: {
    name: string;
    icon: string;
    apiVersion: string;
    enable: () => Promise<BroswerExtensionCIP30Api>;
  };
};

type BroswerExtensionCIP30Api = {
    experimental: ExperimentalFeatures;
    getBalance(): Promise<string>;
    getChangeAddress(): Promise<string>;
    getNetworkId(): Promise<number>;
    getRewardAddresses(): Promise<string[]>;
    getUnusedAddresses(): Promise<string[]>;
    getUsedAddresses(): Promise<string[]>;
    getUtxos(): Promise<string[] | undefined>;
    signData(address: string, payload: string): Promise<DataSignature>;
    signTx(tx: string, partialSign: boolean): Promise<string>;
    submitTx(tx: string): Promise<string>;
  };

type ExperimentalFeatures = {
    getCollateral(): Promise<string[] | undefined>;
  };


const fetchTokenValues : (extensionCIP30Instance : BroswerExtensionCIP30Api) => TE.TaskEither<Error,TokenValue[]>
  = (extensionCIP30Instance) =>
    pipe
    ( () => extensionCIP30Instance.getBalance()
    , T.map((balances) => fromValue(deserializeValue(balances)))
    , TE.fromTask)

const deserializeValue = (value: string) => C.Value.from_bytes(hex.decode(value));

const fromValue = (value: Core.Value) => {
  const tokenValues: TokenValue[] = [ lovelaceValue(BigInt(value.coin().to_str()).valueOf())]

  const multiAsset = value.multiasset();
  if (multiAsset !== undefined) {
    const policies = multiAsset.keys();
    for (let i = 0; i < policies.len(); i += 1) {
      const policyId = policies.get(i);
      const policyAssets = multiAsset.get(policyId);
      if (policyAssets !== undefined) {
        const policyAssetNames = policyAssets.keys();
        for (let j = 0; j < policyAssetNames.len(); j += 1) {
          const assetName = policyAssetNames.get(j);
          const quantity = policyAssets.get(assetName) ?? C.BigNum.from_str('0');
          tokenValues.push(
            tokenValue
              (BigInt(quantity.to_str()).valueOf())
              (token
                (policyId.to_hex()
                ,utf8.decode(assetName.to_bytes()).substring(1) // N.H : investigate why 1 aditional character is returned
              )));
        }
      }
    }
  }

  return tokenValues;
};