
import * as TE from 'fp-ts/lib/TaskEither.js'

import { pipe } from 'fp-ts/lib/function.js'
import * as Contracts from '@marlowe.io/client-rest/contract/id.js';
import * as Tx from '@marlowe.io/client-rest/contract/transaction/id.js';
import * as Withdrawal from '@marlowe.io/client-rest/contract/withdrawal/details.js';
import { RestAPI } from '@marlowe.io/client-rest/index.js';
import { WalletAPI, getAddressesAndCollaterals } from '@marlowe.io/wallet/api';
import { DecodingError } from '@marlowe.io/adapter/codec';
import { CreateRequest, ApplyInputsRequest, WithdrawRequest } from '../../api.js';
import { ContractId } from '@marlowe.io/client-rest/contract/id.js';
import * as WithdrawalId from '@marlowe.io/client-rest/contract/withdrawal/id.js';


export const create
  :  (client : RestAPI)
  => (wallet : WalletAPI)
  => (payload : CreateRequest)
  => TE.TaskEither<Error | DecodingError,ContractId>
  = (client) => (wallet) => (payload) =>
      pipe( getAddressesAndCollaterals (wallet)
          , TE.fromTask
          , TE.chain((addressesAndCollaterals) =>
                client.contracts.post(
                  ( { contract: payload.contract
                    , version: "v1"
                    , roles : payload.roles
                    , tags : payload.tags?payload.tags:{}
                    , metadata: payload.metadata?payload.metadata:{}
                    , minUTxODeposit: payload.minUTxODeposit?payload.minUTxODeposit:3_000_000})
                  , addressesAndCollaterals))
          , TE.chainW((contractTextEnvelope) =>
                pipe ( wallet.signTxTheCIP30Way(contractTextEnvelope.tx.cborHex)
                    , TE.chain((hexTransactionWitnessSet) =>
                          client.contracts.contract.put( contractTextEnvelope.contractId, hexTransactionWitnessSet))
                    , TE.map (() => contractTextEnvelope.contractId)))
          , TE.chainFirstW((contractId) => wallet.waitConfirmation(pipe(contractId, Contracts.idToTxId)))
          )

export const applyInputs
  :  (client : RestAPI)
  => (wallet : WalletAPI)
  => (contractId : ContractId)
  => (payload : ApplyInputsRequest)
  => TE.TaskEither<Error | DecodingError,ContractId>
  = (client) => (wallet) => (contractId) => (payload) =>
      pipe( getAddressesAndCollaterals (wallet)
          , TE.fromTask
          , TE.chain((addressesAndCollaterals) =>
                client.contracts.contract.transactions.post
                    ( contractId
                    , { inputs: payload.inputs
                      , version: "v1"
                      , tags : payload.tags?payload.tags:{}
                      , metadata: payload.metadata?payload.metadata:{}
                      , invalidBefore: payload.invalidBefore
                      , invalidHereafter: payload.invalidHereafter}
                    , addressesAndCollaterals))
          , TE.chainW((transactionTextEnvelope) =>
                pipe ( wallet.signTxTheCIP30Way(transactionTextEnvelope.tx.cborHex)
                      , TE.chain((hexTransactionWitnessSet) =>
                          client.contracts.contract.transactions.transaction.put( contractId,transactionTextEnvelope.transactionId, hexTransactionWitnessSet))
                      , TE.map (() => transactionTextEnvelope.transactionId)))
          , TE.chainFirstW((transactionId) => wallet.waitConfirmation(pipe(transactionId, Tx.idToTxId)))
          , TE.map (() => contractId))

export const withdraw
    :  (client : RestAPI)
    => (wallet : WalletAPI)
    => (payload : WithdrawRequest)
    => TE.TaskEither<Error | DecodingError,Withdrawal.Details>
    = (client) => (wallet) => (payload) =>
        pipe( getAddressesAndCollaterals (wallet)
            , TE.fromTask
            , TE.chain((addressesAndCollaterals) => client.withdrawals.post (payload, addressesAndCollaterals))
            , TE.chainW( (withdrawalTextEnvelope) =>
                pipe ( wallet.signTxTheCIP30Way(withdrawalTextEnvelope.tx.cborHex)
                     , TE.chain ((hexTransactionWitnessSet) => client.withdrawals.withdrawal.put(withdrawalTextEnvelope.withdrawalId,hexTransactionWitnessSet))
                     , TE.map (() => withdrawalTextEnvelope.withdrawalId)))
            , TE.chainFirstW((withdrawalId) => wallet.waitConfirmation(pipe(withdrawalId, WithdrawalId.idToTxId)))
            , TE.chainW ((withdrawalId) => client.withdrawals.withdrawal.get(withdrawalId)) )