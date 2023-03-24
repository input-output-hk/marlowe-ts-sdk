/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import * as TE from 'fp-ts/TaskEither'
import * as ContractCollection from '../contract/endpoints/collection';
import * as TransactionCollection from '../contract/transaction/endpoints/collection';
import { DecodingError } from '../common/codec';
import { ContractDetails } from '../contract/details';
import { pipe } from 'fp-ts/function'
import { WalletDetails } from '../common/wallet';
import { HexTransactionWitnessSet, MarloweTxCBORHex } from '../common/textEnvelope';
import { ContractId } from '../contract/id';
import * as Contract from '../contract/id';
import * as Tx from '../contract/transaction/id';
import * as Transaction from '../contract/transaction/details';
import { RestAPI } from 'runtime/endpoints';


export type InitialisePayload  = ContractCollection.PostContractsRequest
export type ApplyInputsPayload = TransactionCollection.PostTransactionsRequest


export const initialise : 
  (client : RestAPI)
    => (signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>)
    => (waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean>)  
    => (walletDetails:WalletDetails) 
    => (payload : InitialisePayload)
    => TE.TaskEither<Error | DecodingError,ContractDetails> 
  = (client) => (sign) => (waitConfirmation) => (walletDetails) => (payload) =>  
      pipe( client.contracts.post( payload, walletDetails)
          , TE.chainW((contractTextEnvelope) => 
                pipe ( sign(contractTextEnvelope.tx.cborHex)
                    , TE.chain((hexTransactionWitnessSet) => 
                          client.contracts.contract.put( contractTextEnvelope.contractId, hexTransactionWitnessSet))
                    , TE.map (() => contractTextEnvelope.contractId)))
          , TE.chainFirstW((contractId) => waitConfirmation(pipe(contractId, Contract.idToTxId)))
          , TE.chainW ((contractId) => client.contracts.contract.get(contractId)))

export const applyInputs : 
  (client : RestAPI)
  => (signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>)
  => (waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean>)  
  => (walletDetails:WalletDetails) 
  => (contractId : ContractId) 
  => ( payload : ApplyInputsPayload) 
  => TE.TaskEither<Error | DecodingError,Transaction.Details> 
  = (client) => (sign) => (waitConfirmation) => (walletDetails) => (contractId) => (payload) =>   
      pipe( client.contracts.contract.transactions.post(contractId, payload, walletDetails)
          , TE.chainW((transactionTextEnvelope) => 
                pipe ( sign(transactionTextEnvelope.tx.cborHex)
                      , TE.chain((hexTransactionWitnessSet) => 
                          client.contracts.contract.transactions.transaction.put( contractId,transactionTextEnvelope.transactionId, hexTransactionWitnessSet))
                      , TE.map (() => transactionTextEnvelope.transactionId)))
          , TE.chainFirstW((transactionId) => waitConfirmation(pipe(transactionId, Tx.idToTxId)))
          , TE.chainW ((transactionId) => 
              client.contracts.contract.transactions.transaction.get(contractId,transactionId)))