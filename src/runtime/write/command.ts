
import * as TE from 'fp-ts/TaskEither'
import * as ContractCollection from '@runtime/contract/endpoints/collection';
import * as TransactionCollection from '@runtime/contract/transaction/endpoints/collection';
import * as WithdrawalCollection from '@runtime/contract/withdrawal/endpoints/collection';
import { DecodingError } from '@runtime/common/codec';
import { ContractDetails } from '@runtime/contract/details';
import { pipe } from 'fp-ts/function'
import { WalletDetails } from '@runtime/common/wallet';
import { HexTransactionWitnessSet, MarloweTxCBORHex } from '@runtime/common/textEnvelope';
import { ContractId } from '@runtime/contract/id';
import * as Contract from '@runtime/contract/id';
import * as Tx from '@runtime/contract/transaction/id';
import * as Transaction from '@runtime/contract/transaction/details';
import * as Withdrawal from '@runtime/contract/withdrawal/details';
import * as WithdrawalId from '@runtime/contract/withdrawal/id';
import { RestAPI } from '@runtime/endpoints';


export type InitialisePayload  = ContractCollection.PostContractsRequest
export type ApplyInputsPayload = TransactionCollection.PostTransactionsRequest
export type WithdrawPayload = WithdrawalCollection.PostWithdrawalsRequest

export const initialise : 
  (client : RestAPI)
  => (waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean>)  
  => (signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>)
  => (walletDetails:WalletDetails) 
  => (payload : InitialisePayload)
  => TE.TaskEither<Error | DecodingError,ContractDetails> 
  = (client) => (waitConfirmation) => (sign)  => (walletDetails) => (payload) =>  
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
  => (waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean>)  
  => (signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>)
  => (walletDetails:WalletDetails) 
  => (contractId : ContractId) 
  => ( payload : ApplyInputsPayload) 
  => TE.TaskEither<Error | DecodingError,Transaction.Details> 
  = (client) => (waitConfirmation) => (sign) => (walletDetails) => (contractId) => (payload) =>   
      pipe( client.contracts.contract.transactions.post(contractId, payload, walletDetails)
          , TE.chainW((transactionTextEnvelope) => 
                pipe ( sign(transactionTextEnvelope.tx.cborHex)
                      , TE.chain((hexTransactionWitnessSet) => 
                          client.contracts.contract.transactions.transaction.put( contractId,transactionTextEnvelope.transactionId, hexTransactionWitnessSet))
                      , TE.map (() => transactionTextEnvelope.transactionId)))
          , TE.chainFirstW((transactionId) => waitConfirmation(pipe(transactionId, Tx.idToTxId)))
          , TE.chainW ((transactionId) => 
              client.contracts.contract.transactions.transaction.get(contractId,transactionId)))

export const withdraw : 
    (client : RestAPI)
    => (waitConfirmation : (txHash : string ) => TE.TaskEither<Error,boolean>)  
    => (signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>)
    => (walletDetails:WalletDetails) 
    => ( payload : WithdrawPayload) 
    => TE.TaskEither<Error | DecodingError,Withdrawal.Details> 
    = (client) => (waitConfirmation) => (sign) => (walletDetails) => (payload) =>   
        pipe( client.withdrawals.post (payload, walletDetails) 
        , TE.chainW( (withdrawalTextEnvelope) =>
            pipe ( sign(withdrawalTextEnvelope.tx.cborHex)  
                , TE.chain ((hexTransactionWitnessSet) => client.withdrawals.withdrawal.put(withdrawalTextEnvelope.withdrawalId,hexTransactionWitnessSet))
                , TE.map (() => withdrawalTextEnvelope.withdrawalId)))
        , TE.chainFirstW((withdrawalId) => waitConfirmation(pipe(withdrawalId, WithdrawalId.idToTxId)))
        , TE.chainW ((withdrawalId) => client.withdrawals.withdrawal.get(withdrawalId)) ) 